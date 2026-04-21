import { AppWindow } from '@/components/ui/app-window';
import GuestToneForm from './GuestToneForm';

export default function Hero() {
  return (
    <header className="grain relative min-h-screen overflow-hidden px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          {/* Subtle Serial Number / Model Indicator */}
          <div className="mb-12 flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
            <span>Model: Tono-01</span>
            <span className="h-px w-8 bg-border"></span>
            <span>Ver: 2.0.4 AI</span>
          </div>

          <h1 className="font-display mb-10 text-5xl font-bold leading-[0.9] tracking-tighter text-foreground md:text-8xl lg:text-9xl">
            PRECISION <br className="hidden md:block" />
            <span className="text-muted-foreground/20 italic">AUDIO</span> <br className="hidden md:block" />
            ENGINEERING.
          </h1>

          <p className="mx-auto mb-16 max-w-xl text-balance text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
            Tono uses high-fidelity neural networks to deconstruct and rebuild your guitar tone with 
            surgical accuracy. Hardware-specific settings for the modern player.
          </p>

          <div className="relative mt-12 w-full">
            <div className="absolute inset-0 -top-20 bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="relative mx-auto flex max-w-4xl flex-col items-center">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-12 bg-border"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                  Direct Console Input
                </span>
                <div className="h-px w-12 bg-border"></div>
              </div>

              <div className="w-full">
                <AppWindow className="border-border/40 glow-amber ring-1 ring-accent/5">
                  <GuestToneForm />
                </AppWindow>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 h-px w-full bg-linear-to-r from-transparent via-border/20 to-transparent"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-linear-to-b from-transparent via-border/20 to-transparent"></div>
      </div>
    </header>
  );
}
