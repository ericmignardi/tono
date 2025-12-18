'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sliders, Library, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getToneCount } from '@/lib/actions/tones';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const baseNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/create', label: 'Create', icon: Sliders },
  { href: '/dashboard/tones', label: 'Tones', icon: Library },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [toneCount, setToneCount] = useState<number | null>(null);

  useEffect(() => {
    // Refetch tone count whenever the route changes
    getToneCount().then(setToneCount);
  }, [pathname]); // Re-run when pathname changes

  const navItems: NavItem[] = baseNavItems.map((item) => {
    if (item.href === '/dashboard/tones' && toneCount !== null) {
      return { ...item, badge: toneCount.toString() };
    }
    return item;
  });

  return (
    <aside className="z-20 flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary shadow-primary/20 flex h-10 w-10 rotate-3 items-center justify-center rounded-xl text-white shadow-lg">
            <Music2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">tono</span>
        </Link>
      </div>

      {/* Main Nav */}
      <div className="space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-secondary text-primary ring-primary/10 shadow-sm ring-1'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                )}
              />
              {label}
              {badge && (
                <span className="ml-auto rounded bg-slate-100 px-1.5 text-xs text-slate-500">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
