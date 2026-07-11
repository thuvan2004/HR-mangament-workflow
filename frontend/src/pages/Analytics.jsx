import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { FiCpu, FiTrendingUp, FiCheckSquare, FiAward, FiAlertCircle } from 'react-icons/fi';

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const { data } = await api.get('/analytics/dashboard');
        if (data.success) {
          setMetrics(data.data);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAIInsights = async () => {
      try {
        const { data } = await api.get('/ai/insights');
        if (data.success) {
          setInsights(data.data);
        }
      } catch (err) {
        console.warn('AI suggestions offline');
      }
    };

    fetchAnalyticsData();
    fetchAIInsights();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Computing analytics models...</p>
        </div>
      </div>
    );
  }

  const { stats, monthlyTrends, expenseBreakdown, departmentPerformance } = metrics;
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">System Analytics & SLA Reports</h1>
        <p className="text-sm text-slate-400 mt-1">Review operational bottlenecks, average request completion delays, and expense categories.</p>
      </div>

      {/* AI Automated Explanation / Suggestions */}
      {insights.length > 0 && (
        <div className="bg-indigo-500/10 dark:bg-indigo-950/20 border border-indigo-500/25 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <FiCpu className="text-indigo-500 animate-pulse" size={22} />
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider">AI Automated Analytics Explanations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {insights.map((item, idx) => (
              <div key={idx} className="bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-850 dark:text-slate-200 truncate">{item.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      item.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                      item.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-indigo-500/10 text-indigo-500'
                    }`}>
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">"{item.description}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <span>Average Approval SLA</span>
            <FiAward className="text-indigo-500" size={16} />
          </div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-white">18.4 Hours</h2>
          <p className="text-[10px] text-emerald-500 font-semibold flex items-center">
            <span>↓ 2.1 hrs from last quarter</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <span>SLA Compliance Rate</span>
            <FiCheckSquare className="text-teal-500" size={16} />
          </div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-white">96.2%</h2>
          <p className="text-[10px] text-emerald-500 font-semibold flex items-center">
            <span>↑ 0.8% SLA compliance</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <span>Escalated Bottlenecks</span>
            <FiAlertCircle className="text-rose-500" size={16} />
          </div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-white">{stats.slaBreaches} Tickets</h2>
          <p className="text-[10px] text-slate-450 font-semibold">
            <span>Currently pending over 72 hours</span>
          </p>
        </div>
      </div>

      {/* Visual Recharts graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department SLA Processing speeds */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-805 dark:text-slate-200 mb-6 uppercase tracking-wider">Approvals Delay by Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar name="Average Response SLA (hrs)" dataKey="SLA" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar name="Target Threshold (hrs)" dataKey="target" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Submission trends */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-805 dark:text-slate-200 mb-6 uppercase tracking-wider">Workflow Authorizations Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" name="Approved Requests" dataKey="Approved" stroke="#10b981" fillOpacity={1} fill="url(#colorApproved)" strokeWidth={2.5} />
                <Area type="monotone" name="Rejected Requests" dataKey="Rejected" stroke="#ef4444" fillOpacity={1} fill="url(#colorRejected)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
