'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, FileMusic, Home, Gift } from 'lucide-react';
import logo from '@/public/logo.svg';
import logoDark from '@/public/logoDark.svg';
import logoMobile from '@/public/logoMobile.svg';
import logoMobileDark from '@/public/logoMobileDark.svg';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/tones', label: 'Tones', icon: Music },
  { href: '/dashboard/create', label: 'Create', icon: FileMusic },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-r-border bg-background fixed inset-y-0 left-0 z-50 flex w-16 flex-col border-r lg:w-64">
      {/* Logo */}
      <div className="border-border flex h-16 items-center justify-center px-4 lg:justify-start">
        <Link href="/" className="flex items-center">
          <picture>
            <source media="(min-width: 1024px)" srcSet={logo.src} />
            <Image src={logoMobile} alt="Tonifier logo" className="h-8 w-auto" priority />
          </picture>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-0.5 p-2 lg:items-start">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 text-[13px] font-normal transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-primary hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="hidden truncate lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="p-3">
        <Link href="/pricing">
          <Button
            variant={'outline'}
            className="flex w-full cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <Gift className="h-4 w-4" />
            <span className="hidden lg:inline">Upgrade</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
