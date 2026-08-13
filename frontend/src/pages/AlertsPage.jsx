import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import { Bell, AlertTriangle, Info, CheckCheck, Loader2 } from 'lucide-react';

export default function AlertsPage() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.post('/alerts/mark-read', { mark_all: true });
      fetchAlerts();
    } catch (err) {
      console.error('Error marking alerts read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getSeverityBadge = (sev) => {
    if (sev === 'CRITICAL') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (sev === 'WARNING') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            {t('alerts')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Automated risk alerts and trend notifications.</p>
        </div>

        {alerts.some(a => !a.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-indigo-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="ref-card p-8 text-center text-xs font-semibold text-slate-500 border border-slate-200">
          No notifications or health alerts recorded.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div 
              key={a.id}
              className={`ref-card p-4 border transition-all ${
                !a.is_read ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200/80 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-indigo-600 mt-0.5">
                    {a.severity === 'CRITICAL' ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <Info className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{a.title}</h3>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">{a.message}</p>
                    <span className="text-[10px] text-slate-400 font-medium mt-2 block">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getSeverityBadge(a.severity)}`}>
                  {a.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
