import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function GetStarted() {
  return (
    <section id="get-started" className="bg-primary relative overflow-hidden py-24">
      {/* Background Patterns */}
      <div className="absolute top-0 left-0 h-full w-full overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white mix-blend-overlay blur-3xl filter"></div>
        <div className="bg-accent absolute right-10 bottom-10 h-96 w-96 rounded-full mix-blend-overlay blur-3xl filter"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-block">
          <Sparkles
            className="animate-spin-slow text-accent h-12 w-12"
            style={{ animationDuration: '10s' }}
          />
        </div>
        <h2 className="mb-6 text-3xl leading-tight font-semibold tracking-tight text-white md:text-5xl">
          Ready to find your <span className="font-script text-accent">perfect sound?</span>
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
          Join thousands of guitarists using tono to discover, create, and share amazing tones.
          Start your journey today—it's free.
        </p>

        <Link
          href="/dashboard"
          className="text-primary hover:bg-secondary inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold shadow-xl transition-transform hover:-translate-y-1"
        >
          Get Started <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
