'use client';

import { Mic2, Zap, CircleDot, Box, CheckCircle2 } from 'lucide-react';

export default function ToneConfigurationForm() {
  return (
    <div className="col-span-12 space-y-6 lg:col-span-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tone Configuration</h1>
        <p className="text-sm text-slate-500">
          Define the parameters for your AI-generated signal chain.
        </p>
      </div>

      {/* Form Card */}
      <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Section 1: Identity */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-900 uppercase">
            <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
            Identity
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Preset Name</label>
              <input
                type="text"
                placeholder="e.g. Stratocaster Dreams"
                className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Target Artist / Style
              </label>
              <div className="relative">
                <Mic2 className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. John Mayer, Tame Impala..."
                  className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder-slate-400 transition-all focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Sonic Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the texture, mood, or specific song reference..."
                className="focus:border-primary focus:ring-primary/20 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:ring-2 focus:outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-slate-100"></div>

        {/* Section 2: Input Gear */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-900 uppercase">
              <span className="bg-accent h-1.5 w-1.5 rounded-full"></span>
              Input Gear
            </h3>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              DETECTED
            </span>
          </div>

          {/* Guitar Selector */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">Guitar Type</label>
            <div className="grid grid-cols-3 gap-2">
              {/* Option 1 */}
              <label className="group relative cursor-pointer">
                <input type="radio" name="guitar" className="peer sr-only" defaultChecked />
                <div className="peer-checked:border-primary peer-checked:bg-secondary peer-checked:text-primary hover:border-primary/30 flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center transition-all hover:bg-slate-50">
                  <Zap className="group-hover:text-primary peer-checked:text-primary h-5 w-5 text-slate-400 transition-colors" />
                  <span className="peer-checked:text-primary text-xs font-semibold text-slate-600">
                    Strat
                  </span>
                  <CheckCircle2 className="text-primary absolute top-2 right-2 h-3.5 w-3.5 scale-75 transform opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
                </div>
              </label>
              {/* Option 2 */}
              <label className="group relative cursor-pointer">
                <input type="radio" name="guitar" className="peer sr-only" />
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center transition-all peer-checked:border-violet-500 peer-checked:bg-violet-50 peer-checked:text-violet-700 hover:border-violet-300 hover:bg-slate-50">
                  <CircleDot className="h-5 w-5 text-slate-400 transition-colors group-hover:text-violet-500 peer-checked:text-violet-600" />
                  <span className="text-xs font-semibold text-slate-600 peer-checked:text-violet-700">
                    LP
                  </span>
                  <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 scale-75 transform text-violet-600 opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
                </div>
              </label>
              {/* Option 3 */}
              <label className="group relative cursor-pointer">
                <input type="radio" name="guitar" className="peer sr-only" />
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center transition-all peer-checked:border-violet-500 peer-checked:bg-violet-50 peer-checked:text-violet-700 hover:border-violet-300 hover:bg-slate-50">
                  <Box className="h-5 w-5 text-slate-400 transition-colors group-hover:text-violet-500 peer-checked:text-violet-600" />
                  <span className="text-xs font-semibold text-slate-600 peer-checked:text-violet-700">
                    Hollow
                  </span>
                  <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 scale-75 transform text-violet-600 opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" />
                </div>
              </label>
            </div>
          </div>

          {/* Pickups Segmented Control */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">Pickups</label>
            <div className="flex rounded-lg bg-slate-100 p-1">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="pickups" className="peer sr-only" defaultChecked />
                <div className="rounded-md py-1.5 text-center text-xs font-semibold text-slate-500 transition-all peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm">
                  Single Coil
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="pickups" className="peer sr-only" />
                <div className="rounded-md py-1.5 text-center text-xs font-semibold text-slate-500 transition-all peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm">
                  Humbucker
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="pickups" className="peer sr-only" />
                <div className="rounded-md py-1.5 text-center text-xs font-semibold text-slate-500 transition-all peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm">
                  P-90
                </div>
              </label>
            </div>
          </div>

          {/* Strings Slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-500">Strings Gauge</label>
              <span className="font-mono text-xs font-bold text-slate-700">.010 - .046</span>
            </div>
            <input
              type="range"
              min="8"
              max="13"
              step="1"
              defaultValue="10"
              className="accent-primary w-full"
            />
            <div className="mt-1 flex justify-between px-1 text-[10px] font-medium text-slate-400">
              <span>Light</span>
              <span>Heavy</span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-slate-100"></div>

        {/* Section 3: Amplifier */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-900 uppercase">
            <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
            Amplification
          </h3>

          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {/* Speaker icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-slate-400"
              >
                <rect width="16" height="20" x="4" y="2" rx="2" />
                <circle cx="12" cy="14" r="4" />
                <line x1="12" x2="12.01" y1="6" y2="6" />
              </svg>
            </div>
            <select className="focus:border-primary focus:ring-primary/20 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-10 text-sm text-slate-900 focus:ring-2 focus:outline-none">
              <option>American Clean (Fender Style)</option>
              <option>British Crunch (Vox Style)</option>
              <option>High Gain Lead (Mesa Style)</option>
              <option>Digital Modeler (Neutral)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              {/* ChevronDown icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-slate-400"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
