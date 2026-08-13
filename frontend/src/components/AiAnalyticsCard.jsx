import React from 'react';
import { Sparkles, Activity, ArrowUpRight } from 'lucide-react';

export default function AiAnalyticsCard({ totalAssessments = 0 }) {
  return (
    <div className="dark-ai-card p-6 relative overflow-hidden flex flex-col justify-between text-white min-h-[160px] group">
      
      {/* Sleek Neural Glowing Vector Illustration in background */}
      <div className="absolute top-0 right-0 w-3/5 h-full pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="aiBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="aiPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Neural Wave Strand 1 */}
          <path
            d="M 10 30 Q 50 80 100 30 T 190 30"
            fill="none"
            stroke="url(#aiBlue)"
            strokeWidth="3"
          />

          {/* Neural Wave Strand 2 */}
          <path
            d="M 10 70 Q 50 20 100 70 T 190 70"
            fill="none"
            stroke="url(#aiPurple)"
            strokeWidth="3"
          />

          {/* Rungs */}
          <line x1="30" y1="45" x2="30" y2="55" stroke="#93c5fd" strokeWidth="2" opacity="0.8" />
          <line x1="60" y1="68" x2="60" y2="32" stroke="#c084fc" strokeWidth="2" opacity="0.8" />
          <line x1="90" y1="36" x2="90" y2="64" stroke="#818cf8" strokeWidth="2" opacity="0.8" />
          <line x1="120" y1="65" x2="120" y2="35" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
          <line x1="150" y1="38" x2="150" y2="62" stroke="#c084fc" strokeWidth="2" opacity="0.8" />
          
          {/* Nodes */}
          <circle cx="60" cy="32" r="4" fill="#a855f7" />
          <circle cx="60" cy="68" r="4" fill="#38bdf8" />
          <circle cx="120" cy="35" r="4" fill="#38bdf8" />
          <circle cx="120" cy="65" r="4" fill="#818cf8" />
        </svg>
      </div>

      {/* Header Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-cyan-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold text-white">AI Analytics</h3>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold tracking-wide backdrop-blur-md">
          Confidence 99%
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-4 z-10 max-w-[65%]">
        <h4 className="text-sm font-bold text-slate-100">AI & ML Risk Detection</h4>
        <p className="text-[11px] text-slate-300 leading-snug mt-1">
          Predictive machine learning pipelines continuously analyzing patient biomarkers & clinical parameters.
        </p>
      </div>

    </div>
  );
}
