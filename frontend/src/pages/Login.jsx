import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  HeartPulse, 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Eye, 
  EyeOff, 
  User, 
  BarChart3, 
  Brain,
  Droplet,
  Activity
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f3ff] via-[#f8fafc] to-[#e8eeff] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between p-4 lg:p-8 relative overflow-x-hidden">
      
      {/* 1. Top Navigation Bar matching Reference 1 */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2 mb-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#00a8e8] text-white flex items-center justify-center shadow-md shadow-[#00a8e8]/20 shrink-0">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none flex items-center">
              HealthSync AI<span className="text-[#00a8e8] text-xs font-bold align-super ml-0.5">™</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Health Monitoring</p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-400 hidden sm:block">
          Smart care. Better health.
        </div>
      </header>

      {/* 2. Main Content Grid matching Reference 1 */}
      <main className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center my-4 z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column — Healthcare Medical Visualization Showcase */}
          <div className="lg:col-span-6 space-y-6 relative flex flex-col justify-between min-h-[480px]">
            
            {/* Title & Pulse Waveform Subtitle */}
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Welcome <span className="text-indigo-600">Back!</span>
              </h2>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium">
                <span>Sign in to continue managing your health journey.</span>
                <svg className="w-16 h-6 text-indigo-400 shrink-0" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M0 15 L20 15 L25 5 L30 25 L35 10 L40 20 L45 15 L100 15" />
                </svg>
              </div>
            </div>

            {/* 3D Model Pumping Heart Showcase */}
            <div className="relative flex items-center justify-center my-6 min-h-[380px]">
              
              {/* 3D Pumping Heart Model Image */}
              <img 
                src="/3d_heart_model.png" 
                alt="3D Pumping Heart Model" 
                className="h-[320px] w-auto object-contain z-10 animate-3d-heart-pump cursor-pointer filter drop-shadow-md"
              />

              {/* Floating Metric Card 1: Heart Rate (Top Left) */}
              <div className="absolute top-[8%] left-[0%] z-20 bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-2xl shadow-lg w-36 space-y-1 transform hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Heart Rate</span>
                </div>
                <div className="text-lg font-black text-slate-900">115 <span className="text-[10px] text-slate-400 font-normal">bpm</span></div>
                <svg className="w-full h-4 text-rose-400" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M0 10 L20 10 L25 2 L30 18 L35 5 L40 15 L45 10 L100 10" />
                </svg>
              </div>

              {/* Floating Metric Card 2: Blood Pressure (Top Right) */}
              <div className="absolute top-[18%] right-[0%] z-20 bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-2xl shadow-lg w-36 space-y-1 transform hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Droplet className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />
                  <span>Blood Pressure</span>
                </div>
                <div className="text-lg font-black text-slate-900">132 <span className="text-[10px] text-slate-400 font-normal">mmHg</span></div>
                <div className="flex items-end gap-1 h-3 pt-1">
                  <div className="w-2 bg-indigo-300 h-[40%] rounded-t-sm" />
                  <div className="w-2 bg-indigo-400 h-[70%] rounded-t-sm" />
                  <div className="w-2 bg-indigo-600 h-[100%] rounded-t-sm" />
                  <div className="w-2 bg-indigo-400 h-[60%] rounded-t-sm" />
                </div>
              </div>

              {/* Floating Metric Card 3: Sugar Level (Bottom Left) */}
              <div className="absolute bottom-[10%] left-[2%] z-20 bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-2xl shadow-lg w-36 space-y-1 flex items-center justify-between transform hover:-translate-y-1 transition-all">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <Activity className="w-3.5 h-3.5 text-sky-500" />
                    <span>Sugar Level</span>
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">98 <span className="text-[9px] text-slate-400 font-normal">mg/dL</span></div>
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path strokeWidth="4" strokeDasharray="75, 100" strokeLinecap="round" stroke="#00a8e8" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                </div>
              </div>

              {/* Floating Metric Card 4: Wellness Score (Bottom Right) */}
              <div className="absolute bottom-[8%] right-[2%] z-20 bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-2xl shadow-lg w-36 space-y-1 flex items-center justify-between transform hover:-translate-y-1 transition-all">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Wellness Score</span>
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">88%</div>
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path strokeWidth="4" strokeDasharray="88, 100" strokeLinecap="round" stroke="#9333ea" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column — Large White Rounded Login Card matching Reference 1 */}
          <div className="lg:col-span-6 flex justify-center">
            
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 max-w-md w-full relative space-y-6">
              
              {/* Card Header & Shield Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login</h2>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Access your account</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-semibold animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form (Preserving all existing state & handlers) */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-11 pr-11 py-3 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer" 
                    />
                    <span>Remember me</span>
                  </label>
                  <a 
                    href="#forgot" 
                    onClick={(e) => { e.preventDefault(); alert("Password reset instructions sent to your email."); }} 
                    className="text-xs text-indigo-600 hover:underline font-bold"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Login Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Signup Redirect Link */}
              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-600 font-black hover:underline">
                  Sign up
                </Link>
              </div>

            </div>

          </div>

        </div>

        {/* 3. Bottom Information Strip matching Reference 1 */}
        <div className="mt-12 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 shadow-lg p-5 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          <div className="flex items-center gap-3.5 pt-2 sm:pt-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">Secure & Private</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Your data is safe</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-2 sm:pt-0 sm:pl-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">Personalized Care</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Tailored recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-2 lg:pt-0 lg:pl-6">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">Real-time Analytics</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Track your progress</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-2 lg:pt-0 lg:pl-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">AI-Powered Insights</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Smart predictions</p>
            </div>
          </div>

        </div>

      </main>

      {/* 4. Footer */}
      <footer className="w-full text-center text-xs text-slate-400 font-semibold py-2">
        © {new Date().getFullYear()} HealthSync AI Platform. All rights reserved.
      </footer>

    </div>
  );
}
