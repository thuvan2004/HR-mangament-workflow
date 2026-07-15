import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiMonitor, FiActivity } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const { data } = await api.get('/requests?filter=me');
        if (data.success) {
          setRequests(data.data);
        }
      } catch (err) {
        console.error('Failed to load employee requests:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's an overview of your activity and requests.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Pending Requests</span>
            <h3 className="text-2xl font-black text-amber-500">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <FiClock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Approved Requests</span>
            <h3 className="text-2xl font-black text-emerald-500">{approvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FiCheckCircle size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Rejected Requests</span>
            <h3 className="text-2xl font-black text-rose-500">{rejectedCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <FiXCircle size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Annual Leave Balance</span>
            <h3 className="text-2xl font-black text-indigo-500">{user?.leaveBalance?.annual || 0} Days</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <FiCalendar size={22} />
          </div>
        </div>
      </div>

      {/* Activity and Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">Recent Requests</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {requests.slice(0, 5).map(req => (
              <div key={req._id} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{req.title}</p>
                  <p className="text-xs text-slate-500">{req.requestType}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  req.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No recent requests found.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/requests" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition rounded-2xl border border-slate-200 dark:border-slate-700">
              <FiActivity size={24} className="text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Submit Request</span>
            </Link>
            <Link to="/calendar" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition rounded-2xl border border-slate-200 dark:border-slate-700">
              <FiCalendar size={24} className="text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">View Calendar</span>
            </Link>
            <Link to="/assets" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition rounded-2xl border border-slate-200 dark:border-slate-700">
              <FiMonitor size={24} className="text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">My Assets</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmployeeDashboard;
