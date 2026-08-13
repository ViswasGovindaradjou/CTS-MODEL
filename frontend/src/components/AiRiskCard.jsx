import React from 'react';
import { Sparkles, ArrowUpRight, TrendingDown } from 'lucide-react';

export default function AiRiskCard({ latestDiabetes, latestHeart }) {
  const primaryAssessment = latestDiabetes || latestHeart;
  const score = primaryAssessment?.risk_score ? Math.round(primaryAssessment.risk_score * 100) : 30;
  const category = primaryAssessment?.risk_category || 'MODERATE';

  return (
    <div className="ref-card p-5 relative overflow-hidden flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Powered by AI
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Primary Pill Bar & Score */}
      <div className="my-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600">Risk Assessment</span>
          <span className="font-bold text-indigo-600">{category} RISK</span>
        </div>

        {/* Large Progress Bar Container */}
        <div className="relative w-full h-7 bg-slate-100 rounded-full p-1 flex items-center">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${Math.max(score, 25)}%` }}
          >
            <span className="text-[10px] font-black text-white">{score}%</span>
          </div>
        </div>
      </div>

      {/* Sub Stats */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">Risk Reduction</span>
        <span className="text-emerald-600 font-extrabold flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" /> -12% vs last month
        </span>
      </div>

    </div>
  );
}
