import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import RiskCard from '../components/RiskCard';
import RecommendationCard from '../components/RecommendationCard';
import { ShieldAlert, Sparkles, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ChronicAssessment() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    HighBP: 1,
    HighChol: 1,
    BMI: 28.5,
    Smoker: 0,
    Stroke: 0,
    HeartDiseaseorAttack: 0,
    PhysActivity: 1,
    Fruits: 1,
    Veggies: 1,
    HvyAlcoholConsump: 0,
    AnyHealthcare: 1,
    GenHlth: 2,
    MentHlth: 2,
    PhysHlth: 1,
    DiffWalk: 0,
    Sex: 1,
    Age: 6,
    Education: 5,
    Income: 7
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/predict/chronic', formData);
      setResult(res.data);
    } catch (err) {
      console.error('Chronic Risk Prediction Error:', err);
      setError(err.response?.data?.detail || 'Failed to generate chronic risk prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              {t('chronic_assessment')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">CDC BRFSS Epidemiological ML Pipeline (`brfss_pipeline.pkl` model inference)</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="ref-card p-6 border border-slate-200/80">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('high_bp')}</label>
              <select name="HighBP" value={formData.HighBP} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('high_chol')}</label>
              <select name="HighChol" value={formData.HighChol} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('bmi')}</label>
              <input type="number" step="0.1" name="BMI" value={formData.BMI} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('smoker')}</label>
              <select name="Smoker" value={formData.Smoker} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('stroke')}</label>
              <select name="Stroke" value={formData.Stroke} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('heart_disease')}</label>
              <select name="HeartDiseaseorAttack" value={formData.HeartDiseaseorAttack} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('phys_activity')}</label>
              <select name="PhysActivity" value={formData.PhysActivity} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('fruits')}</label>
              <select name="Fruits" value={formData.Fruits} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('veggies')}</label>
              <select name="Veggies" value={formData.Veggies} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('hvy_alcohol')}</label>
              <select name="HvyAlcoholConsump" value={formData.HvyAlcoholConsump} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('gen_health')}</label>
              <select name="GenHlth" value={formData.GenHlth} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={1}>1 - Excellent</option>
                <option value={2}>2 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Fair</option>
                <option value={5}>5 - Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('diff_walk')}</label>
              <select name="DiffWalk" value={formData.DiffWalk} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer">
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? t('evaluating') : t('submit_assessment')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <RiskCard 
                title={t('chronic_risk')}
                riskScore={result.risk_score}
                riskCategory={result.risk_category}
                diseaseType="brfss_chronic"
                keyFactors={result.key_factors}
                timestamp={result.timestamp}
              />
            </div>
            
            <div className="md:col-span-2 ref-card p-6 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">CDC BRFSS Chronic Diagnostic Breakdown</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  The machine learning model evaluated your 19 CDC BRFSS parameters.
                  Risk classification is <strong className="text-purple-600 font-extrabold">{result.risk_category}</strong> with a calculated risk score of <strong className="text-purple-600 font-extrabold">{result.risk_percentage}</strong>.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Pipeline: <code className="text-purple-600 font-bold">brfss_pipeline.pkl</code></span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> ML Inference Completed
                </span>
              </div>
            </div>
          </div>

          <RecommendationCard recommendations={result.recommendations} />
        </div>
      )}

    </div>
  );
}
