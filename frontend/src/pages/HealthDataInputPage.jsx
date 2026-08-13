import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import PdfUploader from '../components/PdfUploader';
import WearableSyncWidget from '../components/WearableSyncWidget';
import { 
  Activity, 
  HeartPulse, 
  User, 
  Sliders, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Save, 
  FileText,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

export default function HealthDataInputPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: 45,
    gender: 'male',
    sex: 1,
    plas: 125,
    pres: 80,
    trestbps: 125,
    mass: 26.5,
    BMI: 26.5,
    skin: 22,
    insu: 95,
    pedi: 0.38,
    preg: 0,
    chol: 210,
    fbs: 0,
    restecg: 'normal',
    thalach: 145,
    exang: 0,
    oldpeak: 0.8,
    slope: 'upsloping',
    ca: 0,
    thal: 'normal',
    cp: 'typical angina',
    HighBP: 1,
    HighChol: 0,
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
    DiffWalk: 0
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState('');

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
      plas: extracted.plas !== undefined ? extracted.plas : prev.plas,
      pres: extracted.pres !== undefined ? extracted.pres : prev.pres,
      trestbps: extracted.trestbps !== undefined ? extracted.trestbps : (extracted.pres || prev.trestbps),
      chol: extracted.chol !== undefined ? extracted.chol : prev.chol,
      mass: extracted.mass !== undefined ? extracted.mass : (extracted.BMI !== undefined ? extracted.BMI : prev.mass),
      BMI: extracted.BMI !== undefined ? extracted.BMI : (extracted.mass !== undefined ? extracted.mass : prev.BMI),
      insu: extracted.insu !== undefined ? extracted.insu : prev.insu,
      skin: extracted.skin !== undefined ? extracted.skin : prev.skin,
      thalach: extracted.thalach !== undefined ? extracted.thalach : prev.thalach,
      oldpeak: extracted.oldpeak !== undefined ? extracted.oldpeak : prev.oldpeak,
      cp: extracted.cp !== undefined ? extracted.cp : prev.cp
    }));
    setSaveStatus('Lab report values auto-filled successfully!');
  };

  const handleWearableSync = (telemetry) => {
    if (!telemetry) return;
    setFormData((prev) => ({
      ...prev,
      plas: telemetry.blood_glucose_mg_dl || prev.plas,
      pres: telemetry.blood_pressure_diastolic || prev.pres,
      trestbps: telemetry.blood_pressure_systolic || prev.trestbps,
      chol: telemetry.cholesterol_mg_dl || prev.chol,
      mass: telemetry.bmi || prev.mass,
      BMI: telemetry.bmi || prev.BMI,
      thalach: telemetry.heart_rate_bpm || prev.thalach,
      oldpeak: telemetry.oldpeak_st !== undefined ? telemetry.oldpeak_st : prev.oldpeak,
      cp: telemetry.chest_pain || prev.cp,
      restecg: telemetry.restecg || prev.restecg,
      exang: telemetry.exang_flag !== undefined ? telemetry.exang_flag : prev.exang,
      HighBP: telemetry.high_bp_flag !== undefined ? telemetry.high_bp_flag : prev.HighBP,
      HighChol: telemetry.high_chol_flag !== undefined ? telemetry.high_chol_flag : prev.HighChol,
      HeartDiseaseorAttack: telemetry.heart_disease_flag !== undefined ? telemetry.heart_disease_flag : prev.HeartDiseaseorAttack,
      PhysActivity: telemetry.phys_activity_flag !== undefined ? telemetry.phys_activity_flag : prev.PhysActivity,
    }));
    setSaveStatus('Live IoT smartwatch telemetry synced successfully!');
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaveStatus('');
    try {
      await API.post('/health', {
        age: formData.age,
        gender: formData.gender,
        blood_pressure_systolic: formData.trestbps,
        blood_pressure_diastolic: formData.pres,
        cholesterol: formData.chol,
        glucose: formData.plas,
        bmi: formData.mass,
        heart_rate: formData.thalach,
        raw_data: JSON.stringify(formData)
      });
      setSaveStatus('Health measurements saved to database successfully!');
    } catch (err) {
      console.error('Error saving health data:', err);
      setError(err.response?.data?.detail || 'Failed to save health data.');
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async (path, payload) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post(path, payload);
      navigate(path.includes('diabetes') ? '/assess/diabetes' : '/assess/heart', { state: { result: res.data } });
    } catch (err) {
      console.error('Prediction Error:', err);
      setError(err.response?.data?.detail || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-400" />
              {t('enter_health_data')}
            </h1>
            <p className="text-xs text-slate-400">Multi-section clinical biomarker entry compatible with clinical model assessments</p>
          </div>
        </div>
      </div>

      {/* IoT Wearable Sync Widget */}
      <WearableSyncWidget onSync={handleWearableSync} assessmentType="general" />

      {/* PDF Lab Report Auto-Fill */}
      <PdfUploader onExtracted={handlePdfExtracted} assessmentName="Clinical Medical Report" />

      {saveStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSaveData} className="space-y-8">
        
        {/* Section 1: Demographics */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <User className="w-4 h-4 text-teal-400" />
            {t('personal_info')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('age')} *</label>
              <input type="number" name="age" min="1" max="120" value={formData.age} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('gender')} *</label>
              <select name="gender" value={formData.gender} onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({ ...prev, gender: val, sex: val === 'male' ? 1 : 0 }));
              }} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500">
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('pregnancies')} (Women)</label>
              <input type="number" name="preg" min="0" max="20" value={formData.preg} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Measurements */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Activity className="w-4 h-4 text-indigo-400" />
            {t('health_measurements')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('glucose')} *</label>
              <input type="number" name="plas" min="0" max="400" value={formData.plas} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('resting_bp')} (mmHg) *</label>
              <input type="number" name="trestbps" min="0" max="250" value={formData.trestbps} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('blood_pressure')} (Diastolic) *</label>
              <input type="number" name="pres" min="0" max="200" value={formData.pres} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('cholesterol')} (mg/dL) *</label>
              <input type="number" name="chol" min="0" max="600" value={formData.chol} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('bmi')} *</label>
              <input type="number" step="0.1" name="mass" min="10" max="70" value={formData.mass} onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setFormData(prev => ({ ...prev, mass: val, BMI: val }));
              }} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('max_heart_rate')} (bpm)</label>
              <input type="number" name="thalach" min="40" max="220" value={formData.thalach} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('insulin')} (µU/mL)</label>
              <input type="number" name="insu" min="0" max="900" value={formData.insu} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('skin_thickness')} (mm)</label>
              <input type="number" name="skin" min="0" max="100" value={formData.skin} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('st_depression')} (oldpeak)</label>
              <input type="number" step="0.1" name="oldpeak" min="0.0" max="10.0" value={formData.oldpeak} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('chest_pain')}</label>
              <select name="cp" value={formData.cp} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500">
                <option value="typical angina">Typical Angina</option>
                <option value="atypical angina">Atypical Angina</option>
                <option value="non-anginal pain">Non-Anginal Pain</option>
                <option value="asymptomatic">Asymptomatic</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 3: Lifestyle Info */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            {t('lifestyle_info')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Physical Activity (Weekly)</label>
              <select name="PhysActivity" value={formData.PhysActivity} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500">
                <option value={1}>Yes (Regular Active)</option>
                <option value={0}>No (Sedentary)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Smoking History</label>
              <select name="Smoker" value={formData.Smoker} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500">
                <option value={0}>Non-Smoker (0)</option>
                <option value={1}>Smoker History (1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">High Blood Pressure Diagnosis</label>
              <select name="HighBP" value={formData.HighBP} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500">
                <option value={1}>Yes (1)</option>
                <option value={0}>No (0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-teal-400" />}
            <span>{t('save_health_data')}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => runPrediction('/api/predict/diabetes', {
                preg: formData.preg,
                plas: formData.plas,
                pres: formData.pres,
                skin: formData.skin,
                insu: formData.insu,
                mass: formData.mass,
                pedi: formData.pedi,
                age: formData.age
              })}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>{t('run_diabetes_assessment')}</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => runPrediction('/api/predict/cardiovascular', {
                age: formData.age,
                sex: formData.sex,
                cp: formData.cp,
                trestbps: formData.trestbps,
                chol: formData.chol,
                fbs: formData.plas > 120 ? 1 : 0,
                restecg: formData.restecg,
                thalach: formData.thalach,
                exang: formData.exang,
                oldpeak: formData.oldpeak,
                slope: formData.slope,
                ca: formData.ca,
                thal: formData.thal
              })}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <HeartPulse className="w-4 h-4" />
              <span>{t('run_cardio_assessment')}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
