'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import { Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

const routeNames: Record<string, string> = {
  dashboard: 'Overview',
  create: 'Synthesis',
  tones: 'Archive',
};

export default function Header() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, label, isLast: index === pathSegments.length - 1 };
  });

  return (
    <header className="bg-background/90 border-border sticky top-0 z-10 flex h-16 items-center justify-between border-b px-8 backdrop-blur-md">
      <Breadcrumb>
        <BreadcrumbList className="text-[10px] font-bold uppercase tracking-widest font-mono">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <BreadcrumbSeparator className="text-muted-foreground/40" />}
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="text-accent">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-6">
        <Link href="/dashboard/create">
          <Button className="group bg-accent text-background hover:bg-accent/90 flex items-center gap-2 rounded-sm px-4 py-2 shadow-lg transition-transform hover:scale-[1.02]">
            <Cpu className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy Synthesis</span>
          </Button>
        </Link>
        <div className="bg-border h-4 w-px"></div>
        <ThemeToggle />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
