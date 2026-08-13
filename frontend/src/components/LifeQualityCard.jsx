import React, { useState, useEffect } from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

export default function LifeQualityCard({ totalAssessments = 0 }) {
  const [timeframe, setTimeframe] = useState('Week');

  useEffect(() => {
    const handleTimeframeChange = (e) => {
      if (e.detail) {
        setTimeframe(e.detail);
      }
    };
    window.addEventListener('timeframeChanged', handleTimeframeChange);
    return () => window.removeEventListener('timeframeChanged', handleTimeframeChange);
  }, []);

  // Dynamic score and bar data based on selected timeframe
  const getDataForTimeframe = () => {
    switch (timeframe) {
      case 'Month':
        return {
          score: 1850 + (totalAssessments * 20),
          bars: [45, 60, 75, 50, 90, 85, 65, 70, 95, 80, 55, 100],
          highlightIndex: 8
        };
      case 'Year':
        return {
          score: 2120 + (totalAssessments * 30),
          bars: [60, 75, 85, 95],
          highlightIndex: 3
        };
      case 'Week':
      default:
        return {
          score: 1680 + (totalAssessments * 15),
          bars: [40, 65, 30, 85, 95, 70, 50],
          highlightIndex: 4
        };
    }
  };

  const data = getDataForTimeframe();

  return (
    <div className="ref-card p-5 relative overflow-hidden flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-700">Life Quality</h3>
        <div className="flex items-center gap-2">
          <button className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Interactive Timeframe Dropdown (Week / Month / Year) */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/80 transition-colors px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 cursor-pointer">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none appearance-none pr-4 cursor-pointer"
            >
              <option value="Week">Week</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Score Value */}
      <div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight transition-all duration-300">
          {data.score}
        </div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          Quality Index ({timeframe})
        </div>
      </div>

      {/* Mini Bar Chart Row */}
      <div className="flex items-end justify-between gap-1.5 h-10 mt-3 pt-2 border-t border-slate-100">
        {data.bars.map((height, i) => (
          <div 
            key={i} 
            className={`w-full rounded-t-sm transition-all duration-300 ${
              i === data.highlightIndex ? 'bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'
            }`}
            style={{ height: `${height}%` }}
            title={`Val: ${height}`}
          />
        ))}
      </div>

    </div>
  );
}
