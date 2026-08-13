import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import RiskCard from '../components/RiskCard';
import RecommendationCard from '../components/RecommendationCard';
import PdfUploader from '../components/PdfUploader';
import WearableSyncWidget from '../components/WearableSyncWidget';
import { HeartPulse, Sparkles, Loader2, CheckCircle, ArrowLeft, LineChart as LineChartIcon, Radio } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function HeartAssessment() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: 45,
    sex: 1,
    cp: 'typical angina',
    trestbps: 125,
    chol: 210,
    fbs: 0,
    restecg: 'normal',
    thalach: 145,
    exang: 0,
    oldpeak: 0.8,
    slope: 'upsloping',
    ca: 0,
    thal: 'normal'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [liveTrends, setLiveTrends] = useState([]);
  const [isAutoSyncOn, setIsAutoSyncOn] = useState(true);

  const isPredictingRef = useRef(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }));
  };

  const handlePdfExtracted = (extracted) => {
    setFormData((prev) => ({
      ...prev,
      age: extracted.age !== undefined ? extracted.age : prev.age,
      sex: extracted.sex !== undefined ? extracted.sex : prev.sex,
      cp: extracted.cp !== undefined ? extracted.cp : prev.cp,
      trestbps: extracted.trestbps !== undefined ? extracted.trestbps : (extracted.pres !== undefined ? extracted.pres : prev.trestbps),
      chol: extracted.chol !== undefined ? extracted.chol : prev.chol,
      fbs: extracted.fbs !== undefined ? extracted.fbs : prev.fbs,
      restecg: extracted.restecg !== undefined ? extracted.restecg : prev.restecg,
      thalach: extracted.thalach !== undefined ? extracted.thalach : prev.thalach,
      exang: extracted.exang !== undefined ? extracted.exang : prev.exang,
      oldpeak: extracted.oldpeak !== undefined ? extracted.oldpeak : prev.oldpeak,
      slope: extracted.slope !== undefined ? extracted.slope : prev.slope,
      ca: extracted.ca !== undefined ? extracted.ca : prev.ca,
      thal: extracted.thal !== undefined ? extracted.thal : prev.thal,
    }));
  };

  const handleWearableSync = async (telemetry, isAutoSync = true) => {
    if (!telemetry) return;

    setIsAutoSyncOn(isAutoSync);

    const updatedForm = {
      ...formData,
      trestbps: telemetry.blood_pressure_systolic || formData.trestbps,
      thalach: telemetry.heart_rate_bpm || formData.thalach,
      chol: telemetry.cholesterol_mg_dl || formData.chol,
      fbs: telemetry.fasting_sugar_flag !== undefined ? telemetry.fasting_sugar_flag : formData.fbs,
      oldpeak: telemetry.oldpeak_st !== undefined ? telemetry.oldpeak_st : formData.oldpeak,
      cp: telemetry.chest_pain || formData.cp,
      exang: telemetry.exang_flag !== undefined ? telemetry.exang_flag : formData.exang,
      restecg: telemetry.restecg || formData.restecg,
    };

    setFormData(updatedForm);

    if (isAutoSync && !isPredictingRef.current) {
      isPredictingRef.current = true;
      try {
        const res = await API.post('/predict/cardiovascular', updatedForm);
        setResult(res.data);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const riskPct = parseFloat((res.data.risk_score * 100).toFixed(1));

        setLiveTrends((prev) => [
          ...prev.slice(-14),
          {
            time: timeStr,
            risk: riskPct,
            heartRate: telemetry.heart_rate_bpm,
            bp: telemetry.blood_pressure_systolic,
            category: res.data.risk_category
          }
        ]);
      } catch (err) {
        console.error('Auto heart prediction error:', err);
      } finally {
        isPredictingRef.current = false;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/predict/cardiovascular', formData);
      setResult(res.data);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const riskPct = parseFloat((res.data.risk_score * 100).toFixed(1));

      setLiveTrends((prev) => [
        ...prev.slice(-14),
        {
          time: timeStr,
          risk: riskPct,
          heartRate: formData.thalach,
          bp: formData.trestbps,
          category: res.data.risk_category
        }
      ]);
    } catch (err) {
      console.error('Heart Prediction Error:', err);
      setError(err.response?.data?.detail || 'Failed to generate cardiovascular risk prediction');
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
              <HeartPulse className="w-5 h-5 text-rose-600" />
              {t('heart_assessment')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Cardiovascular ML Pipeline (`heart_pipeline.pkl` model inference)</p>
          </div>
        </div>
      </div>

      {/* Real-time Wearable Biometrics Simulator */}
      <WearableSyncWidget onSync={handleWearableSync} assessmentType="heart" />

      {/* PDF Upload Auto-Fill Section */}
      <PdfUploader onExtracted={handlePdfExtracted} assessmentName="Cardiology Report" />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Input Form */}
      <div className="ref-card p-6 border border-slate-200/80">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('age')}</label>
              <input
                type="number"
                name="age"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('sex')}</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
              >
                <option value={1}>{t('male')}</option>
                <option value={0}>{t('female')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('chest_pain')}</label>
              <select
                name="cp"
                value={formData.cp}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
              >
                <option value="typical angina">Typical Angina</option>
                <option value="atypical angina">Atypical Angina</option>
                <option value="non-anginal pain">Non-Anginal Pain</option>
                <option value="asymptomatic">Asymptomatic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('resting_bp')}</label>
              <input
                type="number"
                name="trestbps"
                min="50"
                max="250"
                value={formData.trestbps}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('cholesterol')}</label>
              <input
                type="number"
                name="chol"
                min="100"
                max="600"
                value={formData.chol}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('fasting_sugar')}</label>
              <select
                name="fbs"
                value={formData.fbs}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
              >
                <option value={0}>Normal (&le; 120 mg/dL)</option>
                <option value={1}>Elevated (&gt; 120 mg/dL)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('resting_ecg')}</label>
              <select
                name="restecg"
                value={formData.restecg}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
              >
                <option value="normal">Normal</option>
                <option value="ST-T wave abnormality">ST-T Wave Abnormality</option>
                <option value="left ventricular hypertrophy">LV Hypertrophy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('max_heart_rate')}</label>
              <input
                type="number"
                name="thalach"
                min="50"
                max="230"
                value={formData.thalach}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('exercise_angina')}</label>
              <select
                name="exang"
                value={formData.exang}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('st_depression')}</label>
              <input
                type="number"
                step="0.1"
                name="oldpeak"
                min="0.0"
                max="10.0"
                value={formData.oldpeak}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('st_slope')}</label>
              <select
                name="slope"
                value={formData.slope}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
              >
                <option value="upsloping">Upsloping</option>
                <option value="flat">Flat</option>
                <option value="downsloping">Downsloping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('vessels_colored')}</label>
              <input
                type="number"
                name="ca"
                min="0"
                max="4"
                value={formData.ca}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('thalassemia')}</label>
              <select
                name="thal"
                value={formData.thal}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white cursor-pointer"
              >
                <option value="normal">Normal</option>
                <option value="fixed defect">Fixed Defect</option>
                <option value="reversable defect">Reversable Defect</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? t('evaluating') : t('submit_assessment')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Real-Time Live Health Risk Trend Graph */}
      {liveTrends.length > 0 && (
        <div className="ref-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Real-Time Cardiovascular Risk Trajectory</h3>
            </div>
            {isAutoSyncOn ? (
              <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[10px] text-rose-700 font-extrabold flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3 h-3 text-rose-600" />
                LIVE AUTO-PREDICTION ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-bold">
                AUTO-SYNC PAUSED
              </span>
            )}
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liveTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(val) => [`${val}%`, 'Heart Risk']}
                />
                <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#roseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <RiskCard 
                title={t('heart_risk')}
                riskScore={result.risk_score}
                riskCategory={result.risk_category}
                diseaseType="cardiovascular"
                keyFactors={result.key_factors}
                timestamp={result.timestamp}
              />
            </div>
            
            <div className="md:col-span-2 ref-card p-6 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">Cardiology Diagnostic Breakdown</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  The machine learning model evaluated your 13 cardiac metrics against clinical Cleveland & Framingham dataset features.
                  Risk classification is <strong className="text-rose-600 font-extrabold">{result.risk_category}</strong> with a calculated risk score of <strong className="text-rose-600 font-extrabold">{result.risk_percentage}</strong>.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Pipeline: <code className="text-rose-600 font-bold">heart_pipeline.pkl</code></span>
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
