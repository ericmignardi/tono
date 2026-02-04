'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sliders, Library, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/create', label: 'Create', icon: Sliders },
  { href: '/dashboard/tones', label: 'Tones', icon: Library },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar border-border z-20 flex h-full w-[280px] shrink-0 flex-col border-r">
      {/* Brand */}
      <div className="border-border flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary shadow-primary/20 flex h-10 w-10 rotate-3 items-center justify-center rounded-xl text-white shadow-lg">
            <Music2 className="h-6 w-6" />
          </div>
          <span className="text-foreground text-2xl font-bold tracking-tight">tono</span>
        </Link>
      </div>

      {/* Main Nav */}
      <div className="space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-secondary text-primary ring-primary/10 shadow-sm ring-1'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
