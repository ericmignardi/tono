import { AlertCircle, Plus } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma/database';
import Link from 'next/link';
import ManageSubscriptionButton from '@/components/dashboard/ManageSubscriptionButton';
import { differenceInDays } from 'date-fns';
import Stats from '@/components/dashboard/Stats';
import { Suspense } from 'react';
import RecentTones from '@/components/dashboard/RecentTones';
import StatsSkeleton from '@/components/dashboard/StatsSkeleton';
import RecentTonesSkeleton from '@/components/dashboard/RecentTonesSkeleton';

// ISR: Revalidate this page every 60 seconds
export const revalidate = 60;

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    return null;
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
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  const hasActiveSubscription = dbUser?.subscriptions && dbUser.subscriptions.length > 0;
  const activeSubscription = hasActiveSubscription ? dbUser.subscriptions[0] : null;

  // Check if subscription is set to cancel
  const isCanceling =
    activeSubscription?.status === 'active' && activeSubscription.currentPeriodEnd;
  const periodEndDate = activeSubscription?.currentPeriodEnd
    ? new Date(activeSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
  const todaysDate = new Date();
  const endingSoon = activeSubscription?.currentPeriodEnd
    ? differenceInDays(activeSubscription.currentPeriodEnd, todaysDate)
    : null;

  const firstName = user.firstName || user.fullName?.split(' ')[0] || 'there';

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {firstName}!
          </h1>
          {hasActiveSubscription && <ManageSubscriptionButton />}
        </div>
        <p className="text-slate-500">Here's a quick overview of your tone profile.</p>
      </div>

      {/* Cancellation Notice */}
      {isCanceling && endingSoon !== null && endingSoon <= 7 && endingSoon >= 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Ending</AlertTitle>
          <AlertDescription>
            Your Premium subscription will end on <strong>{periodEndDate}</strong> You'll still have
            full access until then. Your credit limit will return to 5 credits after this date.
            <Link href="/#pricing" className="ml-1 font-medium underline">
              Reactivate your subscription
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats - Streamed via Suspense */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats userId={user.id} />
      </Suspense>

      {/* Recent Tones - Streamed via Suspense */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tones</CardTitle>
              <CardDescription>Your latest tone creations</CardDescription>
            </div>
            <Link href="/dashboard/create">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create Tone
              </Button>
            </Link>
          </div>
        </CardHeader>
        <Suspense fallback={<RecentTonesSkeleton />}>
          <RecentTones userId={user.id} />
        </Suspense>
      </Card>
    </div>
  );
}
