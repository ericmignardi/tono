import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Credit limits
const FREE_CREDIT_LIMIT = 5;
const PRO_CREDIT_LIMIT = 50;

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
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    console.log(`Webhook verified: ${event.type}`);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return new NextResponse(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      { status: 400 }
    );
  }

  try {
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

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription created: ${subscription.id}`);
        await handleSubscriptionChange(subscription, 'created');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id}`);

        // Log if user scheduled cancellation
        if (subscription.cancel_at_period_end) {
          console.log(`Subscription ${subscription.id} scheduled for cancellation at period end`);
        }

        await handleSubscriptionChange(subscription, 'updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${subscription.id}`);

        // Find user and restore to free tier
        const customerId = subscription.customer as string;
        const user = await prisma.user.findFirst({
          where: { stripeId: customerId },
        });

        if (user) {
          // Reset to free tier limits
          await prisma.user.update({
            where: { id: user.id },
            data: {
              generationsLimit: FREE_CREDIT_LIMIT,
              // Cap used credits to free limit if they exceed it
              generationsUsed:
                user.generationsUsed > FREE_CREDIT_LIMIT ? FREE_CREDIT_LIMIT : user.generationsUsed,
            },
          });
          console.log(`User ${user.email} downgraded to free tier`);
        }

        // Delete subscription record
        await prisma.subscription.deleteMany({
          where: { stripeId: subscription.id },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        const invoiceWithSubscription = invoice as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription;
        };

        let subscriptionId: string | undefined;
        if (typeof invoiceWithSubscription.subscription === 'string') {
          subscriptionId = invoiceWithSubscription.subscription;
        } else if (
          invoiceWithSubscription.subscription &&
          typeof invoiceWithSubscription.subscription === 'object'
        ) {
          subscriptionId = invoiceWithSubscription.subscription.id;
        }

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

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
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
    console.error(`User not found for Stripe customer ${customerId}`);
    return;
  }

  console.log(`Found user: ${user.id} (${user.email})`);

  const subscriptionItem = subscription.items.data[0];

  if (!subscriptionItem) {
    console.warn(`Subscription ${subscription.id} has no items`);
    return;
  }

  const subscriptionItemWithPeriod = subscriptionItem as Stripe.SubscriptionItem & {
    current_period_end?: number;
  };

  const currentPeriodEnd = subscriptionItemWithPeriod.current_period_end;

  if (!currentPeriodEnd) {
    console.warn(`Subscription item ${subscriptionItem.id} missing current_period_end`);
    return;
  }

  const priceRaw = subscriptionItem.price;
  const priceId = typeof priceRaw === 'string' ? priceRaw : (priceRaw?.id ?? 'unknown');
  const periodEnd = new Date(currentPeriodEnd * 1000);

  console.log(
    `Processing subscription: ${subscription.id}, status: ${subscription.status}, period end: ${periodEnd}`
  );

  // Only increase credit limit when subscription is created or becomes active
  const isActiveSubscription = ['active', 'trialing'].includes(subscription.status);

  if (eventType === 'created' && isActiveSubscription) {
    // New subscription - upgrade to pro
    await prisma.user.update({
      where: { id: user.id },
      data: { generationsLimit: PRO_CREDIT_LIMIT },
    });
    console.log(`User ${user.email} upgraded to PRO (${PRO_CREDIT_LIMIT} credits)`);
  } else if (eventType === 'updated') {
    // Subscription updated - check status
    if (isActiveSubscription) {
      // Ensure they have pro limits
      await prisma.user.update({
        where: { id: user.id },
        data: { generationsLimit: PRO_CREDIT_LIMIT },
      });
      console.log(`User ${user.email} subscription active - PRO limits maintained`);
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      // Subscription in bad state - consider downgrading
      console.warn(`User ${user.email} subscription status: ${subscription.status}`);
    }
  }

  // Upsert subscription record
  await prisma.subscription.upsert({
    where: { stripeId: subscription.id },
    update: {
      status: subscription.status,
      priceId,
      currentPeriodEnd: periodEnd,
    },
    create: {
      stripeId: subscription.id,
      status: subscription.status,
      priceId,
      currentPeriodEnd: periodEnd,
      userId: user.id,
    },
  });

  console.log(`Subscription synced: ${subscription.id} for user ${user.email}`);
}
