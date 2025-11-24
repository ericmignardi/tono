'use client';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import logo from '@/public/logo.svg';
import logoDark from '@/public/logoDark.svg';
import logoMobile from '@/public/logoMobile.svg';
import logoMobileDark from '@/public/logoMobileDark.svg';

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState<boolean>(false);
  const navLinks = [
    { href: '#features', title: 'Features' },
    { href: '#pricing', title: 'Pricing' },
    { href: '#get-started', title: 'Get started' },
  ];

  return (
    <header className="bg-background fixed top-0 right-0 left-0 z-50 border-b shadow-sm">
      <div className="relative flex items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          {/* Light mode - Desktop logo */}
          <Image
            src={logo}
            alt="tono logo"
            className="hidden h-8 w-auto lg:block dark:lg:hidden"
            priority
          />
          {/* Light mode - Mobile logo */}
          <Image
            src={logoMobile}
            alt="tono logo"
            className="block h-8 w-auto lg:hidden dark:hidden"
            priority
          />

          {/* Dark mode - Desktop logo */}
          <Image
            src={logoDark}
            alt="tono logo"
            className="hidden h-8 w-auto dark:lg:block"
            priority
          />
          {/* Dark mode - Mobile logo */}
          <Image
            src={logoMobileDark}
            alt="tono logo"
            className="hidden h-8 w-auto dark:block lg:dark:hidden"
            priority
          />
        </Link>

        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="hover:text-primary text-sm font-medium"
            >
              {link.title}
            </Link>
          ))}
          <SignedIn>
            <Link className="hover:text-primary text-sm font-medium" href="/dashboard">
              Dashboard
            </Link>
          </SignedIn>
        </div>

        <nav className="hidden items-center justify-between gap-4 lg:flex">
          <SignedOut>
            <SignUpButton>
              <Button variant={'outline'} className="cursor-pointer">
                Sign up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button className="cursor-pointer">Sign in</Button>
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
            <nav className="bg-background fixed top-0 right-0 z-60 flex h-screen w-[80%] flex-col gap-4 p-8 pt-20 lg:hidden">
              <SignedOut>
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="hover:text-primary text-sm font-medium"
                  >
                    {link.title}
                  </Link>
                ))}
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
          </>
        )}
      </div>
    </header>
  );
}
