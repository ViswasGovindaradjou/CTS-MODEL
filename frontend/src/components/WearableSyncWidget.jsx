import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { Watch, Heart, Activity, Zap, CheckCircle2, RefreshCw, Radio } from 'lucide-react';

export default function WearableSyncWidget({ onSync, assessmentType = "general" }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncedMsg, setSyncedMsg] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const onSyncRef = useRef(onSync);

  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  const fetchLiveTelemetry = async () => {
    try {
      const res = await API.get('/wearable/live-telemetry');
      const data = res.data.telemetry;
      setTelemetry(data);
      if (data && autoSync && onSyncRef.current) {
        onSyncRef.current(data, true);
      }
    } catch (err) {
      console.error('Failed to fetch wearable telemetry:', err);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 3500);
    return () => clearInterval(interval);
  }, [autoSync]);

  const toggleAutoSync = () => {
    const nextState = !autoSync;
    setAutoSync(nextState);
    if (onSyncRef.current && telemetry) {
      onSyncRef.current(telemetry, nextState);
    }
  };

  const handleSync = () => {
    if (!telemetry) return;
    setLoading(true);

    if (onSyncRef.current) {
      onSyncRef.current(telemetry, false);
    }
    
    setSyncedMsg(`⌚ Synced live metrics (HR: ${telemetry.heart_rate_bpm} bpm, BP: ${telemetry.blood_pressure_systolic}/${telemetry.blood_pressure_diastolic}, Glucose: ${telemetry.blood_glucose_mg_dl} mg/dL, BMI: ${telemetry.bmi})!`);

    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100/80 shadow-sm relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        
        {/* Device Status & Live Ticker */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 relative shadow-sm">
            <Watch className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-900">Live IoT Wearable Sensor</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                STREAMING
              </span>
              {autoSync && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-700 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-600 animate-pulse" />
                  AUTO-SYNC
                </span>
              )}
            </div>

            {/* Live Metrics Stream Ticker */}
            {telemetry ? (
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-600 font-semibold">
                <span className="flex items-center gap-1 text-rose-600">
                  <Heart className="w-3.5 h-3.5 animate-pulse" />
                  {telemetry.heart_rate_bpm} bpm
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-indigo-600">
                  <Activity className="w-3.5 h-3.5" />
                  {telemetry.blood_pressure_systolic}/{telemetry.blood_pressure_diastolic} mmHg
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-teal-600">
                  <Zap className="w-3.5 h-3.5" />
                  {telemetry.blood_glucose_mg_dl} mg/dL
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">
                  BMI: {telemetry.bmi}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Connecting to wearable device telemetry...</p>
            )}
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleAutoSync}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              autoSync 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {autoSync ? 'Auto Sync: ON' : 'Auto Sync: OFF'}
          </button>

          <button
            type="button"
            onClick={handleSync}
            disabled={!telemetry || loading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Biometrics</span>
          </button>
        </div>

      </div>

      {syncedMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{syncedMsg}</span>
        </div>
      )}

    </div>
  );
}
