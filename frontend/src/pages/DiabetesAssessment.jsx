import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import RiskCard from '../components/RiskCard';
import RecommendationCard from '../components/RecommendationCard';
import PdfUploader from '../components/PdfUploader';
import WearableSyncWidget from '../components/WearableSyncWidget';
import { Activity, Sparkles, Loader2, CheckCircle, ArrowLeft, LineChart as LineChartIcon, Radio } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function DiabetesAssessment() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    preg: 0,
    plas: 120,
    pres: 75,
    skin: 22,
    insu: 85,
    mass: 25.4,
    pedi: 0.35,
    age: 35
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [liveTrends, setLiveTrends] = useState([]);
  const [isAutoSyncOn, setIsAutoSyncOn] = useState(true);

  const isPredictingRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handlePdfExtracted = (extracted) => {
    setFormData((prev) => ({
      ...prev,
      preg: extracted.preg !== undefined ? extracted.preg : prev.preg,
      plas: extracted.plas !== undefined ? extracted.plas : prev.plas,
      pres: extracted.pres !== undefined ? extracted.pres : prev.pres,
      skin: extracted.skin !== undefined ? extracted.skin : prev.skin,
      insu: extracted.insu !== undefined ? extracted.insu : prev.insu,
      mass: extracted.mass !== undefined ? extracted.mass : (extracted.BMI !== undefined ? extracted.BMI : prev.mass),
      pedi: extracted.pedi !== undefined ? extracted.pedi : prev.pedi,
      age: extracted.age !== undefined ? extracted.age : prev.age,
    }));
  };

  const handleWearableSync = async (telemetry, isAutoSync = true) => {
    if (!telemetry) return;
    
    setIsAutoSyncOn(isAutoSync);

    const updatedForm = {
      ...formData,
      plas: telemetry.blood_glucose_mg_dl || formData.plas,
      pres: telemetry.blood_pressure_diastolic || formData.pres,
      mass: telemetry.bmi || formData.mass,
      insu: telemetry.blood_glucose_mg_dl > 140 ? 165 : 85,
    };

    setFormData(updatedForm);

    if (isAutoSync && !isPredictingRef.current) {
      isPredictingRef.current = true;
      try {
        const res = await API.post('/predict/diabetes', updatedForm);
        setResult(res.data);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const riskPct = parseFloat((res.data.risk_score * 100).toFixed(1));
        
        setLiveTrends((prev) => [
          ...prev.slice(-14),
          {
            time: timeStr,
            risk: riskPct,
            glucose: telemetry.blood_glucose_mg_dl,
            bmi: telemetry.bmi,
            category: res.data.risk_category
          }
        ]);
      } catch (err) {
        console.error('Auto prediction error:', err);
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
      const res = await API.post('/predict/diabetes', formData);
      setResult(res.data);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const riskPct = parseFloat((res.data.risk_score * 100).toFixed(1));
      
      setLiveTrends((prev) => [
        ...prev.slice(-14),
        {
          time: timeStr,
          risk: riskPct,
          glucose: formData.plas,
          bmi: formData.mass,
          category: res.data.risk_category
        }
      ]);
    } catch (err) {
      console.error('Diabetes Prediction Error:', err);
      setError(err.response?.data?.detail || 'Failed to generate diabetes risk prediction');
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
              <Activity className="w-5 h-5 text-indigo-600" />
              {t('diabetes_assessment')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Pima Indians Diabetes ML Pipeline (`diabetes_pipeline.pkl` model inference)</p>
          </div>
        </div>
      </div>

      {/* Real-time Wearable Biometrics Simulator */}
      <WearableSyncWidget onSync={handleWearableSync} assessmentType="diabetes" />

      {/* PDF Upload Auto-Fill Section */}
      <PdfUploader onExtracted={handlePdfExtracted} assessmentName="Diabetes Lab Report" />

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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('pregnancies')}</label>
              <input
                type="number"
                name="preg"
                min="0"
                max="20"
                value={formData.preg}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('glucose')}</label>
              <input
                type="number"
                name="plas"
                min="0"
                max="300"
                value={formData.plas}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('blood_pressure')}</label>
              <input
                type="number"
                name="pres"
                min="0"
                max="200"
                value={formData.pres}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('skin_thickness')}</label>
              <input
                type="number"
                name="skin"
                min="0"
                max="100"
                value={formData.skin}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('insulin')}</label>
              <input
                type="number"
                name="insu"
                min="0"
                max="900"
                value={formData.insu}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('bmi')}</label>
              <input
                type="number"
                step="0.1"
                name="mass"
                min="10"
                max="70"
                value={formData.mass}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('pedigree')}</label>
              <input
                type="number"
                step="0.01"
                name="pedi"
                min="0.0"
                max="3.0"
                value={formData.pedi}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

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

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full bg-slate-900 hover:bg-indigo-600 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
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
              <LineChartIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Real-Time Diabetes Risk Trajectory</h3>
            </div>
            {isAutoSyncOn ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-extrabold flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3 h-3 text-emerald-600" />
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
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(val) => [`${val}%`, 'Diabetes Risk']}
                />
                <Area type="monotone" dataKey="risk" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#indigoGrad)" />
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
                title={t('diabetes_risk')}
                riskScore={result.risk_score}
                riskCategory={result.risk_category}
                diseaseType="diabetes"
                keyFactors={result.key_factors}
                timestamp={result.timestamp}
              />
            </div>
            
            <div className="md:col-span-2 ref-card p-6 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">Assessment Diagnostic Breakdown</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  The machine learning model evaluated your 8 clinical metrics against trained epidemiological profiles.
                  Risk classification is <strong className="text-indigo-600 font-extrabold">{result.risk_category}</strong> with a calculated risk score of <strong className="text-indigo-600 font-extrabold">{result.risk_percentage}</strong>.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">Pipeline: <code className="text-indigo-600 font-bold">diabetes_pipeline.pkl</code></span>
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
