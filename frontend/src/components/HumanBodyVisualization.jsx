import React from 'react';
import { Activity, Heart, ArrowUpRight } from 'lucide-react';

export default function HumanBodyVisualization({ 
  latestDiabetesRisk = 0.28, 
  latestHeartRisk = 0.32, 
  latestChronicRisk = 0.15,
  telemetry = null 
}) {
  const heartBpm = telemetry?.heart_rate_bpm || 108;
  const glucose = telemetry?.blood_glucose_mg_dl || 120;

  const avgRiskPct = Math.round(((latestDiabetesRisk + latestHeartRisk + latestChronicRisk) / 3) * 100);

  return (
    <div className="ref-card p-6 flex flex-col justify-between h-full relative overflow-hidden group bg-white">
      
      {/* Card Top Action Header matching Reference */}
      <div className="flex items-center justify-between mb-2 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Live Body Telemetry</h3>
            <p className="text-[11px] text-slate-400 font-medium">Real-Time Organ Scan</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Live Body Scan</span>
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer ml-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Medical Illustration Area matching Reference Image */}
      <div className="relative flex-1 flex items-center justify-center min-h-[380px] my-1">
        
        {/* Ambient Glow Background */}
        <div className="absolute w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Realistic Anatomical Human Body Graphic Image */}
        <img 
          src="/human_body_medical.png" 
          alt="3D Anatomical Human Body Medical Visualization" 
          className="h-[360px] w-auto object-contain z-10 filter drop-shadow-md transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Pointer Lines Overlay SVG */}
        <svg viewBox="0 0 300 400" className="absolute inset-0 w-full h-full z-15 pointer-events-none">
          {/* Line to Heart (Chest left) */}
          <line x1="144" y1="128" x2="60" y2="200" stroke="#f43f5e" strokeWidth="1.8" opacity="0.9" />
          <circle cx="144" cy="128" r="4" fill="#f43f5e" />

          {/* Line to Glucose/Pancreas (Abdomen right) */}
          <line x1="152" y1="165" x2="210" y2="225" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
          <circle cx="152" cy="165" r="4" fill="#3b82f6" />
        </svg>

        {/* Floating Callout Badge 1: HEART (Middle Left) */}
        <div className="absolute top-[48%] left-[0%] z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-rose-200 px-3 py-1.5 rounded-full shadow-lg">
          <Heart className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <div className="text-[11px] font-black text-slate-900">Heart • {heartBpm} bpm</div>
        </div>

        {/* Floating Callout Badge 2: GLUCOSE / METABOLISM (Middle Right) */}
        <div className="absolute top-[54%] right-[2%] z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-full shadow-md">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <div className="text-[11px] font-black text-slate-800">Glucose</div>
          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{glucose} mg/dL</span>
        </div>

        {/* Bottom Left Circular Risk Arc Gauge matching Reference */}
        <div className="absolute bottom-[2%] left-[4%] z-20 flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-200/80 p-2.5 rounded-2xl shadow-md">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="4"
                strokeDasharray={`${avgRiskPct}, 100`}
                strokeLinecap="round"
                stroke="#6366f1"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-slate-900">{avgRiskPct}%</span>
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-slate-900">Risk Index</div>
            <div className="text-[10px] text-slate-400 font-medium">Calculated Telemetry</div>
          </div>
        </div>

      </div>

      {/* Footer Dots Indicator matching Reference */}
      <div className="flex items-center justify-center gap-1.5 mt-2 z-20">
        <span className="w-5 h-1.5 rounded-full bg-slate-900" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
      </div>

    </div>
  );
}
