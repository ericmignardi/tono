'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

// TODO: Implement additional features or routes

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const toggleDarkMode = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <header className="border-b-border sticky top-0 z-10 border-b p-4">
      <nav className="flex items-center justify-end gap-2">
        <Button className="cursor-pointer" variant="ghost" onClick={toggleDarkMode}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
