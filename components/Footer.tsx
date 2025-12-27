import { Music2, Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-border bg-muted/30 relative border-t px-6 pt-20 pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-center justify-between md:flex-row">
          <div className="mb-8 text-center md:mb-0 md:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
              <div className="bg-primary flex h-8 w-8 rotate-3 items-center justify-center rounded-lg">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-foreground text-2xl font-bold tracking-tight">tono</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Instantly recreate your favorite guitar tones with the power of AI.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="#"
              aria-label="Follow us on Twitter"
              className="hover:border-primary/30 hover:text-primary border-border bg-card text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            >
              <Twitter className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="#"
              aria-label="Follow us on Instagram"
              className="border-border bg-card text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-pink-200 hover:text-pink-600"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="#"
              aria-label="Follow us on Facebook"
              className="border-border bg-card text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="border-border flex flex-wrap justify-center gap-8 border-t py-8 md:justify-between">
          <div className="flex gap-6">
            <Link
              href="/"
              className="hover:text-primary text-muted-foreground text-sm font-semibold"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="hover:text-primary text-muted-foreground text-sm font-semibold"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hover:text-primary text-muted-foreground text-sm font-semibold"
            >
              Pricing
            </Link>
            <Link
              href="#get-started"
              className="hover:text-primary text-muted-foreground text-sm font-semibold"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-primary text-muted-foreground text-sm font-semibold"
            >
              Dashboard
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} tono. All rights reserved.
          </p>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="pointer-events-none fixed right-0 bottom-0 z-50">
        <div className="bg-accent h-32 w-32 rounded-full opacity-40 blur-[80px]"></div>
      </div>
      <div className="pointer-events-none fixed top-0 left-0 z-50">
        <div className="bg-primary h-32 w-32 rounded-full opacity-20 blur-[80px]"></div>
      </div>
    </footer>
  );
}
