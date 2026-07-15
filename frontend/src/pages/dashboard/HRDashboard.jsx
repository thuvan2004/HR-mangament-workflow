import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiUsers, FiClock, FiCalendar, FiMonitor, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const HRDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHRData = async () => {
      try {
        const { data } = await api.get('/analytics/dashboard');
        if (data.success) {
          setMetrics(data.data);
        }
      } catch (err) {
        console.error('Failed to load HR dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHRData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const { stats, recentActivities } = metrics || { stats: {}, recentActivities: [] };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
            Human Resources, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Company-wide personnel and request overview.
          </p>
        </div>
        <Link to="/analytics" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-colors">
          View Full Analytics
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Employees</span>
            <h3 className="text-2xl font-black text-indigo-500">{stats?.totalEmployees || 0}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <FiUsers size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Pending Company Requests</span>
            <h3 className="text-2xl font-black text-amber-500">{stats?.pendingRequests || 0}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <FiClock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Upcoming Holidays</span>
            <h3 className="text-2xl font-black text-emerald-500">2</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FiCalendar size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Active Assets</span>
            <h3 className="text-2xl font-black text-teal-500">24</h3>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
            <FiMonitor size={22} />
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">HR Management</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/employees" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition rounded-2xl border border-slate-200 dark:border-slate-700">
              <FiUsers size={24} className="text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Employee Directory</span>
            </Link>
            <Link to="/calendar" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition rounded-2xl border border-slate-200 dark:border-slate-700">
              <FiCalendar size={24} className="text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Manage Calendar</span>
            </Link>
            <Link to="/assets" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition rounded-2xl border border-slate-200 dark:border-slate-700">
              <FiMonitor size={24} className="text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Asset Assignment</span>
            </Link>
            <Link to="/requests" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition rounded-2xl border border-slate-200 dark:border-slate-700">
              <FiClock size={24} className="text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company Requests</span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Recent HR Activity</h3>
            <Link to="/analytics" className="text-xs font-semibold text-indigo-500 flex items-center hover:underline">
              Audit Logs <FiArrowRight className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {recentActivities?.slice(0, 5).map((act, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{act.details}</p>
                  <p className="text-xs text-slate-500">{act.user}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {new Date(act.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HRDashboard;
