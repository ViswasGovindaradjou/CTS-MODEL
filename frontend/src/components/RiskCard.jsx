import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Info, TrendingUp } from 'lucide-react';

export default function RiskCard({ 
  title, 
  riskScore, 
  riskCategory, 
  keyFactors = [], 
  diseaseType = 'diabetes',
  timestamp 
}) {
  const { t } = useLanguage();

  const percentage = (riskScore * 100).toFixed(1);

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'HIGH':
        return 'badge-high';
      case 'MODERATE':
        return 'badge-moderate';
      case 'LOW':
      default:
        return 'badge-low';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'HIGH':
        return t('high_risk');
      case 'MODERATE':
        return t('moderate_risk');
      case 'LOW':
      default:
        return t('low_risk');
    }
  };

  const strokeColor = riskCategory === 'HIGH' ? '#f43f5e' : (riskCategory === 'MODERATE' ? '#f59e0b' : '#10b981');

  return (
    <div className="ref-card ref-card-hover p-6 relative overflow-hidden flex flex-col justify-between">
      
      {/* Background soft color glow */}
      <div 
        className="absolute -right-12 -bottom-12 w-36 h-36 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{title}</h3>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${getCategoryBadgeClass(riskCategory)}`}>
          {getCategoryLabel(riskCategory)}
        </span>
      </div>

      <div className="flex items-center gap-6 my-2">
        {/* SVG Circular Progress Gauge */}
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              strokeWidth="3.5"
              strokeDasharray={`${percentage}, 100`}
              strokeLinecap="round"
              stroke={strokeColor}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-lg font-black text-slate-900">{percentage}%</span>
            <span className="text-[9px] text-slate-400 uppercase font-bold">{t('probability')}</span>
          </div>
        </div>

        {/* Key Risk Drivers */}
        <div className="flex-1">
          <h4 className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            {t('key_factors')}
          </h4>
          <ul className="space-y-1">
            {keyFactors.slice(0, 3).map((factor, idx) => (
              <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-1.5 leading-tight">
                <span className="text-indigo-600 mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {timestamp && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Assessed: {new Date(timestamp).toLocaleDateString()}</span>
          <span className="flex items-center gap-1 text-indigo-600 font-bold">
            <TrendingUp className="w-3 h-3" /> ML Verified
          </span>
        </div>
      )}
    </div>
  );
}
