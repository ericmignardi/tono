import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/database';
import ToneCard from '@/components/dashboard/tones/ToneCard';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Cpu, Database } from 'lucide-react';

export default async function Tones() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  const tones = await prisma.tone.findMany({
    where: { userId: dbUser?.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-accent"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Central Registry</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tighter text-foreground md:text-5xl uppercase">
              Tone <span className="text-muted-foreground/30 italic">Archive</span>.
            </h1>
          </div>
          <Link href="/dashboard/create">
            <Button className="bg-accent text-background text-[10px] font-black uppercase tracking-widest rounded-sm hover:scale-[1.02]">
              <Cpu className="h-4 w-4" />
              New Synthesis
            </Button>
          </Link>
        </div>
      </div>

      {/* Tones Grid */}
      {tones.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-32 text-center bg-muted/5 border border-border/50 rounded-xl border-dashed">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full"></div>
            <div className="relative h-16 w-16 flex items-center justify-center rounded-full border border-border bg-background">
              <Database className="text-muted-foreground/40 h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Archive Empty</p>
            <p className="text-muted-foreground text-xs font-medium opacity-60 max-w-[240px] leading-relaxed">No synthesis records stored in the primary database.</p>
          </div>
          <Link href="/dashboard/create">
            <Button className="bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-sm">
              Initialize Synthesis
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tones.map((tone) => (
            <Link key={tone.id} href={`/dashboard/tones/${tone.id}`} className="block">
              <ToneCard tone={tone} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
