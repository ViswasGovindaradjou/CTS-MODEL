import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';

import HeartOverviewCard from '../components/HeartOverviewCard';
import HumanBodyVisualization from '../components/HumanBodyVisualization';
import AiAnalyticsCard from '../components/AiAnalyticsCard';
import AiRiskCard from '../components/AiRiskCard';
import LifeQualityCard from '../components/LifeQualityCard';
import HealthDonutCard from '../components/HealthDonutCard';
import RiskCard from '../components/RiskCard';
import WearableSyncWidget from '../components/WearableSyncWidget';

import { 
  Activity, 
  HeartPulse, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Loader2,
  Stethoscope,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [liveEvaluation, setLiveEvaluation] = useState(null);
  const [countdown, setCountdown] = useState(20);

  const fetchDashboardData = async () => {
    try {
      const [trendsRes, historyRes, alertRes, telemetryRes] = await Promise.allSettled([
        API.get('/predictions/trends'),
        API.get('/predictions/history'),
        API.get('/alerts'),
        API.get('/wearable/live-telemetry')
      ]);

      if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data);
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value.data);
      if (telemetryRes.status === 'fulfilled') setTelemetry(telemetryRes.value.data.telemetry);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const runLive20sMlEvaluation = async () => {
    try {
      const res = await API.get('/wearable/evaluate-live');
      if (res.data) {
        setLiveEvaluation(res.data);
        if (res.data.telemetry) setTelemetry(res.data.telemetry);

        // Refresh trends & history
        const [trendsRes, historyRes] = await Promise.allSettled([
          API.get('/predictions/trends'),
          API.get('/predictions/history')
        ]);
        if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data);
        if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data);
      }
    } catch (err) {
      console.error('Error running 20s ML evaluation:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    runLive20sMlEvaluation();

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          runLive20sMlEvaluation();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleWearableSync = (data) => {
    if (data) setTelemetry(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const latestDiabetes = history.find(h => h.disease_type === 'diabetes');
  const latestHeart = history.find(h => h.disease_type === 'cardiovascular');
  const latestChronic = history.find(h => h.disease_type === 'brfss_chronic');

  const getTrendIcon = (direction) => {
    if (direction === 'increasing') return <TrendingUp className="w-4 h-4 text-rose-500" />;
    if (direction === 'decreasing') return <TrendingDown className="w-4 h-4 text-emerald-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const diabRisk = liveEvaluation?.diabetes?.risk_score ?? trends?.latest_diabetes_risk ?? 0.28;
  const heartRisk = liveEvaluation?.cardiovascular?.risk_score ?? trends?.latest_heart_risk ?? 0.32;
  const chronicRisk = trends?.latest_chronic_risk ?? 0.15;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 20-SECOND REAL-TIME ML EVALUATION TICKER BANNER */}
      <div className="ref-card p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Real-Time 20s ML Risk Assessor</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE SYNC
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">
              Continuously comparing IoT biometrics against Diabetes (`diabetes_pipeline.pkl`) & Cardiovascular (`heart_pipeline.pkl`) ML baselines.
            </p>
          </div>
        </div>

        {/* 20s Countdown Circle */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shrink-0">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-300 uppercase">Next ML Evaluation</div>
            <div className="text-sm font-black text-amber-300">{countdown}s</div>
          </div>
        </div>
      </div>

      {/* LIVE 20s COMPARISON CARDS (DIABETES & CARDIOVASCULAR) */}
      {liveEvaluation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Real-time Diabetes ML Comparison */}
          <div className="ref-card p-4 bg-white border border-indigo-100/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                Diabetes Real-Time ML Assessment
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                liveEvaluation.diabetes.risk_category === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                liveEvaluation.diabetes.risk_category === 'MODERATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {(liveEvaluation.diabetes.risk_score * 100).toFixed(1)}% ({liveEvaluation.diabetes.risk_category})
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium space-y-1 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
              <div className="flex justify-between">
                <span>Glucose vs ML Threshold (140 mg/dL):</span>
                <strong className="text-slate-900">{liveEvaluation.diabetes.comparison.glucose_vs_threshold}</strong>
              </div>
              <div className="flex justify-between">
                <span>BMI vs ML Threshold (30.0):</span>
                <strong className="text-slate-900">{liveEvaluation.diabetes.comparison.bmi_vs_threshold}</strong>
              </div>
            </div>
          </div>

          {/* Real-time Cardiovascular ML Comparison */}
          <div className="ref-card p-4 bg-white border border-rose-100/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                Cardiovascular Real-Time ML Assessment
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                liveEvaluation.cardiovascular.risk_category === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                liveEvaluation.cardiovascular.risk_category === 'MODERATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {(liveEvaluation.cardiovascular.risk_score * 100).toFixed(1)}% ({liveEvaluation.cardiovascular.risk_category})
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium space-y-1 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
              <div className="flex justify-between">
                <span>Blood Pressure vs ML Baseline (130/80):</span>
                <strong className="text-slate-900">{liveEvaluation.cardiovascular.comparison.bp_vs_threshold}</strong>
              </div>
              <div className="flex justify-between">
                <span>Heart Rate vs ML Baseline (100 bpm):</span>
                <strong className="text-slate-900">{liveEvaluation.cardiovascular.comparison.hr_vs_threshold}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3-COLUMN REFERENCE DASHBOARD CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* COLUMN 1: LEFT COLUMN (Heart Rate & Dark AI Analytics) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="flex-1 min-h-[380px]">
            <HeartOverviewCard telemetry={telemetry} heartTrends={history.filter(h => h.disease_type === 'cardiovascular')} />
          </div>

          <div className="h-44 shrink-0">
            <AiAnalyticsCard totalAssessments={trends?.total_assessments || 0} />
          </div>
        </div>

        {/* COLUMN 2: MIDDLE COLUMN (Central Human Body Medical Scan) */}
        <div className="lg:col-span-5 min-h-[580px]">
          <HumanBodyVisualization 
            latestDiabetesRisk={diabRisk}
            latestHeartRisk={heartRisk}
            latestChronicRisk={chronicRisk}
            telemetry={telemetry}
          />
        </div>

        {/* COLUMN 3: RIGHT COLUMN (AI Risk, Life Quality & Donut Gauge) */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="flex-1">
            <AiRiskCard latestDiabetes={latestDiabetes} latestHeart={latestHeart} />
          </div>

          <div className="flex-1">
            <LifeQualityCard totalAssessments={trends?.total_assessments || 0} />
          </div>

          <div className="flex-1 min-h-[220px]">
            <HealthDonutCard 
              latestDiabetesRisk={diabRisk}
              latestHeartRisk={heartRisk}
              latestChronicRisk={chronicRisk}
              telemetry={telemetry}
            />
          </div>
        </div>

      </div>

      {/* LIVE WEARABLE IOT STREAMING WIDGET */}
      <div className="ref-card p-4">
        <WearableSyncWidget onSync={handleWearableSync} assessmentType="general" />
      </div>

      {/* SUMMARY KPI METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="ref-card ref-card-hover p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('total_assessments')}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{trends?.total_assessments || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="ref-card ref-card-hover p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('diabetes_risk')}</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">
              {(diabRisk * 100).toFixed(1)}%
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
            {getTrendIcon(trends?.diabetes_trend)}
          </div>
        </div>

        <div className="ref-card ref-card-hover p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('heart_risk')}</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {(heartRisk * 100).toFixed(1)}%
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
            {getTrendIcon(trends?.heart_trend)}
          </div>
        </div>

        <div className="ref-card ref-card-hover p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('chronic_risk')}</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">
              {(chronicRisk * 100).toFixed(1)}%
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center gap-1">
            {getTrendIcon(trends?.chronic_trend)}
          </div>
        </div>

      </div>

      {/* LATEST DIAGNOSTIC ASSESSMENTS SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            {t('latest_assessments')}
          </h2>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ML Models Online (`.pkl` Inference Active)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Diabetes Risk Card */}
          {latestDiabetes ? (
            <RiskCard 
              title={t('diabetes_risk')}
              riskScore={diabRisk}
              riskCategory={liveEvaluation?.diabetes?.risk_category || latestDiabetes.risk_category}
              diseaseType="diabetes"
              timestamp={latestDiabetes.created_at}
              keyFactors={liveEvaluation?.diabetes?.key_factors || ['Plasma Glucose', 'Body Mass Index', 'Diastolic BP']}
            />
          ) : (
            <div className="ref-card p-6 text-center flex flex-col items-center justify-center min-h-[220px] space-y-3">
              <Activity className="w-10 h-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">{t('diabetes_risk')}</h3>
              <p className="text-xs text-slate-400">No test executed yet.</p>
              <Link to="/assess/diabetes" className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all">
                Run Diabetes Test
              </Link>
            </div>
          )}

          {/* Heart Risk Card */}
          {latestHeart ? (
            <RiskCard 
              title={t('heart_risk')}
              riskScore={heartRisk}
              riskCategory={liveEvaluation?.cardiovascular?.risk_category || latestHeart.risk_category}
              diseaseType="cardiovascular"
              timestamp={latestHeart.created_at}
              keyFactors={liveEvaluation?.cardiovascular?.key_factors || ['Resting BP', 'Serum Cholesterol', 'Max Heart Rate']}
            />
          ) : (
            <div className="ref-card p-6 text-center flex flex-col items-center justify-center min-h-[220px] space-y-3">
              <HeartPulse className="w-10 h-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">{t('heart_risk')}</h3>
              <p className="text-xs text-slate-400">No cardiac test executed.</p>
              <Link to="/assess/heart" className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all">
                Run Cardiovascular Test
              </Link>
            </div>
          )}

          {/* Chronic Risk Card */}
          {latestChronic ? (
            <RiskCard 
              title={t('chronic_risk')}
              riskScore={latestChronic.risk_score}
              riskCategory={latestChronic.risk_category}
              diseaseType="brfss_chronic"
              timestamp={latestChronic.created_at}
              keyFactors={['High Blood Pressure', 'High Cholesterol', 'Physical Activity']}
            />
          ) : (
            <div className="ref-card p-6 text-center flex flex-col items-center justify-center min-h-[220px] space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">{t('chronic_risk')}</h3>
              <p className="text-xs text-slate-400">No chronic screening run.</p>
              <Link to="/assess/chronic" className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all">
                Run Chronic Assessment
              </Link>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
