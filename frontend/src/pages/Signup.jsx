import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Heart, Lock, Mail, User, Globe, Loader2, AlertCircle, ArrowRight, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';

export default function Signup() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState('male');
  const [language, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        age: parseInt(age, 10),
        gender,
        preferred_language: language
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Clinical Showcase */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 p-8 ref-card border border-slate-200/80 relative overflow-hidden min-h-[540px]">
          
          <div className="space-y-4">
            <div className="w-9 h-9 rounded-2xl bg-[#00a8e8] text-white flex items-center justify-center shadow-md shadow-[#00a8e8]/20 shrink-0">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Create Your <br />
              <span className="text-indigo-600">Clinical Health Profile</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Join the chronic disease risk monitoring platform. Evaluate disease probabilities in real time and receive AI recommendations in Tamil, English, or Hindi.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Real-Time Diabetes & Heart Disease Predictions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Personalized AI Clinical Recommendations</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multilingual Voice & Text AI Healthcare Chatbot</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Secure HIPAA Architecture</span>
          </div>

        </div>

        {/* Right Side: Signup Card */}
        <div className="lg:col-span-6 ref-card p-8 border border-slate-200/80 shadow-md space-y-5">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900">{t('signup')}</h1>
            <p className="text-xs text-slate-500 font-medium">Register a new patient account in 1 minute</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                <input 
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-indigo-600 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={language}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:border-indigo-600 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="en">English 🇺🇸</option>
                  <option value="ta">தமிழ் (Tamil) 🇮🇳</option>
                  <option value="hi">हिंदी (Hindi) 🇮🇳</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input 
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input 
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-indigo-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 font-extrabold hover:underline">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
