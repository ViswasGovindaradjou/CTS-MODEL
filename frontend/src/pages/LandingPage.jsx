import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  BarChart3, 
  ArrowRight, 
  Play, 
  Check, 
  Bot, 
  User, 
  Lock, 
  Smartphone, 
  TrendingUp, 
  CheckCircle2,
  Brain
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#00a8e8] selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. Header matching Reference 2 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 lg:px-12 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00a8e8] text-white flex items-center justify-center font-bold shadow-sm">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              HealthSync AI<span className="text-[#00a8e8] text-xs font-semibold align-super">™</span>
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="text-xs font-bold text-slate-700 hover:text-[#00a8e8] transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/login"
              className="px-5 py-2.5 rounded-full bg-[#00a8e8] hover:bg-[#0284c7] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Get Started Free</span>
            </Link>
          </div>

        </div>
      </header>

      {/* 2. Main Hero Section matching Reference 2 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-8 pb-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-[#00a8e8] text-xs font-bold border border-sky-100 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#00a8e8] animate-pulse" />
              <span>AI-Powered Health Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Welcome to <br />
              <span className="text-[#00a8e8]">HealthSync AI™</span>
            </h1>

            {/* Sub-headline */}
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Your Personalized <span className="text-[#00a8e8]">Health Tracker</span> with AI Assistance
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
              Track vitals, manage medications, get personalized AI insights, and carry your complete medical profile — all in one secure, intelligent app.
            </p>

            {/* Action Buttons matching Reference 2 */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                to="/login"
                className="px-6 py-3 rounded-full bg-[#00a8e8] hover:bg-[#0284c7] text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link 
                to="/login"
                className="px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#00a8e8] font-bold text-xs shadow-sm hover:border-sky-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                <span>Sign In</span>
              </Link>
            </div>

            {/* Trust Badges matching Reference 2 */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-semibold pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Free to start</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> HIPAA-aware</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Setup in 5 min</span>
            </div>

          </div>

          {/* Right Column Healthcare App Showcase Visual matching Reference 2 */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px]">
            
            {/* Background Glow */}
            <div className="absolute w-96 h-96 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />

            {/* Mockup Container Showcase */}
            <div className="relative w-full max-w-lg flex items-center justify-center gap-3">
              
              {/* Phone Mockup 1: SyncAI Coach */}
              <div className="w-44 sm:w-52 bg-white rounded-3xl border border-slate-200 shadow-xl p-3.5 space-y-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300 z-20">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                    <Bot className="w-4 h-4 text-[#00a8e8]" />
                    <span>SyncAI Coach</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                
                <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100 text-[10px] text-sky-950 font-medium space-y-1">
                  <p className="font-extrabold text-sky-800">Care Recommendations:</p>
                  <p>• Keep blood pressure target below 120/80 mmHg.</p>
                  <p>• Perform 30 mins aerobic walking daily.</p>
                  <p>• Increase intake of omega-3 rich whole foods.</p>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 text-[9px] text-slate-500 font-semibold space-y-1">
                  <div className="flex justify-between"><span>Hydration:</span><strong className="text-slate-800">2.5 L / 3 L</strong></div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00a8e8] h-full w-[80%]" />
                  </div>
                </div>
              </div>

              {/* Phone Mockup 2: Main Dashboard Showcase */}
              <div className="w-56 sm:w-64 bg-slate-900 text-white rounded-[2.5rem] border-4 border-slate-800 shadow-2xl p-4 space-y-3 z-30 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Good morning,</span>
                    <strong className="text-white font-extrabold">Alex Patient</strong>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 text-[#00a8e8] flex items-center justify-center font-bold text-xs">
                    AP
                  </div>
                </div>

                {/* Health Score Box */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-900/60 to-slate-800 border border-sky-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-sky-300 font-bold uppercase tracking-wider block">Health Score</span>
                    <span className="text-2xl font-black text-white">87 <span className="text-xs text-slate-400 font-medium">/ 100</span></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Good</span>
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block font-bold">Heart Rate</span>
                    <span className="text-base font-extrabold text-white">72 <span className="text-[9px] text-slate-400 font-normal">bpm</span></span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block font-bold">Blood Pressure</span>
                    <span className="text-base font-extrabold text-white">118/76</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block font-bold">Blood Oxygen</span>
                    <span className="text-base font-extrabold text-sky-400">98%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block font-bold">Glucose</span>
                    <span className="text-base font-extrabold text-white">98 <span className="text-[9px] text-slate-400 font-normal">mg/dL</span></span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/60 text-[9px] text-sky-200 font-medium">
                  💡 <strong className="text-sky-300 font-bold">AI Insight:</strong> Sleep quality improved 12% this week. Great recovery trends!
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* 3. Hero Information Strip (4 Items matching Reference) */}
        <div className="mt-16 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          <div className="flex items-start gap-3.5 pt-4 sm:pt-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#00a8e8] flex items-center justify-center shrink-0 border border-sky-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">Secure & Private</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Your health data is protected.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pt-4 sm:pt-0 sm:pl-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">Personalized Care</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">AI-assisted personalized recommendations.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pt-4 lg:pt-0 lg:pl-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">Real-time Analytics</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Track health trends and risk.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pt-4 lg:pt-0 lg:pl-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">AI-Powered Insights</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">ML-powered health risk analysis.</p>
            </div>
          </div>

        </div>

      </main>

      {/* 4. Footer */}
      <footer className="w-full bg-white border-t border-slate-100 py-4 px-6 text-center text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} HealthSync AI Platform. All rights reserved.
      </footer>

    </div>
  );
}
