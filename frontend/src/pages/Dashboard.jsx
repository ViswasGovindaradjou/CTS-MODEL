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
  ArrowRight,
  Zap,
  Bell
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
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
    fetchDashboardData();
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
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
            latestDiabetesRisk={trends?.latest_diabetes_risk || 0.28}
            latestHeartRisk={trends?.latest_heart_risk || 0.32}
            latestChronicRisk={trends?.latest_chronic_risk || 0.15}
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
              latestDiabetesRisk={trends?.latest_diabetes_risk || 0.28}
              latestHeartRisk={trends?.latest_heart_risk || 0.32}
              latestChronicRisk={trends?.latest_chronic_risk || 0.15}
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
              {trends?.latest_diabetes_risk !== null && trends?.latest_diabetes_risk !== undefined
                ? `${(trends.latest_diabetes_risk * 100).toFixed(1)}%` 
                : 'N/A'}
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
              {trends?.latest_heart_risk !== null && trends?.latest_heart_risk !== undefined
                ? `${(trends.latest_heart_risk * 100).toFixed(1)}%` 
                : 'N/A'}
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
              {trends?.latest_chronic_risk !== null && trends?.latest_chronic_risk !== undefined
                ? `${(trends.latest_chronic_risk * 100).toFixed(1)}%` 
                : 'N/A'}
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
              riskScore={latestDiabetes.risk_score}
              riskCategory={latestDiabetes.risk_category}
              diseaseType="diabetes"
              timestamp={latestDiabetes.created_at}
              keyFactors={['Plasma Glucose', 'Body Mass Index', 'Diastolic BP']}
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
              riskScore={latestHeart.risk_score}
              riskCategory={latestHeart.risk_category}
              diseaseType="cardiovascular"
              timestamp={latestHeart.created_at}
              keyFactors={['Resting BP', 'Serum Cholesterol', 'Max Heart Rate']}
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
