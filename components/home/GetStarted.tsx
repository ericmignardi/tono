import { ArrowRight, Waves } from 'lucide-react';
import Link from 'next/link';

export default function GetStarted() {
  return (
    <section id="get-started" className="relative overflow-hidden py-32 bg-background grain">
      {/* Subtle Technical Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[length:40px_40px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full"></div>
            <div className="relative h-16 w-16 flex items-center justify-center rounded-full border border-accent/30 bg-background glow-amber">
              <Waves className="h-8 w-8 text-accent animate-pulse" />
            </div>
          </div>
        </div>

        <h2 className="font-display mb-8 text-4xl font-bold tracking-tighter text-foreground md:text-7xl">
          INITIATE <span className="text-muted-foreground/30 italic">SESSION</span>.
        </h2>

        <p className="mx-auto mb-12 max-w-xl text-muted-foreground font-medium text-lg leading-relaxed md:text-xl">
          Join a global network of engineers and artists pushing the boundaries of digital signal recreation. 
          Deployment is instantaneous.
        </p>

        <Link
          href="/dashboard"
          className="group relative inline-flex items-center gap-3 px-12 py-5 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.3em] rounded-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
        >
          <span className="absolute inset-0 border border-white/20 rounded-sm"></span>
          Begin Protocol <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Technical Label */}
        <div className="mt-12 flex items-center justify-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40">
          <span>End of Line</span>
          <span className="h-px w-8 bg-border"></span>
          <span>Station 01-A</span>
        </div>
      </div>
    </section>
  );
}
