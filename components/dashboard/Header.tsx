'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          suppressHydrationWarning
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
