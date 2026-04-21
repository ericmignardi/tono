import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma/database';
import { config, FREE_CREDIT_LIMIT, PRO_CREDIT_LIMIT } from '@/lib/config';

const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, config.STRIPE_WEBHOOK_SECRET);
    console.log(`Webhook verified: ${event.type} (${event.id})`);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return new NextResponse(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      { status: 400 }
    );
  }

  try {
    // Skip only if a prior delivery fully processed this event. If a previous
    // attempt crashed mid-handler, `processed` is still false and we must retry
    // — otherwise Stripe's redelivery would be silently dropped and we'd lose
    // the upgrade/cancel/payment event permanently.
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    });

    if (existingEvent?.processed) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new NextResponse(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Record (or reset) this event. Upsert lets us retry a previously failed
    // attempt without violating the unique constraint.
    await prisma.webhookEvent.upsert({
      where: { eventId: event.id },
      create: {
        eventId: event.id,
        type: event.type,
        processed: false,
      },
      update: {
        error: null,
      },
    });

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed: ${session.id}`);

        if (session.mode === 'subscription' && typeof session.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription, {
            expand: ['items.data.price'],
          });
          await handleSubscriptionChange(subscription, 'created');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id}`);

        if (subscription.cancel_at_period_end) {
          console.log(`Subscription ${subscription.id} scheduled for cancellation at period end`);
        }

        await handleSubscriptionChange(subscription, 'updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${subscription.id}`);

        const customerId = subscription.customer as string;
        const user = await prisma.user.findFirst({
          where: { stripeId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              generationsLimit: FREE_CREDIT_LIMIT,
              generationsUsed:
                user.generationsUsed > FREE_CREDIT_LIMIT ? FREE_CREDIT_LIMIT : user.generationsUsed,
            },
          });
          console.log(`User ${user.id} downgraded to free tier`);
        }

        await prisma.subscription.deleteMany({
          where: { stripeId: subscription.id },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = extractSubscriptionId(invoice);

        if (!subscriptionId) {
          console.warn('Invoice has no subscription ID, skipping');
          break;
        }

        await prisma.subscription.updateMany({
          where: { stripeId: subscriptionId },
          data: { status: 'past_due' },
        });
        console.warn(`Payment failed for subscription: ${subscriptionId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Only reset credits on actual renewal cycles. The initial subscription
        // payment is handled by checkout.session.completed (which resets via
        // handleSubscriptionChange), and manual/one-off invoices shouldn't
        // touch the credit counter.
        if (invoice.billing_reason !== 'subscription_cycle') {
          break;
        }

        const subscriptionId = extractSubscriptionId(invoice);
        if (!subscriptionId) {
          console.warn('Renewal invoice has no subscription ID, skipping');
          break;
        }

        const sub = await prisma.subscription.findUnique({
          where: { stripeId: subscriptionId },
          select: { userId: true },
        });

        if (!sub) {
          console.error(`Subscription ${subscriptionId} not found for renewal`);
          break;
        }

        await prisma.user.update({
          where: { id: sub.userId },
          data: {
            generationsUsed: 0,
            generationsLimit: PRO_CREDIT_LIMIT,
            lastResetDate: new Date(),
          },
        });
        console.log(`Renewed: credits reset for user ${sub.userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: { processed: true },
    });

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);

    // Update webhook event with error
    try {
      await prisma.webhookEvent.update({
        where: { eventId: event.id },
        data: {
          processed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (updateError) {
      console.error('Failed to update webhook event:', updateError);
    }

    // Return 200 to prevent Stripe from retrying on business logic errors.
    // Only truly transient failures (e.g. DB connection) should cause retries,
    // and those would fail before reaching this point.
    return new NextResponse(JSON.stringify({ error: 'Webhook handler failed', received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  eventType: 'created' | 'updated'
) {
  const customerId = subscription.customer as string;

  console.log(`Looking for user with Stripe ID: ${customerId}`);

  const user = await prisma.user.findFirst({
    where: { stripeId: customerId },
  });

  if (!user) {
    // Log but don't throw — returning here lets the webhook respond with 200
    // so Stripe won't retry endlessly for a user that genuinely doesn't exist.
    console.error(`User not found for Stripe customer ${customerId}`);
    return;
  }

  console.log(`Found user: ${user.id} (${user.email})`);

  const subscriptionItem = subscription.items.data[0];

  if (!subscriptionItem) {
    console.warn(`Subscription ${subscription.id} has no items`);
    return;
  }

  const priceRaw = subscriptionItem.price;
  const priceId = typeof priceRaw === 'string' ? priceRaw : (priceRaw?.id ?? 'unknown');

  // In Stripe API 2025-10-29.clover, current_period_end is on SubscriptionItem
  const currentPeriodEnd = subscriptionItem.current_period_end;
  const periodEnd = new Date(currentPeriodEnd * 1000);

  console.log(
    `Processing subscription: ${subscription.id}, status: ${subscription.status}, period end: ${periodEnd}`
  );

  const isActiveSubscription = ['active', 'trialing'].includes(subscription.status);

  if (eventType === 'created' && isActiveSubscription) {
    // Fresh upgrade: reset usage so the user gets a full Pro allotment from
    // the moment they pay, not "Pro limit minus whatever they used on Free".
    await prisma.user.update({
      where: { id: user.id },
      data: {
        generationsLimit: PRO_CREDIT_LIMIT,
        generationsUsed: 0,
        lastResetDate: new Date(),
      },
    });
    console.log(`User ${user.id} upgraded to PRO (${PRO_CREDIT_LIMIT} credits)`);
  } else if (eventType === 'updated') {
    if (isActiveSubscription) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          generationsLimit: PRO_CREDIT_LIMIT,
        },
      });
      console.log(`User ${user.id} subscription active - PRO limits maintained`);
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      console.warn(`User ${user.id} subscription status: ${subscription.status}`);
    }
  }

  await prisma.subscription.upsert({
    where: { stripeId: subscription.id },
    update: {
      status: subscription.status,
      priceId,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      stripeId: subscription.id,
      status: subscription.status,
      priceId,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      userId: user.id,
    },
  });

  console.log(`Subscription synced: ${subscription.id} for user ${user.id}`);
}

// In Stripe API 2025-10-29.clover, `invoice.subscription` was removed in favor
// of `invoice.parent.subscription_details.subscription`. Centralize the lookup
// so all invoice handlers stay in sync.
function extractSubscriptionId(invoice: Stripe.Invoice): string | undefined {
  const parent = invoice.parent;
  if (parent?.type !== 'subscription_details') return undefined;
  const sub = parent.subscription_details?.subscription;
  if (!sub) return undefined;
  return typeof sub === 'string' ? sub : sub.id;
}

// Reject other methods
export async function GET() {
  return new NextResponse('Method not allowed', { status: 405 });
}
