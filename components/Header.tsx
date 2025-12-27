'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { ArrowUpRight, Music2, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);

  return (
    <nav className="bg-secondary/90 fixed top-0 z-50 w-full px-6 py-6 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary shadow-primary/20 flex h-10 w-10 rotate-3 items-center justify-center rounded-xl shadow-lg">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-foreground text-2xl font-bold tracking-tight">tono</span>
        </Link>

        {/* Nav Links (Pill Shape) */}
        <div className="border-border bg-background/80 hidden items-center gap-1 rounded-full border px-2 py-1.5 shadow-sm md:flex">
          <Link
            href="#features"
            className="hover:bg-secondary hover:text-primary text-muted-foreground rounded-full px-5 py-2 text-sm font-semibold transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="hover:bg-secondary hover:text-primary text-muted-foreground rounded-full px-5 py-2 text-sm font-semibold transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#get-started"
            className="hover:bg-secondary hover:text-primary text-muted-foreground rounded-full px-5 py-2 text-sm font-semibold transition-colors"
          >
            Get Started
          </Link>
          <SignedIn>
            <Link
              href="/dashboard"
              className="hover:bg-secondary hover:text-primary text-muted-foreground rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <SignedOut>
            <SignInButton>
              <button className="hover:text-primary text-muted-foreground text-sm font-semibold">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="group bg-primary shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5">
                Start Playing
                <div className="rounded-full bg-white/20 p-1 transition-transform group-hover:translate-x-1">
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="z-20 h-6 w-6 cursor-pointer lg:hidden"
          aria-label={mobileMenu ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenu}
          aria-controls="mobile-menu"
        >
          {mobileMenu ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {/* Mobile Menu */}
        {mobileMenu && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileMenu(false)}
              aria-hidden="true"
            />
            <nav
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="bg-background fixed top-0 right-0 z-60 flex h-screen w-[80%] flex-col gap-4 p-8 pt-20 lg:hidden"
            >
              <Link
                href="#features"
                className="hover:bg-secondary hover:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                onClick={() => setMobileMenu(false)}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="hover:bg-secondary hover:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                onClick={() => setMobileMenu(false)}
              >
                Pricing
              </Link>
              <Link
                href="#get-started"
                className="hover:bg-secondary hover:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                onClick={() => setMobileMenu(false)}
              >
                Get Started
              </Link>
              <SignedOut>
                <SignInButton>
                  <button className="border-border text-muted-foreground w-full rounded-full border py-2 text-sm font-semibold">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-primary w-full rounded-full py-2 text-sm font-semibold text-white">
                    Start Playing
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="hover:bg-secondary hover:text-primary rounded-lg px-4 py-2 text-sm font-medium"
                  onClick={() => setMobileMenu(false)}
                >
                  Dashboard
                </Link>
                <div className="mt-4">
                  <UserButton />
                </div>
              </SignedIn>
            </nav>
          </>
        )}
      </div>
    </nav>
  );
}
