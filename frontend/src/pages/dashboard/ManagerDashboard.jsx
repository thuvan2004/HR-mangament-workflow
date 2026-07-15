import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useSocket();
  const [teamRequests, setTeamRequests] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const [requestsRes, analyticsRes] = await Promise.all([
          api.get('/requests?filter=team'),
          api.get('/analytics/dashboard')
        ]);
        
        if (requestsRes.data.success) {
          setTeamRequests(requestsRes.data.data);
        }
        if (analyticsRes.data.success) {
          setMetrics(analyticsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load manager dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchManagerData();
  }, []);

  const handleAction = async (id, action) => {
    let comment = '';
    if (action === 'Reject') {
      comment = window.prompt('Please provide a reason for rejection (Required):');
      if (!comment) return; // reason is mandatory
    } else {
      const isConfirmed = window.confirm('Are you sure you want to approve this request?');
      if (!isConfirmed) return;
      comment = 'Approved by Manager';
    }

    setProcessingId(id);
    try {
      const { data } = await api.put(`/requests/${id}/action`, { action, comment });
      if (data.success) {
        // Update local state
        setTeamRequests(prev => prev.map(req => req._id === id ? data.data : req));
        showToast(`Request ${action}d successfully.`, 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showToast('Failed to process request: ' + msg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const pendingRequests = teamRequests.filter(r => 
    r.status === 'Pending' && 
    (String(r.assignedApprover?._id || r.assignedApprover) === String(user?._id || user?.id))
  );
  const approvedCount = teamRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = teamRequests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
            Team Overview, {user?.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your team's requests and monitor performance.
          </p>
        </div>
        <Link to="/analytics" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-colors">
          Export Team Report
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Team Members</span>
            <h3 className="text-2xl font-black text-indigo-500">{metrics?.stats?.totalEmployees || 0}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <FiUsers size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Pending Approvals</span>
            <h3 className="text-2xl font-black text-amber-500">{pendingRequests.length}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <FiClock size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Approved (Total)</span>
            <h3 className="text-2xl font-black text-emerald-500">{approvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FiCheckCircle size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">Rejected (Total)</span>
            <h3 className="text-2xl font-black text-rose-500">{rejectedCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <FiXCircle size={22} />
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Action Required: Pending Approvals</h3>
          <Link to="/requests" className="text-xs font-semibold text-indigo-500 flex items-center hover:underline">
            View All <FiArrowRight className="ml-1" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <FiCheckCircle className="mx-auto mb-2 text-emerald-500" size={32} />
              <p>You're all caught up! No pending requests.</p>
            </div>
          ) : (
            pendingRequests.map(req => (
              <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{req.user?.name}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500">{req.requestType}</span>
                    {req.priority === 'High' && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500">High Priority</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{req.title}</p>
                  <p className="text-xs text-slate-400 mt-1">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Link to={`/requests`} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors">
                    Details
                  </Link>
                  <button 
                    onClick={() => handleAction(req._id, 'Reject')}
                    disabled={processingId === req._id}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(req._id, 'Approve')}
                    disabled={processingId === req._id}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {processingId === req._id ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ManagerDashboard;
