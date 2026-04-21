import { formatDistanceToNow } from 'date-fns';
import { Cpu, Database, Activity } from 'lucide-react';
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
    <CardContent className="p-0">
      {recentTones.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full"></div>
            <div className="relative h-16 w-16 flex items-center justify-center rounded-full border border-border bg-background">
              <Database className="text-muted-foreground/40 h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Registry Empty</p>
            <p className="text-muted-foreground text-xs font-medium opacity-60 max-w-[200px] leading-relaxed">No tone synthesis records found in the current session.</p>
          </div>
          <Link href="/dashboard/create">
            <Button className="bg-accent text-background text-[10px] font-black uppercase tracking-widest rounded-sm hover:scale-[1.02]">
              <Cpu className="h-4 w-4" />
              Initialize Synthesis
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 h-10 px-8">Sequence Identification</TableHead>
                <TableHead className="text-right text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 h-10 px-8">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTones.map(({ name, artist, createdAt, id }) => (
                <TableRow key={id} className="group cursor-pointer border-border/50 hover:bg-muted/20 transition-colors">
                  <TableCell className="px-8 py-4">
                    <Link href={`/dashboard/tones/${id}`} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-border bg-card group-hover:border-accent/50 transition-colors">
                        <Activity className="text-muted-foreground h-4 w-4 group-hover:text-accent transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-foreground truncate font-display text-sm font-bold uppercase tracking-tight">{name}</h3>
                        <p className="text-muted-foreground truncate text-[10px] font-bold uppercase tracking-widest opacity-40">{artist}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60 font-mono whitespace-nowrap">
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
  );
};

export default RecentTones;
