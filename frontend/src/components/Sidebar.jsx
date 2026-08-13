import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Activity, 
  HeartPulse, 
  ShieldAlert, 
  LineChart, 
  History,
  Bell, 
  MessageSquareHeart, 
  User,
  Sparkles,
  Stethoscope
} from 'lucide-react';

export default function Sidebar() {
  const { t } = useLanguage();

  const navItems = [
    { to: "/", label: t('dashboard'), icon: LayoutDashboard },
    { to: "/assess/diabetes", label: t('diabetes_assessment'), icon: Activity },
    { to: "/assess/heart", label: t('heart_assessment'), icon: HeartPulse },
    { to: "/assess/chronic", label: t('chronic_assessment'), icon: ShieldAlert },
    { to: "/history", label: t('history_trends'), icon: LineChart },
    { to: "/recommendations", label: t('recommendations'), icon: Sparkles },
    { to: "/prediction-history", label: t('prediction_history'), icon: History },
    { to: "/chat", label: t('chatbot'), icon: MessageSquareHeart },
    { to: "/alerts", label: t('alerts'), icon: Bell },
    { to: "/profile", label: t('profile'), icon: User },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-200/80 p-3 lg:p-4 hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-80px)] shadow-sm rounded-2xl my-3 ml-3">
      
      {/* Top Section */}
      <div className="space-y-4">
        
        {/* Brand App Logo matching Reference */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="hidden lg:block">
            <h2 className="text-base font-black text-slate-900 tracking-tight">AuraHealth</h2>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">AI Monitoring</p>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-2" />

        {/* Navigation Link List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all relative group ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                  }`
                }
                title={item.label}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    <span className="truncate hidden lg:inline">{item.label}</span>

                    {/* Tooltip for narrow screens */}
                    <div className="lg:hidden absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom AI Status Badge */}
      <div className="p-3 bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 rounded-2xl border border-indigo-100/80 hidden lg:block space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-slate-800">ML Engines Active</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Pima, Heart, & BRFSS pipelines online.
        </p>
      </div>

    </aside>
  );
}
