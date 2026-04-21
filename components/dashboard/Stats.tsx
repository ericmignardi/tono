import { Card, CardHeader, CardDescription, CardContent } from '../ui/card';
import { prisma } from '@/lib/prisma/database';

interface StatsProps {
  userId: string;
}

const Stats = async ({ userId }: StatsProps) => {
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  const toneCount = await prisma.tone.count({
    where: { userId: dbUser?.id },
  });

  const creditCount = (dbUser?.generationsLimit ?? 5) - (dbUser?.generationsUsed ?? 0);

  const stats = [
    { label: 'ARCHIVED TONES', value: toneCount, unit: 'UNITS' },
    { label: 'CREDITS REMAINING', value: creditCount, unit: 'OPS' },
    { label: 'OPERATIONAL LIMIT', value: dbUser?.generationsLimit ?? 5, unit: 'MAX' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map(({ label, value, unit }) => (
        <div key={label} className="group relative">
          <div className="absolute -inset-px bg-linear-to-b from-border/50 to-transparent rounded-lg pointer-events-none transition-colors group-hover:from-accent/30"></div>
          <Card className="bg-background/40 border-border rounded-lg backdrop-blur-xs relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{label}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-baseline gap-2">
              <div className="font-display text-4xl font-bold text-foreground tabular-nums">{value}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-accent/40">{unit}</div>
            </CardContent>
            {/* Technical Detail */}
            <div className="absolute top-2 right-2 flex gap-0.5">
              <div className="h-1 w-1 rounded-full bg-accent/20"></div>
              <div className="h-1 w-1 rounded-full bg-accent/20"></div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default Stats;
