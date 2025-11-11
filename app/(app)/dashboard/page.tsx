import { ListMusic } from 'lucide-react';
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
import { prisma } from '@/lib/database';

const stats = [
  { label: 'Total Tones', value: 42 },
  { label: 'Favourites Saved', value: 18 },
  { label: 'Tones Shared', value: 9 },
] as const;

export default async function Dashboard() {
  const user = await currentUser();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user?.id },
  });

  const recentTones = await prisma.tone.findMany({
    where: { userId: dbUser?.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

  return (
    <section className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground">Here's a quick overview of your tone profile.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-primary text-2xl font-bold">{value}</div>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tone</TableHead>
                  <TableHead className="text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTones.map(({ name, artist, createdAt }, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <ListMusic className="text-primary h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-medium">{name}</h3>
                          <p className="text-muted-foreground truncate text-sm">{artist}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
