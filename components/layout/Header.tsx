'use client';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);

  return (
    <header className="border-b-border fixed top-0 right-0 left-0 z-50 border-b shadow-sm backdrop-blur-2xl">
      <div className="relative flex items-center justify-between p-4">
        <Link href="/">
          <h1 className="text-xl font-bold italic">tonifier</h1>
        </Link>
        <nav className="hidden items-center justify-between gap-4 lg:flex">
          <SignedOut>
            <Link href="/pricing" className="hover:text-primary text-sm font-medium">
              Pricing
            </Link>
            <SignUpButton>
              <Button variant={'outline'}>Sign up</Button>
            </SignUpButton>
            <SignInButton>
              <Button>Sign in</Button>
            </SignInButton>
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
          {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {mobileMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileMenu(false)}
            />
            {/* Mobile menu */}
            <nav className="bg-background fixed top-0 right-0 z-60 flex h-screen w-[80%] flex-col gap-4 border border-red-500 p-6 pt-20 lg:hidden">
              <SignedOut>
                <Link href="/pricing" className="hover:text-primary text-sm font-medium">
                  Pricing
                </Link>
                <SignUpButton>
                  <Button variant={'outline'} className="text-base">
                    Sign up
                  </Button>
                </SignUpButton>
                <SignInButton>
                  <Button className="text-base">Sign in</Button>
                </SignInButton>
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
