import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Command } from 'lucide-react';

interface AppWindowProps {
  children: ReactNode;
  className?: string;
}

export function AppWindow({ children, className }: AppWindowProps) {
  return (
    <div className={cn('relative mx-auto max-w-[800px]', className)}>
      {/* Glow Effect Behind */}
      <div className="bg-primary/20 absolute -inset-1 rounded-2xl blur-2xl transition duration-1000 group-hover:duration-200"></div>

      {/* Window Frame */}
      <div className="bg-card/80 relative overflow-hidden rounded-xl border border-white/20 shadow-2xl backdrop-blur-xl dark:bg-slate-900/90">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/20 md:bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/20 md:bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/20 md:bg-green-500"></div>
          </div>
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 opacity-50">
            <div className="flex items-center gap-1 rounded bg-black/20 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              <Command className="h-3 w-3" />
              <span>tono-studio</span>
            </div>
          </div>
          <div className="hidden text-[10px] text-slate-500 md:block">Beta Access</div>
        </div>

        {/* Content Area */}
        <div className="relative bg-black/5 p-4 dark:bg-black/20">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[length:14px_24px]"></div>

          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
