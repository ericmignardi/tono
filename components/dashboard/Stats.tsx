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
    { label: 'Total Tones', value: toneCount },
    { label: 'Credits Remaining', value: creditCount },
    { label: 'Credit Limit', value: dbUser?.generationsLimit ?? 5 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value }) => (
        <Card key={label}>
          <CardHeader className="pb-3">
            <CardDescription className="text-sm">{label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-3xl font-bold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Stats;
