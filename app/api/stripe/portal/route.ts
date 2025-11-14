import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !user.stripeId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create portal session', details: errorMessage },
      { status: 500 }
    );
  }
}
