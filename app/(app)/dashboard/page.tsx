import { ListMusic, AlertCircle } from 'lucide-react';
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

  console.log(endingSoon);

  const stats = [
    { label: 'Total Tones', value: toneCount },
    { label: 'Credits Remaining', value: creditCount },
    { label: 'Credit Limit', value: dbUser?.generationsLimit ?? 5 },
  ];

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

  return (
    <section className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Welcome back, {firstName}!
          </h1>
          {hasActiveSubscription && <ManageSubscriptionButton />}
        </div>
        <p className="text-muted-foreground">Here's a quick overview of your tone profile.</p>
      </div>

      {/* Cancellation Notice */}
      {isCanceling && endingSoon !== null && endingSoon <= 7 && endingSoon >= 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Ending</AlertTitle>
          <AlertDescription>
            Your Premium subscription will end on <strong>{periodEndDate}</strong> You'll still have
            full access until then. Your credit limit will return to 5 credits after this date.
            <Link href="/#pricing" className="font-medium underline">
              Reactivate your subscription
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tones */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tones</CardTitle>
          <CardDescription>Your latest tone creations and modifications</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTones.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <p>No tones created yet. Start by creating your first tone!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tone</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTones.map(({ name, artist, createdAt, id }, idx) => (
                    <TableRow key={idx} className="hover:bg-accent/50 cursor-pointer">
                      <TableCell>
                        <Link href={`/dashboard/tones/${id}`} className="flex items-center gap-3">
                          <div className="bg-muted/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                            <ListMusic className="text-foreground h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-medium">{name}</h3>
                            <p className="text-muted-foreground truncate text-sm">{artist}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-muted-foreground text-sm whitespace-nowrap">
                          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
