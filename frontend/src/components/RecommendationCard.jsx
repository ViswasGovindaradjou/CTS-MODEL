import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import { 
  Sparkles, 
  Utensils, 
  Dumbbell, 
  Activity, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  Globe
} from 'lucide-react';

export default function RecommendationCard({ recommendations }) {
  const { language, t } = useLanguage();
  const [displayRecs, setDisplayRecs] = useState(recommendations);
  const [loading, setLoading] = useState(false);
  const [translationCache, setTranslationCache] = useState({});

  useEffect(() => {
    if (!recommendations) {
      setDisplayRecs(null);
      return;
    }

    if (language === 'en') {
      setDisplayRecs(recommendations);
      return;
    }

    const firstItem = recommendations.general_lifestyle?.[0] || recommendations.diet_suggestions?.[0] || '';
    const cacheKey = `${language}_${recommendations.id || firstItem}`;

    if (translationCache[cacheKey]) {
      setDisplayRecs(translationCache[cacheKey]);
      return;
    }

    let isMounted = true;

    const fetchTranslation = async () => {
      setLoading(true);
      try {
        const res = await API.post('/recommendations/translate', {
          recommendations: recommendations,
          target_language: language
        });
        
        if (isMounted && res.data && res.data.general_lifestyle?.length > 0) {
          setDisplayRecs(res.data);
          setTranslationCache((prev) => ({ ...prev, [cacheKey]: res.data }));
        }
      } catch (err) {
        console.error('Failed to translate recommendations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTranslation();

    return () => {
      isMounted = false;
    };
  }, [language, recommendations]);

  if (!recommendations) return null;

  const currentRecs = displayRecs || recommendations;

  const categories = [
    { title: t('lifestyle'), items: currentRecs.general_lifestyle, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { title: t('diet'), items: currentRecs.diet_suggestions, icon: Utensils, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { title: t('activity'), items: currentRecs.physical_activity, icon: Dumbbell, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
    { title: t('monitoring'), items: currentRecs.monitoring_suggestions, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { title: t('followup'), items: currentRecs.follow_up_suggestions, icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { title: t('preventive'), items: currentRecs.preventive_guidance, icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
  ];

  return (
    <div className="space-y-6 relative pt-2">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {t('personalized_guidance')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
            <span>Tailored AI care guidance generated from your ML risk profile</span>
            {loading && (
              <span className="text-indigo-600 font-bold flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                <Globe className="w-3 h-3" />
                Translating to {language === 'ta' ? 'தமிழ்' : 'हिंदी'}...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Grid of categories */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${loading ? 'opacity-40 blur-[1px]' : 'opacity-100'}`}>
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          if (!cat.items || cat.items.length === 0) return null;
          return (
            <div key={idx} className="ref-card p-5 border border-slate-200/80">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`p-2 rounded-xl border ${cat.bg}`}>
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">{cat.title}</h3>
              </div>
              <ul className="space-y-2">
                {cat.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-xs text-slate-700 font-medium flex items-start gap-2 leading-relaxed">
                    <span className={`${cat.color} font-bold mt-0.5`}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Medical Disclaimer Banner */}
      {currentRecs.disclaimer && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed font-medium">
            <span className="font-bold text-amber-900 block mb-0.5">{t('disclaimer_notice')}</span>
            {currentRecs.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
