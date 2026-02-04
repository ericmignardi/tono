'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import { Zap } from 'lucide-react';
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
  dashboard: 'Dashboard',
  create: 'Create Tone',
  tones: 'Tones',
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
    <header className="bg-background/80 border-border sticky top-0 z-10 flex h-16 items-center justify-between border-b px-8 backdrop-blur-md">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/create">
          <Button className="bg-primary shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            <Zap className="h-3.5 w-3.5 text-white" />
            Create Tone
          </Button>
        </Link>
        <div className="bg-border h-6 w-px"></div>
        <ThemeToggle />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
