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
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-16" />; // Prevent layout shift
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'bg-input relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isDark ? 'bg-slate-700' : 'bg-slate-200'
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
      <motion.div
        className={cn(
          'pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-all duration-200 ease-in-out dark:bg-slate-950'
        )}
        initial={false}
        animate={{
          x: isDark ? 28 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="h-5 w-5 text-orange-400" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 0 : -180, scale: isDark ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="h-4 w-4 text-indigo-400" />
        </motion.div>
      </motion.div>
    </div>
  );
}
