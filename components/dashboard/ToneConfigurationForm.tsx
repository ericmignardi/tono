'use client';

import { Cpu, CheckCircle2, Sliders } from 'lucide-react';

export default function ToneConfigurationForm() {
  return (
    <div className="col-span-12 space-y-8 lg:col-span-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-px w-8 bg-accent"></span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Config Module</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tighter text-foreground uppercase">
          Signal <span className="text-muted-foreground/30 italic">Parameters</span>.
        </h1>
      </div>

      {/* Form Card */}
      <div className="relative">
        <div className="absolute -inset-px bg-linear-to-b from-border/50 to-transparent rounded-xl pointer-events-none"></div>
        <div className="space-y-10 rounded-xl border border-border bg-background/40 p-8 shadow-2xl backdrop-blur-xs">
          {/* Section 1: Identity */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground">
              <span className="bg-accent h-1.5 w-1.5 rounded-full animate-pulse" aria-hidden="true"></span>
              Core Identity
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="preset-name" className="terminal-label">
                  Sequence Designation
                </label>
                <input
                  id="preset-name"
                  type="text"
                  placeholder="E.G. NEURAL FLOW"
                  className="terminal-input w-full px-4 outline-hidden"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="target-artist" className="terminal-label">
                  Reference Blueprint
                </label>
                <input
                  id="target-artist"
                  type="text"
                  placeholder="ARTIST OR STYLE"
                  className="terminal-input w-full px-4 outline-hidden"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sonic-description" className="terminal-label">
                  Acoustic Metadata
                </label>
                <textarea
                  id="sonic-description"
                  rows={3}
                  placeholder="DESCRIBE TEXTURE AND GAIN STRUCTURE..."
                  className="terminal-input w-full p-4 min-h-[100px] outline-hidden resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border/30"></div>

          {/* Section 2: Input Gear */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground">
                <span className="bg-accent h-1.5 w-1.5 rounded-full" aria-hidden="true"></span>
                Input Source
              </h3>
              <span className="border border-border/50 bg-muted/20 px-2 py-0.5 font-mono text-[8px] font-black tracking-widest text-accent uppercase rounded-sm">
                SIGNAL DETECTED
              </span>
            </div>

            {/* Guitar Selector */}
            <fieldset className="space-y-3">
              <legend className="terminal-label">Hardware Configuration</legend>
              <div className="grid grid-cols-3 gap-3" role="radiogroup">
                {['STRAT', 'LP', 'HOLLOW'].map((type, i) => (
                  <label key={type} className="group relative cursor-pointer">
                    <input type="radio" name="guitar" className="peer sr-only" defaultChecked={i === 0} />
                    <div className="peer-checked:border-accent peer-checked:bg-accent/5 flex flex-col items-center justify-center gap-3 rounded-sm border border-border/50 bg-background/50 p-4 transition-all hover:border-accent/50">
                      <Cpu className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent peer-checked:text-accent" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground peer-checked:text-foreground">{type}</span>
                      <CheckCircle2 className="text-accent absolute top-2 right-2 h-3 w-3 opacity-0 transition-all peer-checked:opacity-100" />
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Pickups Segmented Control */}
            <fieldset className="space-y-3">
              <legend className="terminal-label">Transducer Map</legend>
              <div className="flex bg-muted/20 border border-border/50 rounded-sm p-1" role="radiogroup">
                {['Single Coil', 'Humbucker', 'P-90'].map((type, i) => (
                  <label key={type} className="flex-1 cursor-pointer">
                    <input type="radio" name="pickups" className="peer sr-only" defaultChecked={i === 0} />
                    <div className="rounded-sm py-2 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground transition-all peer-checked:bg-background peer-checked:text-accent peer-checked:shadow-lg">
                      {type}
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Strings Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="strings-gauge" className="terminal-label">
                  Tension Matrix
                </label>
                <span className="font-mono text-[10px] font-black text-accent">.010 - .046</span>
              </div>
              <input
                id="strings-gauge"
                type="range"
                min="8"
                max="13"
                step="1"
                defaultValue="10"
                className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">
                <span>Low Tension</span>
                <span>High Tension</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border/30"></div>

          {/* Section 3: Amplifier */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" aria-hidden="true"></span>
              Output Processor
            </h3>

            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Sliders className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors" />
              </div>
              <select
                id="amp-type"
                className="terminal-input w-full pl-12 pr-10 appearance-none outline-hidden cursor-pointer"
              >
                <option>American Clean (Fender Style)</option>
                <option>British Crunch (Vox Style)</option>
                <option>High Gain Lead (Mesa Style)</option>
                <option>Digital Modeler (Neutral)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <div className="h-1.5 w-1.5 border-r border-b border-muted-foreground/40 rotate-45"></div>
              </div>
            </div>
          </div>
          
          <button className="terminal-button-primary w-full h-14 shadow-2xl">
            Execute Synthesis
          </button>
        </div>
      </div>
    </div>
  );
}
