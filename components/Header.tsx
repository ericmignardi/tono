'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { ArrowUpRight, Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);

  return (
    <nav className="fixed top-0 z-50 w-full px-6 py-8 backdrop-blur-sm transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-accent/30 bg-background glow-amber transition-all group-hover:border-accent">
            <Activity className="h-4 w-4 text-accent" />
          </div>
          <span className="font-display text-xl font-black tracking-tighter text-foreground">TONO</span>
        </Link>

        {/* Technical Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Modules
          </Link>
          <Link
            href="#pricing"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            License
          </Link>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Terminal
            </Link>
          </SignedIn>
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-6 lg:flex">
          <SignedOut>
            <SignInButton>
              <button className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="group relative flex items-center gap-2 rounded bg-foreground px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-background transition-all hover:scale-[1.02] active:scale-[0.98]">
                Deploy
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <div className="h-4 w-px bg-border"></div>
          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="z-20 flex h-8 w-8 items-center justify-center lg:hidden"
          aria-label={mobileMenu ? 'Close menu' : 'Open menu'}
        >
          {mobileMenu ? (
            <X className="h-4 w-4 text-foreground" />
          ) : (
            <Menu className="h-4 w-4 text-foreground" />
          )}
        </button>

        {/* Mobile Menu */}
        {mobileMenu && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/80 lg:hidden"
              onClick={() => setMobileMenu(false)}
            />
            <nav
              className="fixed top-0 right-0 z-60 flex h-screen w-[280px] flex-col border-l border-border bg-background p-8 pt-24 lg:hidden"
            >
              <div className="flex flex-col gap-8">
                <Link
                  href="#features"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                  onClick={() => setMobileMenu(false)}
                >
                  Modules
                </Link>
                <Link
                  href="#pricing"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                  onClick={() => setMobileMenu(false)}
                >
                  License
                </Link>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                    onClick={() => setMobileMenu(false)}
                  >
                    Terminal
                  </Link>
                </SignedIn>
                <div className="h-px w-full bg-border"></div>
                <SignedOut>
                  <SignInButton>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-left">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-foreground text-background rounded py-3 text-[10px] font-black uppercase tracking-[0.2em]">
                      Deploy
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-4">
                    <UserButton />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Session Active</span>
                  </div>
                </SignedIn>
                <div className="pt-4">
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </>
        )}
      </div>
    </nav>
  );
}
