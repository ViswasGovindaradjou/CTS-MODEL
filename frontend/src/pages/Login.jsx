import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Lock, Mail, Loader2, AlertCircle, ArrowRight, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleDemoFill = () => {
    setEmail('demo.patient@aurahealth.ai');
    setPassword('DemoPatient123!');
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Clinical Telemetry Showcase Panel */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 p-8 ref-card border border-slate-200/80 relative overflow-hidden min-h-[500px]">
          
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Clinical Risk Prediction <br />
              <span className="text-indigo-600">& Clinical AI Insights</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Access your personalized chronic disease portal. Evaluate diabetes and cardiovascular risk probabilities in real time with verified ML pipeline execution.
            </p>
          </div>

          {/* Telemetry Live Sensor Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-900 font-extrabold">
              <span className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600 animate-pulse" />
                Live Sensor Telemetry Ticker
              </span>
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1 border-t border-slate-200">
              <span>Resting Heart Rate: <strong className="text-slate-900 font-extrabold">72 bpm</strong></span>
              <span>Blood Glucose: <strong className="text-slate-900 font-extrabold">125 mg/dL</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Enterprise HIPAA Security</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-600" /> AI Medical Assistant</span>
          </div>

        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6 ref-card p-8 border border-slate-200/80 shadow-md space-y-6">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900">{t('login')}</h1>
            <p className="text-xs text-slate-500 font-medium">Enter your credentials to access your clinical dashboard</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to demo.patient@aurahealth.ai"); }} className="text-[11px] text-indigo-600 hover:underline font-bold">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-500 font-medium cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-0" defaultChecked />
                <span>Remember login session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <span>Sign In To Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={handleDemoFill}
              className="text-xs text-indigo-600 hover:underline font-bold"
            >
              Click here to auto-fill Demo Credentials
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-extrabold hover:underline">
              Create Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
