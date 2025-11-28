import { Sliders, ArrowRight, Wand2, Library } from 'lucide-react';
import Link from 'next/link';

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-16">
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Your Personal <br />
          <span className="font-script text-primary">Tone Engineer.</span>
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="bg-secondary text-secondary-foreground -rotate-2 transform rounded-full px-6 py-2 text-sm font-semibold">
            #ai_powered
          </span>
          <span className="bg-accent/20 text-accent-foreground rotate-1 transform rounded-full px-6 py-2 text-sm font-semibold">
            #gear_match
          </span>
          <span className="-rotate-1 transform rounded-full bg-slate-100 px-6 py-2 text-sm font-semibold text-slate-700">
            #instant_tone
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: AI Analysis */}
        <div className="group bg-secondary relative rounded-[2.5rem] p-8 transition-transform duration-300 hover:-translate-y-2 md:p-10">
          <div className="absolute top-10 right-10">
            {/* Dotted Pattern */}
            <div className="grid grid-cols-3 gap-1 opacity-20">
              <div className="bg-primary h-2 w-2 rounded-full"></div>
              <div className="bg-primary h-2 w-2 rounded-full"></div>
              <div className="bg-primary h-2 w-2 rounded-full"></div>
              <div className="bg-primary h-2 w-2 rounded-full"></div>
              <div className="bg-primary h-2 w-2 rounded-full"></div>
              <div className="bg-primary h-2 w-2 rounded-full"></div>
            </div>
          </div>

          <div className="mb-8 flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:rotate-6">
            <Wand2 className="text-primary h-8 w-8" />
          </div>

          <h3 className="font-script mb-2 text-3xl font-bold text-slate-900">
            AI-Powered <br /> Analysis
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-slate-600">
            Describe any tone in plain English—"warm jazz", "80s metal", or "John Mayer lead". Our
            AI understands musical context.
          </p>
        </div>

        {/* Card 2: Gear Match (Featured) */}
        <div className="group bg-primary relative overflow-hidden rounded-[2.5rem] p-8 text-white transition-transform duration-300 hover:-translate-y-2 md:p-10">
          {/* Background Shape */}
          <div className="bg-accent absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-50 mix-blend-screen"></div>
          <div className="from-primary/50 absolute right-0 bottom-0 h-24 w-full bg-linear-to-t to-transparent"></div>

          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/20 shadow-inner backdrop-blur-sm">
            <Sliders className="h-8 w-8 text-white" />
          </div>

          <h3 className="font-script mb-2 text-3xl font-bold text-white">
            Gear-Specific <br /> Settings
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-white/90">
            Don't just get generic advice. Get settings tailored to <em>your</em> specific guitar
            and amplifier model.
          </p>
        </div>

        {/* Card 3: Library */}
        <div className="group bg-accent/30 relative rounded-[2.5rem] p-8 transition-transform duration-300 hover:-translate-y-2 md:p-10">
          <div className="absolute top-8 right-8 flex gap-1">
            <div className="h-2 w-2 rounded-full bg-slate-900/10"></div>
            <div className="h-2 w-2 rounded-full bg-slate-900/10"></div>
          </div>

          <div className="mb-8 flex h-16 w-16 -rotate-3 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:-rotate-6">
            <Library className="text-accent-foreground h-8 w-8" />
          </div>

          <h3 className="font-script mb-2 text-3xl font-bold text-slate-900">
            Persistent <br /> Library
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-slate-800/80">
            Save your favorite configurations. Build a personal library of tones for every gig and
            practice session.
          </p>
        </div>
      </div>
    </section>
  );
}
