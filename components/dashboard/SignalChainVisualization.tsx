'use client';

import { RotateCcw, Share2, Activity, Thermometer, Sparkles } from 'lucide-react';

export default function SignalChainVisualization() {
  return (
    <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
      {/* Top Bar of Right Column */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Signal Chain</h2>
          <p className="text-xs text-slate-500">Live preview of generated components</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#1e293b] shadow-inner">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        {/* Signal Path SVG */}
        <svg
          className="pointer-events-none absolute top-1/2 left-0 z-0 h-20 w-full -translate-y-1/2"
          style={{ overflow: 'visible' }}
        >
          <path
            d="M0,40 C100,40 100,40 200,40 L600,40"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
          ></path>
          <path
            className="signal-line"
            d="M0,40 C100,40 100,40 200,40 L600,40"
            fill="none"
            stroke="#059669"
            strokeWidth="2"
          ></path>
        </svg>

        {/* Components Display */}
        <div className="relative z-10 flex flex-1 items-center gap-8 overflow-x-auto px-12">
          {/* Input Jack */}
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="h-4 w-4 rounded-full border-2 border-slate-500 bg-slate-700"></div>
            <span className="font-mono text-[10px] text-slate-400 uppercase">In</span>
          </div>

          {/* Pedal 1: Compressor */}
          <div className="group relative flex h-36 w-24 cursor-pointer flex-col items-center rounded-lg border-b-4 border-emerald-700 bg-emerald-500 p-3 shadow-xl transition-transform hover:-translate-y-1">
            <div className="mb-2 flex w-full justify-between">
              <div className="h-2 w-2 rounded-full bg-slate-900/30"></div>
              <div className="h-2 w-2 rounded-full bg-slate-900/30"></div>
            </div>
            <div className="mb-2 h-6 w-6 rounded-full border-2 border-slate-600 bg-slate-800 shadow-sm"></div>
            <span className="font-script mt-auto mb-4 text-lg leading-none text-white opacity-90">
              Squeeze
            </span>
            <div className="absolute bottom-3 h-6 w-6 rounded-full border border-slate-400 bg-slate-300 shadow-inner"></div>
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              Compressor
            </div>
          </div>

          {/* Pedal 2: Overdrive */}
          <div className="group relative flex h-36 w-24 cursor-pointer flex-col items-center rounded-lg border-b-4 border-amber-600 bg-amber-400 p-3 shadow-xl transition-transform hover:-translate-y-1">
            <div className="mb-2 flex w-full justify-between">
              <div className="h-2 w-2 rounded-full bg-slate-900/20"></div>
              <div className="h-2 w-2 rounded-full bg-slate-900/20"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-4 w-4 rounded-full border border-slate-600 bg-slate-800"></div>
              <div className="h-4 w-4 rounded-full border border-slate-600 bg-slate-800"></div>
            </div>
            <span className="font-script mt-auto mb-4 text-xl leading-none font-bold text-slate-900">
              Drive
            </span>
            <div className="absolute bottom-3 h-6 w-6 rounded-full border border-slate-400 bg-slate-200 shadow-inner"></div>
          </div>

          {/* Amp Head */}
          <div className="group relative flex h-32 w-48 flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-2xl">
            {/* Grill Cloth */}
            <div className="pattern-grid-lg absolute inset-2 rounded bg-[#2d2d2d] opacity-50"></div>
            {/* Control Panel */}
            <div className="absolute bottom-0 flex h-10 w-full items-center justify-center gap-3 border-t border-slate-600 bg-[#1a1a1a] px-2">
              <div className="h-3 w-3 rounded-full border border-slate-400 bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
              <div className="h-3 w-3 rounded-full border border-slate-500 bg-slate-600"></div>
              <div className="h-3 w-3 rounded-full border border-slate-500 bg-slate-600"></div>
              <div className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></div>
            </div>
            {/* Logo */}
            <div className="absolute top-4 left-4 z-10 border border-slate-500 px-1 text-xs font-bold text-slate-400 italic">
              TONO
            </div>
          </div>
        </div>

        {/* Bottom Info Strip */}
        <div className="flex h-10 items-center justify-between border-t border-slate-700 bg-slate-900/80 px-4 text-xs text-slate-400 backdrop-blur">
          <div className="flex gap-4">
            <span>CPU: 12%</span>
            <span>Latency: 4.2ms</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            Ready
          </div>
        </div>
      </div>

      {/* Stats / Output */}
      <div className="grid h-40 grid-cols-3 gap-4">
        {/* Stat Card 1 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="bg-secondary text-primary rounded-lg p-2">
              <Activity className="h-4 w-4" />
            </div>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
              High
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Dynamic Range</p>
            <p className="text-lg font-bold text-slate-900">
              -12 <span className="text-xs font-normal text-slate-400">dB</span>
            </p>
          </div>
        </div>
        {/* Stat Card 2 */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Thermometer className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Saturation</p>
            <p className="text-lg font-bold text-slate-900">
              45 <span className="text-xs font-normal text-slate-400">%</span>
            </p>
          </div>
        </div>
        {/* AI Insight */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-slate-900 p-4 text-white">
          <div className="bg-primary absolute top-0 right-0 h-20 w-20 translate-x-1/2 -translate-y-1/2 opacity-30 blur-2xl"></div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="text-accent h-3.5 w-3.5" />
            <span className="text-xs font-bold text-slate-300">AI Insight</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            &quot;Adding a compressor before the drive will tighten the low end for that specific
            Strat sound.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
