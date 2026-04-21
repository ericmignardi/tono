import { AlertCircle, Cpu } from 'lucide-react';
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

  // Check if subscription is set to cancel at period end
  const isCanceling = activeSubscription?.cancelAtPeriodEnd === true;
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
    <div className="mx-auto max-w-7xl space-y-12 p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-accent"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Terminal Session</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tighter text-foreground md:text-5xl uppercase">
              Welcome, <span className="text-muted-foreground/30 italic">{firstName}</span>.
            </h1>
          </div>
          {hasActiveSubscription && <ManageSubscriptionButton />}
        </div>
      </div>

      {/* Cancellation Notice */}
      {isCanceling && endingSoon !== null && endingSoon <= 7 && endingSoon >= 0 && (
        <Alert className="bg-destructive/5 border-destructive/20 text-destructive rounded-none">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Subscription Warning</AlertTitle>
          <AlertDescription className="text-xs font-medium">
            Service termination protocol initiated for <strong>{periodEndDate}</strong>. Access remains active until period end. 
            <Link href="/#pricing" className="ml-2 font-black uppercase tracking-widest underline decoration-destructive/30 hover:decoration-destructive transition-colors">
              Abort Cancellation
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats - Streamed via Suspense */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats userId={user.id} />
      </Suspense>

      {/* Recent Tones - Streamed via Suspense */}
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-b from-border/50 to-transparent rounded-xl pointer-events-none"></div>
        <Card className="bg-background/40 border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-xs">
          <CardHeader className="border-b border-border/50 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-xl font-bold uppercase tracking-tight">Recent Archives</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Latest frequency synthesis records</CardDescription>
              </div>
              <Link href="/dashboard/create">
                <Button size="sm" className="bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-sm hover:scale-[1.02]">
                  <Cpu className="h-3.5 w-3.5" />
                  New Synthesis
                </Button>
              </Link>
            </div>
          </CardHeader>
          <Suspense fallback={<RecentTonesSkeleton />}>
            <RecentTones userId={user.id} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
