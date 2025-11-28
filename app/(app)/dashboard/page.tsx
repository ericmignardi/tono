import { ListMusic, AlertCircle, Plus } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma/database';
import Link from 'next/link';
import ManageSubscriptionButton from '@/components/dashboard/ManageSubscriptionButton';
import { differenceInDays, formatDistanceToNow } from 'date-fns';

export default async function Dashboard() {
  const user = await currentUser();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user?.id },
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

  const recentTones = await prisma.tone.findMany({
    where: { userId: dbUser?.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const toneCount = await prisma.tone.count({
    where: { userId: dbUser?.id },
  });

  const creditCount = (dbUser?.generationsLimit ?? 5) - (dbUser?.generationsUsed ?? 0);
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

  const stats = [
    { label: 'Total Tones', value: toneCount },
    { label: 'Credits Remaining', value: creditCount },
    { label: 'Credit Limit', value: dbUser?.generationsLimit ?? 5 },
  ];

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">{label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tones */}
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
        <CardContent>
          {recentTones.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="bg-secondary rounded-full p-4">
                <ListMusic className="text-primary h-8 w-8" />
              </div>
              <div>
                <p className="font-medium text-slate-900">No tones yet</p>
                <p className="text-sm text-slate-500">Create your first tone to get started</p>
              </div>
              <Link href="/dashboard/create">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Tone
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tone</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTones.map(({ name, artist, createdAt, id }) => (
                  <TableRow key={id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/dashboard/tones/${id}`} className="flex items-center gap-3">
                        <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <ListMusic className="text-primary h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-medium text-slate-900">{name}</h3>
                          <p className="truncate text-sm text-slate-500">{artist}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm whitespace-nowrap text-slate-500">
                        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
