import { Sliders, Zap, Terminal } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-32">
      <div className="mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-accent"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Core Modules</span>
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tighter text-foreground md:text-6xl lg:text-7xl">
            Surgical <span className="text-muted-foreground/30 italic">Processing</span>.
          </h2>
        </div>
        <div className="text-muted-foreground text-sm font-medium tracking-tight max-w-[200px] leading-relaxed opacity-60">
          Advanced digital signal processing modules designed for the modern tone purist.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border/50 border border-border overflow-hidden rounded-2xl md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: AI Analysis */}
        <div className="group bg-background relative p-10 transition-colors duration-500 hover:bg-muted/30">
          <div className="mb-12 flex h-12 w-12 items-center justify-center rounded border border-border bg-card shadow-sm transition-all group-hover:border-accent/50 group-hover:glow-amber">
            <Zap className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent" />
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Module 01</div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Neural Audio <br /> Synthesis
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
              Our transformer-based models translate subjective descriptions into precise electrical configurations.
            </p>
          </div>
        </div>

        {/* Card 2: Gear Match */}
        <div className="group bg-background relative p-10 transition-colors duration-500 hover:bg-muted/30">
          <div className="mb-12 flex h-12 w-12 items-center justify-center rounded border border-border bg-card shadow-sm transition-all group-hover:border-accent/50 group-hover:glow-amber">
            <Sliders className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent" />
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Module 02</div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Hardware-Locked <br /> Calibration
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
              Algorithms tailored to the specific impedance and gain stages of your physical amplifier and guitar.
            </p>
          </div>
        </div>

        {/* Card 3: Library */}
        <div className="group bg-background relative p-10 transition-colors duration-500 hover:bg-muted/30 lg:col-span-1 md:col-span-2 lg:border-none">
          <div className="mb-12 flex h-12 w-12 items-center justify-center rounded border border-border bg-card shadow-sm transition-all group-hover:border-accent/50 group-hover:glow-amber">
            <Terminal className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent" />
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Module 03</div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Session <br /> Archiving
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
              Save and export complex signal chain configurations as cryptographically secure presets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
