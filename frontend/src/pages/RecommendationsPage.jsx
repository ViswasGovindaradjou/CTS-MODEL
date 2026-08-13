import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import RecommendationCard from '../components/RecommendationCard';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function RecommendationsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/recommendations/latest');
      setRecommendation(res.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.detail || 'No care recommendations found. Please run a risk assessment first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {t('recommendations')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            AI generated clinical care recommendations based on your ML risk output.
          </p>
        </div>

        <button 
          onClick={fetchRecommendations}
          className="p-2.5 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          title="Refresh Recommendations"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <div className="ref-card p-8 text-center text-xs font-semibold text-amber-700 bg-amber-50 border-amber-200">
          {error}
        </div>
      ) : (
        <RecommendationCard recommendations={recommendation} />
      )}

    </div>
  );
}
