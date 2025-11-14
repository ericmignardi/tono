'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="bg-background sticky top-0 z-40 flex h-16 items-center justify-between border-b p-4">
      {/* Left side - Can add breadcrumbs or page title here */}
      <div className="flex items-center gap-4">{/* Reserved for breadcrumbs or search */}</div>

      {/* Right side - Actions */}
      <nav className="flex items-center gap-2">
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mounted ? (
            isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" /> // Placeholder to prevent layout shift
          )}
        </Button>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
