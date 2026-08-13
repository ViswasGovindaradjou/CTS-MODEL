import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Activity, 
  HeartPulse, 
  ShieldAlert, 
  Sparkles, 
  LineChart, 
  Bell, 
  MessageSquareHeart, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  Database,
  Lock,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{t('app_title')}</h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Chronic Health Risk & ML Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600 transition-colors">Home</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 transition-colors">Platform Features</button>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              to="/login"
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              {t('login')}
            </Link>
            <Link 
              to="/signup"
              className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>{t('get_started')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold shadow-sm">
              <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Next-Gen Enterprise Clinical AI Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              AI-Powered <br />
              <span className="text-indigo-600">Chronic Disease</span> <br />
              Risk Prediction System
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-2xl">
              Seamlessly monitor Diabetes, Cardiovascular, and Epidemiological health risks with pre-trained machine learning pipelines, live IoT smartwatch biometrics, PDF report auto-extraction, and AI care guidance in Tamil, English, and Hindi.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                to="/signup"
                className="px-7 py-3.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Clinical Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/login"
                className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs shadow-sm transition-all"
              >
                Sign In To Portal
              </Link>
            </div>

          </div>

          {/* Right Hero Preview Panel */}
          <div className="lg:col-span-5 ref-card p-6 border border-slate-200/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900">Live Health Telemetry</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Diabetes Risk</span>
                <span className="text-xl font-black text-indigo-600 mt-1 block">28.4%</span>
                <span className="text-[10px] text-emerald-600 font-bold">Low Risk</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Heart Risk</span>
                <span className="text-xl font-black text-rose-600 mt-1 block">32.1%</span>
                <span className="text-[10px] text-amber-600 font-bold">Moderate Risk</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 font-medium">
              ✨ Personalized AI recommendation generated for patient profile in Tamil & English.
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">Platform Capabilities</span>
          <h2 className="text-3xl font-black text-slate-900">Comprehensive Clinical Suite</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="ref-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Diabetes Pipeline</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Evaluates 8 clinical metrics (`preg`, `plas`, `pres`, `skin`, `insu`, `mass`, `pedi`, `age`) with `.pkl` pipeline execution.
            </p>
          </div>

          <div className="ref-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Cardiovascular Risk</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Processes 13 cardiology parameters (resting BP, cholesterol, max heart rate, ST depression) into risk categories.
            </p>
          </div>

          <div className="ref-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">CDC BRFSS Chronic Risk</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Integrates 19 epidemiological lifestyle and physiological parameters to assess long-term chronic conditions.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
