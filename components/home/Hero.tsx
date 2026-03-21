import { AppWindow } from '@/components/ui/app-window';
import GuestToneForm from './GuestToneForm';

export default function Hero() {
  return (
    <header className="relative overflow-hidden px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
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
          recreate and share
          <br /> the <span className='text-transparent bg-clip-text bg-linear-to-r from bg-primary via-pink-500 to-primary'>perfect</span> tones.
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
