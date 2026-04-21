import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma/database';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Cpu, Activity, Settings, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { deleteTone } from '@/lib/actions/tones';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tone = await prisma.tone.findUnique({
    where: { id },
    select: { name: true, artist: true },
  });

  if (!tone) {
    return { title: 'Sequence Not Found - TONO' };
  }

  return {
    title: `${tone.name} - Registry ${id.substring(0, 8).toUpperCase()}`,
    description: `Technical specifications for tone sequence ${tone.name}`,
  };
}

export default async function Tone({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  const tone = await prisma.tone.findUnique({
    where: { userId: dbUser?.id, id: id },
  });

  if (!tone) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link
          href="/dashboard/tones"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors flex w-fit items-center gap-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Return to Registry
        </Link>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-accent"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Sequence ID: {id.substring(0, 8).toUpperCase()}</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tighter text-foreground md:text-6xl uppercase">
              {tone.name}<span className="text-muted-foreground/30 italic">.spec</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{tone.artist}</p>
          </div>
          <div className="flex gap-4">
            <Link href={`/dashboard/tones/${id}/edit`}>
              <Button variant="outline" className="border-border bg-muted/10 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-accent/10 hover:text-accent hover:border-accent/50 transition-all">
                <Pencil className="h-3 w-3" />
                Modify
              </Button>
            </Link>
            <form action={deleteTone}>
              <input type="hidden" name="toneId" value={id} />
              <Button variant="destructive" size="sm" type="submit" className="text-[10px] font-black uppercase tracking-widest rounded-sm">
                <Trash2 className="h-3 w-3" />
                Eject
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-8 lg:col-span-2">
          {/* Metadata Card */}
          <div className="relative">
            <div className="absolute -inset-px bg-linear-to-b from-border/50 to-transparent rounded-xl pointer-events-none"></div>
            <Card className="bg-background/40 border-border rounded-xl backdrop-blur-xs overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-accent" />
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em]">Descriptive Metadata</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-[11px] font-medium leading-relaxed text-muted-foreground/80 uppercase tracking-widest">{tone.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Amp Settings as Rack Unit */}
          <div className="relative">
            <div className="absolute -inset-px bg-linear-to-b from-accent/20 to-transparent rounded-xl pointer-events-none"></div>
            <Card className="bg-background border-border rounded-xl shadow-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-accent" />
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em]">Analog Signal Recreation</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="h-1 w-1 bg-accent/30 rounded-full" />)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {Object.entries(tone.aiAmpSettings as Record<string, any>).map(([key, value]) => (
                    <div key={key} className="space-y-3">
                      <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">{key}</div>
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-accent/10 rounded blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <div className="relative h-16 flex items-center justify-center bg-muted/5 border border-border rounded font-display text-2xl font-bold text-accent tabular-nums">
                          {value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="bg-muted/10 h-8 border-t border-border/50 px-6 flex items-center justify-between">
                <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">Auto-Calibration Active</span>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-border/50 rounded-full overflow-hidden">
                    <div className="h-full bg-accent/40 w-2/3"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Hardware Specs */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 border border-border/50 bg-muted/5 rounded-lg space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 border-b border-border/50 pb-2">Instrument Specs</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Model</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">{tone.guitar}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Transducers</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">{tone.pickups}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Gauges</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">{tone.strings || 'UNSPECIFIED'}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border border-border/50 bg-muted/5 rounded-lg space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 border-b border-border/50 pb-2">Processor Specs</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Amplifier</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">{tone.amp}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Chain Logic</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">Standard Mono</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Status</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-green-500">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - AI Insights */}
        <div className="space-y-8">
          <div className="relative sticky top-24">
            <div className="absolute -inset-px bg-linear-to-b from-accent/30 to-transparent rounded-xl pointer-events-none"></div>
            <Card className="bg-background border-border rounded-xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-accent/5 border-b border-border/50 pb-6">
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-accent" />
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em]">Synthesis Logic</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-accent/20"></div>
                  <p className="text-[11px] font-medium leading-relaxed text-muted-foreground/90 font-mono italic">
                    "{tone.aiNotes}"
                  </p>
                </div>
                <div className="flex items-center justify-center py-4 border-t border-border/30">
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-4 w-1 bg-accent/20 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
