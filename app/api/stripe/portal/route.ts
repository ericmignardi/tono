import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import { config } from '@/lib/config';
import { portalRateLimit } from '@/lib/rateLimit';
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
      path: '/api/stripe/portal',
      userId,
    });

    // Rate limiting
    const { success } = await portalRateLimit.limit(userId);
    if (!success) {
      throw new APIError(
        'Too many portal requests. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.stripeId) {
      throw new APIError('No subscription found', 404, 'NO_SUBSCRIPTION');
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeId,
      return_url: `${config.NEXT_PUBLIC_URL}/dashboard`,
    });

    console.log(
      JSON.stringify({
        requestId,
        action: 'portal_session_created',
        userId: user.id,
      })
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    return handleAPIError(error, requestId);
  }
}

// Reject other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
