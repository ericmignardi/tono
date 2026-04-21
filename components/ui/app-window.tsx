import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Terminal } from 'lucide-react';

interface AppWindowProps {
  children: ReactNode;
  className?: string;
}

export function AppWindow({ children, className }: AppWindowProps) {
  return (
    <div className={cn('relative mx-auto max-w-[800px]', className)}>
      {/* Subtle Glow Effect Behind */}
      <div className="bg-accent/10 absolute -inset-4 rounded-[2rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

      {/* Window Frame */}
      <div className="bg-card/60 relative overflow-hidden rounded-xl border border-border/60 shadow-2xl backdrop-blur-2xl metal-brushed">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full border border-border/60 bg-red-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>
            <div className="h-2.5 w-2.5 rounded-full border border-border/60 bg-amber-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>
            <div className="h-2.5 w-2.5 rounded-full border border-border/60 bg-green-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>
          </div>
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            <div className="flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/60 border border-border/30 bg-background/40 rounded-sm">
              <Terminal className="h-2.5 w-2.5 text-accent animate-pulse" />
              <span>Console_Input_01</span>
            </div>
          </div>
          <div className="hidden text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 md:block font-mono">
            SYS_SECURE_LINK
          </div>
        </div>

        {/* Content Area */}
        <div className="relative p-1.5">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[length:24px_24px]"></div>

          <div className="relative z-10 bg-background/40 rounded-lg border border-border/20 shadow-inner">{children}</div>
        </div>
        
        {/* Technical Footer Detail */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-border/20 bg-muted/10">
          <div className="flex gap-2">
            <div className="h-1 w-4 bg-accent/20 rounded-full"></div>
            <div className="h-1 w-8 bg-accent/10 rounded-full"></div>
          </div>
          <div className="h-1 w-24 bg-linear-to-r from-transparent via-accent/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
