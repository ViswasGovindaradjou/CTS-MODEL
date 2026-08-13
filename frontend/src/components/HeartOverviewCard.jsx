import React, { useState } from 'react';
import { MessageSquare, Settings, Maximize2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, Tooltip } from 'recharts';

export default function HeartOverviewCard({ telemetry, heartTrends }) {
  const [activeTab, setActiveTab] = useState('Heart Check');
  const [selectedIndex, setSelectedIndex] = useState(5);

  const currentBpm = telemetry?.heart_rate_bpm || 93;
  const currentSpo2 = telemetry?.spo2_pct || 98;
  const currentTemp = telemetry?.temperature_f || 98.6;

  const getMetricData = () => {
    switch (activeTab) {
      case 'Saturation':
        return {
          title: 'Oxygen saturation overview',
          val: currentSpo2,
          unit: '%',
          avg: 97,
          max: 99,
          data: [
            { label: '2am', val: 96 },
            { label: '4am', val: 97 },
            { label: '6am', val: 96 },
            { label: '8am', val: 98 },
            { label: '10am', val: 97 },
            { label: '12pm', val: currentSpo2 },
            { label: '2pm', val: 98 },
            { label: '4pm', val: 97 },
            { label: '6pm', val: 98 },
          ]
        };
      case 'Temperature':
        return {
          title: 'Body temperature overview',
          val: currentTemp,
          unit: '°F',
          avg: 98.2,
          max: 99.1,
          data: [
            { label: '2am', val: 97.8 },
            { label: '4am', val: 98.0 },
            { label: '6am', val: 98.2 },
            { label: '8am', val: 98.4 },
            { label: '10am', val: 98.6 },
            { label: '12pm', val: currentTemp },
            { label: '2pm', val: 98.5 },
            { label: '4pm', val: 98.3 },
            { label: '6pm', val: 98.1 },
          ]
        };
      case 'Heart Check':
      default:
        return {
          title: 'Heart rate overview',
          val: currentBpm,
          unit: 'bpm',
          avg: Math.round(currentBpm * 0.9),
          max: Math.round(currentBpm * 1.15),
          data: [
            { label: '2am', val: 68 },
            { label: '4am', val: 72 },
            { label: '6am', val: 85 },
            { label: '8am', val: 98 },
            { label: '10am', val: 110 },
            { label: '12pm', val: currentBpm },
            { label: '2pm', val: 92 },
            { label: '4pm', val: 84 },
            { label: '6pm', val: 78 },
          ]
        };
    }
  };

  const metric = getMetricData();
  const selectedPoint = metric.data[selectedIndex] || metric.data[5];

  return (
    <div className="ref-card p-6 flex flex-col justify-between h-full relative overflow-hidden bg-white">
      
      {/* Top Pill Controls matching Reference Image */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
        
        {/* Toggle Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-full text-xs font-bold text-slate-600">
          {['Heart Check', 'Saturation', 'Temperature'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedIndex(5);
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Small Utility Icons */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Header & 3D Heart Illustration */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-500">{metric.title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{selectedPoint.val}</span>
            <span className="text-xs font-bold text-slate-500">{metric.unit}</span>
          </div>
        </div>

        {/* Realistic 3D Heart Graphic Container */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-indigo-50 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
          {/* Animated SVG Heart */}
          <svg className="w-10 h-10 drop-shadow-md animate-pulse" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>
            <path
              d="M 50 88 C 20 62 8 42 16 26 C 24 10 42 12 50 26 C 58 12 76 10 84 26 C 92 42 80 62 50 88 Z"
              fill="url(#heartGrad)"
            />
            <path d="M 45 22 C 45 12 55 12 55 22" fill="none" stroke="#fb7185" strokeWidth="4" strokeLinecap="round" />
            <path d="M 40 25 C 38 18 44 14 48 20" fill="none" stroke="#fda4af" strokeWidth="3" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white animate-ping" />
        </div>
      </div>

      {/* Interactive Bar Chart with Highlighted Column */}
      <div className="relative h-44 w-full my-2">
        
        {/* Floating Highlight Badge matching Reference */}
        <div 
          className="absolute -top-1 z-10 bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 transition-all duration-300 pointer-events-none"
          style={{ left: `${(selectedIndex / (metric.data.length - 1)) * 82 + 5}%` }}
        >
          <span>lvl</span>
          <span className="font-extrabold">{selectedPoint.val}</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={metric.data} 
            margin={{ top: 25, right: 0, left: 0, bottom: 0 }}
            onClick={(state) => {
              if (state && state.activeTooltipIndex !== undefined) {
                setSelectedIndex(state.activeTooltipIndex);
              }
            }}
          >
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff', fontSize: '11px', border: 'none' }}
              formatter={(val) => [`${val} ${metric.unit}`, activeTab]}
            />
            <Bar dataKey="val" radius={[6, 6, 0, 0]} cursor="pointer">
              {metric.data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === selectedIndex ? '#6366f1' : '#e2e8f0'} 
                  className="transition-all duration-300 hover:opacity-80"
                  onClick={() => setSelectedIndex(index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats Row matching reference */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        
        <div className="flex items-center gap-6 text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Average
            </div>
            <div className="font-extrabold text-slate-800 text-sm mt-0.5">
              {metric.avg} <span className="text-[10px] font-normal text-slate-400">{metric.unit}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Max
            </div>
            <div className="font-extrabold text-slate-800 text-sm mt-0.5">
              {metric.max} <span className="text-[10px] font-normal text-slate-400">{metric.unit}</span>
            </div>
          </div>
        </div>

        <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
