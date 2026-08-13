import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import { User, Languages, Save, CheckCircle, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [age, setAge] = useState(user?.age || 35);
  const [gender, setGender] = useState(user?.gender || 'male');
  const [prefLang, setPrefLang] = useState(user?.preferred_language || language);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await API.put('/users/profile', {
        full_name: fullName,
        age: parseInt(age, 10),
        gender,
        preferred_language: prefLang
      });
      setUser(res.data);
      setLanguage(prefLang);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          {t('profile')}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your patient account details and language preferences.</p>
      </div>

      {success && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
          {error}
        </div>
      )}

      <div className="ref-card p-6 border border-slate-200/80">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              disabled 
              value={user?.email || ''} 
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-500 font-medium cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language (Tamil / English / Hindi)</label>
            <select 
              value={prefLang} 
              onChange={(e) => setPrefLang(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
            >
              <option value="en">English (English 🇺🇸)</option>
              <option value="ta">Tamil (தமிழ் 🇮🇳)</option>
              <option value="hi">Hindi (हिंदी 🇮🇳)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
