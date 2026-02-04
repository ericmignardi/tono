import { formatDistanceToNow } from 'date-fns';
import { ListMusic, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { CardContent } from '../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { prisma } from '@/lib/prisma/database';

interface RecentTonesProps {
  userId: string;
}

const RecentTones = async ({ userId }: RecentTonesProps) => {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  const recentTones = await prisma.tone.findMany({
    where: { userId: dbUser?.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <CardContent>
      {recentTones.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="bg-secondary rounded-full p-4">
            <ListMusic className="text-primary h-8 w-8" />
          </div>
          <div>
            <p className="text-foreground font-medium">No tones yet</p>
            <p className="text-muted-foreground text-sm">Create your first tone to get started</p>
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
                      <h3 className="text-foreground truncate font-medium">{name}</h3>
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
      )}
    </CardContent>
  );
};

export default RecentTones;
