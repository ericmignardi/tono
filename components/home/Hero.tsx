import { Wand2, Mic2, Music4 } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <header className="relative overflow-hidden px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background Decorative Elements (Blobs & Doodles) */}
      <div className="blob-shape bg-secondary absolute top-20 left-10 -z-10 h-24 w-24 animate-pulse opacity-60"></div>
      <div className="blob-shape bg-primary/20 absolute right-10 bottom-20 -z-10 h-40 w-40 opacity-60"></div>
      <div className="border-primary/30 absolute top-40 right-1/4 -z-10 h-12 w-12 rounded-full border-4 opacity-50"></div>

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        {/* Hero Badge */}
        <div className="animate-fade-in-up border-primary/20 mb-8 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm">
          <span className="bg-accent h-2 w-2 rounded-full"></span>
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Powered by AI
          </span>
        </div>

        <h1 className="mb-8 text-5xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-7xl lg:text-8xl">
          The best place to <br className="hidden md:block" />
          <span className="font-script text-primary relative inline-block rotate-2 transform px-2">
            recreate
            {/* Underline Doodle */}
            <svg
              className="text-accent absolute -bottom-2 left-0 h-3 w-full"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none"></path>
            </svg>
          </span>
          and
          <span className="font-script text-accent relative inline-block -rotate-2 transform px-2">
            share
            {/* Highlight Doodle */}
            <span className="bg-secondary absolute top-1/2 left-1/2 -z-10 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"></span>
          </span>
          <br /> the perfect tones.
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl">
          tono uses advanced AI to analyze your desired sound and gear to recreate the guitar tone
          instantly on your amp.
        </p>

        <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Arrow Doodle pointing to button */}
          <svg
            className="absolute top-0 -left-16 hidden h-16 w-16 -rotate-12 transform text-slate-300 md:block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M10 3s-4 4-2 9c2 5 7 3 9-1m-9-8c0 0-4 4-2 9"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M16 11l5 2-3 4"
            ></path>
          </svg>

          <Link
            href="/dashboard/create"
            className="bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold shadow-xl transition-all hover:-translate-y-1"
          >
            Generate Tone
            <Wand2 className="h-5 w-5" />
          </Link>
        </div>

        {/* Floating Hero Images/Icons */}
        <div
          className="absolute top-1/2 -left-4 hidden h-20 w-20 rotate-12 animate-bounce items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-xl md:flex lg:left-0"
          style={{ animationDuration: '3s' }}
        >
          <Mic2 className="text-accent h-8 w-8" />
        </div>
        <div
          className="absolute top-1/3 right-0 hidden h-24 w-24 -rotate-6 animate-bounce items-center justify-center rounded-full border border-slate-100 bg-white shadow-xl md:flex lg:right-10"
          style={{ animationDuration: '4s' }}
        >
          <Music4 className="text-primary h-10 w-10" />
        </div>
      </div>
    </header>
  );
}
