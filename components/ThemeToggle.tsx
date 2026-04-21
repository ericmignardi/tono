'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-14 rounded-sm bg-muted/20 border border-border/50" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-sm border border-border bg-muted/20 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-accent/50 group overflow-hidden',
        isDark ? 'bg-accent/10 glow-amber shadow-inner' : 'shadow-inner'
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      role="switch"
      aria-checked={isDark}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setTheme(isDark ? 'light' : 'dark');
        }
      }}
    >
      <span className="sr-only">Toggle theme</span>
      
      {/* Background Indicator */}
      <div className="absolute inset-0 flex items-center justify-around px-1.5 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        <Sun className="h-2.5 w-2.5 text-foreground" />
        <Moon className="h-2.5 w-2.5 text-foreground" />
      </div>

      <motion.div
        className={cn(
          'relative z-10 flex h-7 w-6.5 items-center justify-center rounded-[1px] border border-border/60 bg-background transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.4)] m-0.5 metal-brushed'
        )}
        initial={false}
        animate={{
          x: isDark ? 23 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-accent/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 90 : 0, opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="h-3 w-3 text-foreground/70" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 0 : -90, opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="h-3 w-3 text-accent" />
        </motion.div>
      </motion.div>
    </div>
  );
}
