import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import { 
  History, 
  Activity, 
  HeartPulse, 
  ShieldAlert, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Filter
} from 'lucide-react';

export default function PredictionHistoryPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await API.get('/predictions/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Error fetching prediction history:', err);
        setError('Failed to load prediction history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    if (filterType === 'all') return true;
    return item.disease_type === filterType;
  });

  const getDiseaseIcon = (type) => {
    if (type === 'diabetes') return <Activity className="w-4 h-4 text-indigo-600" />;
    if (type === 'cardiovascular') return <HeartPulse className="w-4 h-4 text-rose-600" />;
    return <ShieldAlert className="w-4 h-4 text-purple-600" />;
  };

  const getBadgeClass = (category) => {
    if (category === 'HIGH') return 'badge-high';
    if (category === 'MODERATE') return 'badge-moderate';
    return 'badge-low';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            {t('prediction_history')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Chronological record of all executed ML risk assessments and probability scores</p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 shadow-sm text-xs font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-indigo-600" />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all">All Assessments</option>
            <option value="diabetes">Diabetes Only</option>
            <option value="cardiovascular">Cardiovascular Only</option>
            <option value="brfss_chronic">BRFSS Chronic Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-indigo-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="ref-card p-12 text-center border border-slate-200/80 space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">No Assessment History Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">Run your first diabetes or heart disease risk prediction to record your history.</p>
        </div>
      ) : (
        <div className="ref-card border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Assessment Type</th>
                  <th className="p-4">Risk Category</th>
                  <th className="p-4">Probability Score</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getDiseaseIcon(item.disease_type)}
                        <span className="capitalize">{item.disease_type.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${getBadgeClass(item.risk_category)}`}>
                        {item.risk_category}
                      </span>
                    </td>

                    <td className="p-4 font-black text-indigo-600 whitespace-nowrap">
                      {(item.risk_score * 100).toFixed(1)}%
                    </td>

                    <td className="p-4 text-emerald-700 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ML Verified</span>
                      </div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(item.disease_type === 'diabetes' ? '/assess/diabetes' : '/assess/heart')}
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-800 hover:text-indigo-600 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
