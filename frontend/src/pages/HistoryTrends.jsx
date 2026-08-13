import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import { 
  LineChart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Filter, 
  Loader2 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function HistoryTrends() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [histRes, trendRes] = await Promise.all([
          API.get('/predictions/history'),
          API.get('/predictions/trends')
        ]);
        setHistory(histRes.data);
        setTrends(trendRes.data);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const filteredHistory = filterType === 'all' 
    ? history 
    : history.filter(h => h.disease_type === filterType);

  const chartData = [...filteredHistory].reverse().map(h => ({
    date: new Date(h.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: (h.risk_score * 100).toFixed(1),
    type: h.disease_type.toUpperCase()
  }));

  const getBadgeClass = (cat) => {
    if (cat === 'HIGH') return 'badge-high';
    if (cat === 'MODERATE') return 'badge-moderate';
    return 'badge-low';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" />
            {t('history_trends')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Historical progression of diabetes, cardiovascular, and BRFSS risk scores over time.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 text-xs text-slate-700 font-semibold shadow-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="all">All Disease Types</option>
            <option value="diabetes">Diabetes Risk</option>
            <option value="cardiovascular">Cardiovascular Risk</option>
            <option value="brfss_chronic">BRFSS Chronic Risk</option>
          </select>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      {chartData.length > 0 ? (
        <div className="ref-card p-6 border border-slate-200/80">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">Risk Percentage Trajectory (%)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  itemStyle={{ color: '#4f46e5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ fill: '#4f46e5', r: 4 }} 
                  activeDot={{ r: 7 }}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="ref-card p-8 text-center text-xs font-semibold text-slate-500 border border-slate-200">
          No historical records found for this filter. Run an assessment to log trends.
        </div>
      )}

      {/* History Log Table */}
      <div className="ref-card border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">{t('recent_activity')}</h3>
          <span className="text-xs text-slate-500 font-medium">{filteredHistory.length} total entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Assessment Type</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Risk Category</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800 capitalize">
                    {item.disease_type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 font-black text-indigo-600">
                    {item.risk_percentage}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getBadgeClass(item.risk_category)}`}>
                      {item.risk_category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-700 font-bold">
                    Recorded
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
