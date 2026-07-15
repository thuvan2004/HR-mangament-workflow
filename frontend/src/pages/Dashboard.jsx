import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { 
  FiUsers, FiGitBranch, FiClock, FiAlertTriangle, FiArrowRight, 
  FiFileText, FiAward, FiZap, FiDownload 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');

  // Recharts color mappings
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  useEffect(() => {
    const fetchDashboardData = async () => {
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
    fetchDashboardData();

    // Fetch AI insights
    const fetchAIInsights = async () => {
      try {
        const { data } = await api.get('/ai/insights');
        if (data.success && data.data.length > 0) {
          setAiInsight(data.data[0].description);
        }
      } catch (err) {
        console.warn('AI suggestions offline:', err.message);
      }
    };
    fetchAIInsights();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Assembling enterprise dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const { stats, recentActivities, monthlyTrends, expenseBreakdown, departmentPerformance } = metrics;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header Greeting & AI Alert Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's the summary overview for your {user?.role} dashboard.
          </p>
        </div>
        
        {/* Dynamic AI Recommendation Widget & Export Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center space-x-3.5 bg-indigo-500/10 dark:bg-indigo-950/20 border border-indigo-500/25 rounded-2xl p-3 px-4.5 max-w-md shadow-sm">
            <FiZap className="text-indigo-500 shrink-0 animate-bounce" size={20} />
            <div className="text-left">
              <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase block">FlowWise AI Advisory</span>
              <p className="text-xs text-slate-700 dark:text-indigo-200 mt-0.5 leading-relaxed font-semibold">
                {aiInsight || "Pending approvals SLA compliance looks optimal. Restock hardware components forecasted requirements."}
              </p>
            </div>
          </div>
          
          {['Manager', 'HR', 'Admin'].includes(user?.role) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToPDF(
                  recentActivities, 
                  [
                    { label: 'Timestamp', key: 'timestamp' },
                    { label: 'User', key: 'user' },
                    { label: 'Details', key: 'details' }
                  ],
                  'System Activities Report'
                )}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors text-xs"
                title="Export PDF"
              >
                <FiDownload size={14} /> <span>PDF</span>
              </button>
              <button
                onClick={() => exportToExcel(
                  recentActivities.map(a => ({
                    Timestamp: new Date(a.timestamp).toLocaleString(),
                    User: a.user,
                    Action: a.details
                  })),
                  'system_activities.xlsx'
                )}
                className="flex items-center space-x-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold transition-colors text-xs"
                title="Export Excel"
              >
                <FiDownload size={14} /> <span>Excel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Active Staff</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalEmployees}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <FiUsers size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Departments</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalDepartments}</h3>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
            <FiGitBranch size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">My Action Queue</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.pendingRequests}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <FiClock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">SLA Risk Alerts</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.slaBreaches}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <FiAlertTriangle size={22} />
          </div>
        </div>

      </div>

      {/* 3. Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Workflow Submissions (Area Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:col-span-2 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">Monthly Request Submissions</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="Submitted" stroke="#6366f1" fillOpacity={1} fill="url(#colorSub)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Claims Breakdown</h3>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Labels list */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-semibold mt-4">
            {expenseBreakdown.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-1.5 justify-center">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Second row stats charts & Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department SLA Processing speeds (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">Approvals Speed SLA (hrs)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                <Bar dataKey="SLA" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity feed list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 lg:col-span-2 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Workflow Event Logger</h3>
            <Link to="/requests" className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 flex items-center hover:underline">
              View Portal <FiArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="flex-1 space-y-4.5 overflow-y-auto max-h-64 pr-2">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-850 last:border-0 last:pb-0">
                <div className="flex items-start space-x-3.5">
                  <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-500 shrink-0">
                    <FiFileText size={14} />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-850 dark:text-slate-200 leading-normal">{act.details}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Submitted by: <span className="font-bold">{act.user}</span></p>
                  </div>
                </div>
                <span className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold whitespace-nowrap ml-2">
                  {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
