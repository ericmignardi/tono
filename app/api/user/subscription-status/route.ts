import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ hasActiveSubscription: false }, { status: 200 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['active', 'trialing'],
            },
          },
        },
      },
    });

    const hasActiveSubscription = dbUser?.subscriptions && dbUser.subscriptions.length > 0;

    return NextResponse.json({
      hasActiveSubscription,
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ hasActiveSubscription: false }, { status: 500 });
  }
}
