'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, FileMusic, Home, Gift } from 'lucide-react';
import logo from '@/public/logo.svg';
import logoMobile from '@/public/logoMobile.svg';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// TODO: Complete styling to preference

export default function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/tones', label: 'Tones', icon: Music },
    { href: '/dashboard/create-tone', label: 'Create Tone', icon: FileMusic },
  ];
  return (
    <aside className="border-r-border sticky top-0 flex min-h-screen w-16 shrink-0 flex-col justify-start gap-8 border-r p-4 lg:w-64">
      <div className="flex">
        <Link href="/">
          <picture>
            <source media="(min-width: 1024px)" srcSet={logo.src} />
            <Image src={logoMobile} alt="tonifier logo" className="w-32" />
          </picture>
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center gap-4 lg:items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md p-2 transition-colors',
                isActive && 'bg-primary/20'
              )}
            >
              <Icon className="text-primary" />
              <span className="hidden lg:flex">{label}</span>
            </Link>
          );
        })}
      </div>
      <Link href="/pricing">
        <Button className="w-full" aria-label="Upgrade">
          <span className="hidden lg:inline">Upgrade</span>
          <Gift className="inline lg:hidden" />
        </Button>
      </Link>
    </aside>
  );
}
