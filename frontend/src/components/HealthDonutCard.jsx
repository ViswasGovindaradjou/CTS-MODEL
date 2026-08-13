import React from 'react';

export default function HealthDonutCard({ 
  latestDiabetesRisk = 0.28,
  latestHeartRisk = 0.32,
  latestChronicRisk = 0.15,
  telemetry = null,
  healthScore = null
}) {
  // Compute overall health score dynamically if not passed directly
  let calculatedScore = 88;

  if (healthScore !== null && healthScore !== undefined) {
    calculatedScore = healthScore;
  } else {
    // Overall Health % = 100 - (Average Risk Score %)
    const avgRiskPct = ((latestDiabetesRisk + latestHeartRisk + latestChronicRisk) / 3) * 100;
    
    // Telemetry fine-tuning adjustments (heart rate & blood glucose)
    let heartAdjustment = 0;
    if (telemetry?.heart_rate_bpm) {
      if (telemetry.heart_rate_bpm > 100) heartAdjustment += 3; // slight risk penalty
      if (telemetry.heart_rate_bpm < 60) heartAdjustment += 2;
    }

    let glucoseAdjustment = 0;
    if (telemetry?.blood_glucose_mg_dl) {
      if (telemetry.blood_glucose_mg_dl > 140) glucoseAdjustment += 4;
    }

    calculatedScore = Math.max(15, Math.min(99, Math.round(100 - avgRiskPct - heartAdjustment - glucoseAdjustment)));
  }

  // Calculate SVG stroke offset for dynamic circular meter animation
  // Circumference = 2 * PI * r = 2 * 3.14159 * 38 ≈ 238.76
  const circumference = 238.76;
  const strokeOffset = circumference - (calculatedScore / 100) * circumference;

  return (
    <div className="ref-card p-6 flex flex-col items-center justify-center relative overflow-hidden h-full">
      
      {/* Central Circular Donut Canvas matching Reference Image */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        
        {/* SVG Multi-Segment Donut Chart */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="purpleSegment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="skySegment" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#f1f5f9"
            strokeWidth="14"
            fill="none"
          />

          {/* Segment 1: Secondary Sky Blue Segment */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="url(#skySegment)"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset="40"
            fill="none"
            strokeLinecap="round"
          />

          {/* Segment 2: Dynamic Main Purple Health Core Segment */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="url(#purpleSegment)"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-slate-900 tracking-tight transition-all duration-500">
            {calculatedScore}%
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Overall</span>
        </div>

        {/* Floating Labels Around Donut matching Reference */}
        <div className="absolute top-[8%] right-[10%] text-[10px] font-bold text-slate-500">
          Health
        </div>

        <div className="absolute bottom-[10%] right-[10%] text-[10px] font-bold text-slate-400">
          Stress
        </div>

        <div className="absolute bottom-[20%] left-[8%] text-[10px] font-bold text-slate-500">
          Activity
        </div>

        <div className="absolute top-[18%] left-[8%] text-[10px] font-bold text-indigo-600 font-extrabold">
          Metabolism
        </div>

      </div>

    </div>
  );
}
