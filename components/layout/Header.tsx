'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);

  return (
    <header className="border-b-border relative border-b">
      <div className="flex items-center justify-between p-4">
        <Link href="/">
          <h1 className="text-2xl font-bold italic">
            tonifi<span className="text-primary">e</span>r
          </h1>
        </Link>
        <nav className="hidden items-center gap-4 lg:flex">
          <SignedOut>
            <SignUpButton>
              <Button variant={'ghost'}>Sign up</Button>
            </SignUpButton>
            <SignInButton>
              <Button variant={'ghost'}>Log in</Button>
            </SignInButton>

            <Link href="/pricing">
              <Button>Get started</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="z-20 h-6 w-6 cursor-pointer lg:hidden"
          aria-label="Toggle mobile menu"
        >
          {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {mobileMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileMenu(false)}
            />
            {/* Mobile menu */}
            <nav className="bg-primary-foreground fixed top-0 right-0 z-50 flex h-screen w-[80%] flex-col items-center gap-4 p-6 pt-20 lg:hidden">
              <SignedOut>
                <SignUpButton>
                  <Button variant={'ghost'}>Sign up</Button>
                </SignUpButton>
                <SignInButton>
                  <Button variant="ghost">Log in</Button>
                </SignInButton>
                <Link href="/pricing">
                  <Button>Get started</Button>
                </Link>
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
