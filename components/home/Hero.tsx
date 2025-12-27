import { AppWindow } from '@/components/ui/app-window';
import GuestToneForm from './GuestToneForm';

export default function Hero() {
  return (
    <header className="relative overflow-hidden px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background Decorative Elements (Blobs & Doodles) */}
      <div className="blob-shape bg-secondary absolute top-20 left-10 -z-10 h-24 w-24 animate-pulse opacity-60"></div>
      <div className="blob-shape bg-primary/20 absolute right-10 bottom-20 -z-10 h-40 w-40 opacity-60"></div>
      <div className="border-primary/30 absolute top-40 right-1/4 -z-10 h-12 w-12 rounded-full border-4 opacity-50"></div>

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        {/* Hero Badge */}
        <div className="animate-fade-in-up border-primary/20 bg-card mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm">
          <span className="bg-accent h-2 w-2 rounded-full"></span>
          <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Powered by AI
          </span>
        </div>

        <h1 className="text-foreground mb-8 text-5xl leading-[1.1] font-bold tracking-tight md:text-7xl lg:text-8xl">
          The best place to <br className="hidden md:block" />
          <span className="font-script text-primary relative inline-block rotate-2 transform px-2">
            recreate
            {/* Underline Doodle */}
            <svg
              className="text-accent absolute -bottom-2 left-0 h-3 w-full"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
              aria-hidden="true"
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

        <p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed md:text-xl">
          tono uses advanced AI to analyze your desired sound and gear to recreate the guitar tone
          instantly on your amp.
        </p>

        <div className="animate-fade-in-up mt-12 w-full">
          <div className="relative mx-auto flex max-w-4xl flex-col items-center">
            {/* Label telling user to try it */}
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="animate-pulse text-green-500">●</span>
              <span>Live Demo - No account required</span>
            </div>

            <div className="w-full">
              <AppWindow>
                <GuestToneForm />
              </AppWindow>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
