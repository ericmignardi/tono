'use client';

import { RotateCcw, Share2, Activity, Cpu, Sparkles, Terminal } from 'lucide-react';

export default function SignalChainVisualization() {
  return (
    <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
      {/* Top Bar of Right Column */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-tight">Signal <span className="text-muted-foreground/30 italic">Matrix</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Real-time component mapping</p>
        </div>
        <div className="flex gap-3">
          <button className="h-10 w-10 flex items-center justify-center rounded border border-border bg-muted/10 text-muted-foreground hover:text-accent hover:border-accent/50 transition-all">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="h-10 w-10 flex items-center justify-center rounded border border-border bg-muted/10 text-muted-foreground hover:text-accent hover:border-accent/50 transition-all">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background/50 shadow-inner min-h-[400px]">
        {/* Subtle Technical Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>

        {/* Signal Path SVG */}
        <svg
          className="pointer-events-none absolute top-1/2 left-0 z-0 h-20 w-full -translate-y-1/2"
          style={{ overflow: 'visible' }}
        >
          <path
            d="M0,40 C100,40 100,40 200,40 L800,40"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="4,4"
          ></path>
          <path
            className="signal-line"
            d="M0,40 C100,40 100,40 200,40 L800,40"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
            opacity="0.3"
          ></path>
        </svg>

        {/* Components Display */}
        <div className="relative z-10 flex flex-1 items-center gap-12 overflow-x-auto px-16 py-20">
          {/* Input Jack */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="h-6 w-6 rounded-full border border-border bg-muted/30 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">In</span>
          </div>

          {/* Pedal 1: Compressor */}
          <div className="group relative shrink-0 flex h-48 w-32 cursor-pointer flex-col items-center rounded-sm border border-border bg-card p-4 transition-all hover:border-accent/50 hover:-translate-y-1 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-accent/20"></div>
            <div className="mb-4 flex w-full justify-between items-center px-1">
              <div className="h-1 w-1 rounded-full bg-accent/40"></div>
              <div className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Dynamics</div>
              <div className="h-1 w-1 rounded-full bg-accent/40"></div>
            </div>
            <div className="mb-auto flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full border border-border bg-muted/10 shadow-inner"></div>
              <span className="font-display text-sm font-bold uppercase tracking-widest text-foreground group-hover:text-accent transition-colors">
                COMP-01
              </span>
            </div>
            <div className="h-4 w-12 bg-muted/20 border border-border/50 rounded-sm mt-4 flex items-center justify-center">
              <div className="h-0.5 w-8 bg-accent/30 rounded-full"></div>
            </div>
          </div>

          {/* Pedal 2: Overdrive */}
          <div className="group relative shrink-0 flex h-48 w-32 cursor-pointer flex-col items-center rounded-sm border border-border bg-card p-4 transition-all hover:border-accent/50 hover:-translate-y-1 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-accent/40"></div>
            <div className="mb-4 flex w-full justify-between items-center px-1">
              <div className="h-1 w-1 rounded-full bg-accent/40"></div>
              <div className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Saturation</div>
              <div className="h-1 w-1 rounded-full bg-accent/40"></div>
            </div>
            <div className="mb-auto flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <div className="h-5 w-5 rounded-full border border-border bg-muted/10"></div>
                <div className="h-5 w-5 rounded-full border border-border bg-muted/10"></div>
              </div>
              <span className="font-display text-sm font-bold uppercase tracking-widest text-foreground group-hover:text-accent transition-colors">
                DRIVE-02
              </span>
            </div>
            <div className="h-6 w-6 rounded-full border border-border bg-accent glow-amber flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-background"></div>
            </div>
          </div>

          {/* Amp Head */}
          <div className="group relative shrink-0 flex h-40 w-64 flex-col overflow-hidden rounded-sm border border-border bg-muted/5 shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-10"></div>
            <div className="relative z-10 p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-auto">
                <div className="border border-border/50 px-2 py-1 bg-background/50">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground">TONO-AMP</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></div>
              </div>
              <div className="flex gap-4 mt-auto">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full border border-border bg-background" />
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 w-full h-1 bg-accent/10"></div>
          </div>
        </div>

        {/* Bottom Info Strip */}
        <div className="flex h-12 items-center justify-between border-t border-border bg-background/80 px-6 backdrop-blur">
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Processing</span>
              <span className="text-[9px] font-bold text-foreground font-mono">12.4%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Latency</span>
              <span className="text-[9px] font-bold text-foreground font-mono">2.1ms</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-1 rounded border border-accent/20 bg-accent/5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-foreground">System Ready</span>
          </div>
        </div>
      </div>

      {/* Stats / Output */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="flex flex-col justify-between p-6 border border-border bg-background/40 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <Activity className="h-3.5 w-3.5 text-accent/40 group-hover:text-accent transition-colors" />
          </div>
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Dynamic Range</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-foreground">-12.4</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent/40">dB</span>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-muted/20 rounded-full overflow-hidden">
            <div className="h-full bg-accent/30 w-3/4"></div>
          </div>
        </div>
        {/* Stat Card 2 */}
        <div className="flex flex-col justify-between p-6 border border-border bg-background/40 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <Cpu className="h-3.5 w-3.5 text-accent/40 group-hover:text-accent transition-colors" />
          </div>
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Saturation Index</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-foreground">42.8</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent/40">%</span>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-muted/20 rounded-full overflow-hidden">
            <div className="h-full bg-accent/30 w-1/2"></div>
          </div>
        </div>
        {/* AI Insight */}
        <div className="relative p-6 bg-accent border border-accent rounded-xl shadow-2xl group overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 transform rotate-12 transition-transform group-hover:rotate-45">
            <Terminal className="h-24 w-24 text-background" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-background" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-background">Neural Insight</span>
            </div>
            <p className="text-[11px] font-bold leading-relaxed text-background tracking-tight">
              &quot;Initialize compression before saturation to stabilize lower frequencies.&quot;
            </p>
            <div className="text-[8px] font-black uppercase tracking-widest text-background/50">Processing Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}
