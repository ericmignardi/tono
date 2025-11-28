import { Music2, Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-100 bg-slate-50 px-6 pt-20 pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-center justify-between md:flex-row">
          <div className="mb-8 text-center md:mb-0 md:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
              <div className="bg-primary flex h-8 w-8 rotate-3 items-center justify-center rounded-lg">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">tono</span>
            </div>
            <p className="max-w-sm text-slate-500">
              Instantly recreate your favorite guitar tones with the power of AI.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="#"
              className="hover:border-primary/30 hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-pink-200 hover:text-pink-600"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              <Facebook className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 border-t border-slate-200 py-8 md:justify-between">
          <div className="flex gap-6">
            <Link href="/" className="hover:text-primary text-sm font-semibold text-slate-600">
              Home
            </Link>
            <Link
              href="#features"
              className="hover:text-primary text-sm font-semibold text-slate-600"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hover:text-primary text-sm font-semibold text-slate-600"
            >
              Pricing
            </Link>
            <Link
              href="#get-started"
              className="hover:text-primary text-sm font-semibold text-slate-600"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-primary text-sm font-semibold text-slate-600"
            >
              Dashboard
            </Link>
          </div>
          <p className="text-sm text-slate-400">
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
