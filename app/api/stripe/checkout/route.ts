import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import { config, ALLOWED_PRICE_IDS } from '@/lib/config';
import { checkoutRateLimit } from '@/lib/rateLimit';
import { APIError, handleAPIError, logRequest } from '@/lib/api/errorHandler';
import { randomUUID } from 'crypto';

const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const { userId } = await auth();
    if (!userId) {
      throw new APIError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    logRequest({
      requestId,
      method: 'POST',
      path: '/api/stripe/checkout',
      userId,
    });

    // Rate limiting
    const { success } = await checkoutRateLimit.limit(userId);
    if (!success) {
      throw new APIError(
        'Too many checkout attempts. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { priceId } = body;

    if (!priceId || typeof priceId !== 'string') {
      throw new APIError('Price ID is required', 400, 'INVALID_INPUT');
    }

    // Validate price ID against whitelist
    if (!ALLOWED_PRICE_IDS.includes(priceId)) {
      throw new APIError('Invalid price ID', 400, 'INVALID_PRICE_ID');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    let customerId = user.stripeId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          clerkId: user.clerkId,
          userId: user.id,
        },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { clerkId: user.clerkId },
        data: { stripeId: customerId },
      });

      console.log(`Created Stripe customer ${customerId} for user ${user.id}`);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          clerkId: userId,
          userId: user.id,
        },
      },
      success_url: `${config.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${config.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
    });

    console.log(
      JSON.stringify({
        requestId,
        action: 'checkout_session_created',
        sessionId: session.id,
        userId: user.id,
      })
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}

// Reject other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
