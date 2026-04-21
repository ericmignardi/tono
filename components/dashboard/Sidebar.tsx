'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Cpu, Library, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/create', label: 'Synthesis', icon: Cpu },
  { href: '/dashboard/tones', label: 'Archive', icon: Library },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-background z-20 flex h-full w-[280px] shrink-0 flex-col border-r border-border">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-accent/30 bg-background glow-amber transition-all group-hover:border-accent">
            <Activity className="h-4 w-4 text-accent" />
          </div>
          <span className="font-display text-xl font-black tracking-tighter text-foreground">TONO</span>
        </Link>
      </div>

      {/* Connection Status */}
      <div className="px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Terminal Online</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="space-y-2 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex w-full items-center gap-3 px-4 py-3 transition-all',
                isActive
                  ? 'bg-accent/10 border-l-2 border-accent text-foreground'
                  : 'text-muted-foreground border-l-2 border-transparent hover:bg-muted/10 hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
