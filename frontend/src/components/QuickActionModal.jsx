import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Activity, 
  HeartPulse, 
  ShieldAlert, 
  FileUp, 
  Watch, 
  MessageSquareHeart, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function QuickActionModal({ isOpen, onClose, onToggleChat }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const actions = [
    {
      title: 'Run Diabetes Risk Test',
      desc: 'Execute 8-metric clinical ML prediction model',
      icon: Activity,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      action: () => { navigate('/assess/diabetes'); onClose(); }
    },
    {
      title: 'Run Cardiovascular Risk Test',
      desc: 'Evaluate 13-parameter cardiac risk pipeline',
      icon: HeartPulse,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      action: () => { navigate('/assess/heart'); onClose(); }
    },
    {
      title: 'Run Chronic Assessment',
      desc: 'Screen 19 CDC BRFSS epidemiological metrics',
      icon: ShieldAlert,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      action: () => { navigate('/assess/chronic'); onClose(); }
    },
    {
      title: 'Upload Patient Lab PDF',
      desc: 'Auto-extract lab report data into prediction fields',
      icon: FileUp,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      action: () => { navigate('/assess/diabetes'); onClose(); }
    },
    {
      title: 'Sync Wearable Biometrics',
      desc: 'Fetch live smartwatch heart rate & blood telemetry',
      icon: Watch,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
      action: () => { navigate('/assess/heart'); onClose(); }
    },
    {
      title: 'Ask AI Health Assistant',
      desc: 'Interactive AI chatbot (Tamil, English, Hindi)',
      icon: MessageSquareHeart,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      action: () => { onToggleChat(); onClose(); }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative overflow-hidden space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Quick Health Actions</h3>
              <p className="text-xs text-slate-400">Execute ML diagnostics or sync telemetry</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((act, index) => {
            const Icon = act.icon;
            return (
              <button
                key={index}
                onClick={act.action}
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/80 transition-all text-left group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                    {act.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
