import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tone } from '@prisma/client';
import { Activity, Cpu } from 'lucide-react';

export default function ToneCard({ tone }: { tone: Tone }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-px bg-linear-to-b from-border/50 to-transparent rounded-xl pointer-events-none transition-all group-hover:from-accent/30 group-hover:glow-amber"></div>
      <Card className="bg-background/40 border-border rounded-xl backdrop-blur-xs transition-all duration-500 overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-4 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Registry No: {tone.id.substring(0, 8).toUpperCase()}</div>
              <CardTitle className="font-display text-xl font-bold uppercase tracking-tight group-hover:text-accent transition-colors">
                {tone.name}
              </CardTitle>
            </div>
            <div className="h-8 w-8 flex items-center justify-center rounded border border-border bg-muted/20 transition-colors group-hover:border-accent/50">
              <Cpu className="text-muted-foreground h-3.5 w-3.5 group-hover:text-accent transition-colors" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grow flex flex-col justify-between space-y-6">
          <CardDescription className="text-[11px] font-medium leading-relaxed line-clamp-2 opacity-60">
            {tone.description}
          </CardDescription>
          
          <div className="pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted/20 border border-border/50">
                <Activity className="h-2.5 w-2.5 text-accent" />
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground">{tone.artist}</span>
              </div>
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Active Sequence</div>
          </div>
        </CardContent>
        {/* Hardware Decoration */}
        <div className="h-1 w-full bg-linear-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </Card>
    </div>
  );
}
