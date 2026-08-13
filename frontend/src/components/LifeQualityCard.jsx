import React from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

export default function LifeQualityCard({ totalAssessments = 0 }) {
  // Score can be derived from assessments and telemetry
  const score = 1680 + (totalAssessments * 15);

  const bars = [40, 65, 30, 85, 95, 70, 50, 60, 90, 75, 45, 80];

  return (
    <div className="ref-card p-5 relative overflow-hidden flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-700">Life Quality</h3>
        <div className="flex items-center gap-2">
          <button className="text-slate-400 hover:text-slate-700">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full cursor-pointer">
            <span>Week</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Score Value */}
      <div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{score}</div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Quality Index</div>
      </div>

      {/* Mini Bar Chart Row */}
      <div className="flex items-end justify-between gap-1.5 h-10 mt-3 pt-2 border-t border-slate-100">
        {bars.map((height, i) => (
          <div 
            key={i} 
            className={`w-full rounded-t-sm transition-all ${
              i === 4 ? 'bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

    </div>
  );
}
