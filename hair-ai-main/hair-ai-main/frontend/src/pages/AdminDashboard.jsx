import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import { Shield, Users, Layers, Activity, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('metrics'); // metrics | user-management
  const [updatingId, setUpdatingId] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users')
      ]);

      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.data && usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve administrative records.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleRoleChange = async (userId, currentRole) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      setUpdatingId(userId);
      const res = await axios.patch(`/api/admin/users/${userId}/role`, { role: targetRole });
      if (res.data && res.data.success) {
        showToast(`User role updated to ${targetRole} successfully`, 'success');
        // Update local state
        setUsers(users.map(u => u._id === userId ? { ...u, role: targetRole } : u));
      }
    } catch (err) {
      console.error(err);
      showToast('Could not modify user privileges.', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Administrative Portal</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-brand-violet" /> Administrative Portal
          </h1>
          <p className="text-sm text-gray-400">Aggregate statistics and system controls</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-dark-border/60 pb-1">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'metrics' ? 'border-brand-violet text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          System Analytics
        </button>
        <button
          onClick={() => setActiveTab('user-management')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'user-management' ? 'border-brand-violet text-white' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          User Management ({users.length})
        </button>
      </div>

      {/* Tab: System Analytics */}
      {activeTab === 'metrics' && stats && (
        <div className="flex flex-col gap-8">
          {/* Metrics summary banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="glass-card p-6 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Accounts</span>
              <h3 className="text-2xl font-readout font-semibold text-white mt-1 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-violet" /> {stats.totalUsers}
              </h3>
            </div>
            <div className="glass-card p-6 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Scans</span>
              <h3 className="text-2xl font-readout font-semibold text-white mt-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-cyan" /> {stats.totalAnalyses}
              </h3>
            </div>
            <div className="glass-card p-6 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Scanned Users</span>
              <h3 className="text-2xl font-readout font-semibold text-white mt-1 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-emerald" /> {stats.activeUsers}
              </h3>
            </div>
            <div className="glass-card p-6 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Avg Health Index</span>
              <h3 className="text-2xl font-readout font-semibold text-white mt-1 flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-500" /> {stats.averageHairScore}/100
              </h3>
            </div>
            <div className="glass-card p-6 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Most Common Norwood</span>
              <h3 className="text-xl font-black text-purple-400 mt-1.5 truncate">
                {stats.mostCommonNorwoodStage}
              </h3>
            </div>
          </div>

          {/* Growth graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Growth rates */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-white">System Growth Rates</h3>
                <p className="text-xs text-gray-400">Total accounts vs Scans trend</p>
              </div>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262B3A" vertical={false} />
                    <XAxis dataKey="month" stroke="#8B93A7" fontSize={11} />
                    <YAxis stroke="#8B93A7" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#12141C', borderColor: '#262B3A', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="users" name="Accounts" stroke="#6D5DF6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Stage distribution */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Norwood Hamilton Stage Distribution</h3>
                <p className="text-xs text-gray-400">Frequency occurrence across analyzed users</p>
              </div>
              <div className="h-[260px] w-full">
                {stats.stageDistribution.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500">
                    No stage calculations recorded.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.stageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262B3A" vertical={false} />
                      <XAxis dataKey="stage" stroke="#8B93A7" fontSize={10} />
                      <YAxis stroke="#8B93A7" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#12141C', borderColor: '#262B3A', borderRadius: '12px' }} />
                      <Bar dataKey="count" name="Diagnoses" fill="#00C2D1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: User Management */}
      {activeTab === 'user-management' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0F1118] border-b border-dark-border">
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase">User</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Email</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Geography</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Joined</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Role</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id} className="border-b border-dark-border/40 hover:bg-[#12141C]/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-violet/20 border border-brand-violet/40 flex items-center justify-center font-bold text-xs text-brand-cyan overflow-hidden shrink-0">
                        {item.profilePhoto ? (
                          <img src={item.profilePhoto} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          item.name[0].toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-bold text-white">{item.name}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{item.email}</td>
                    <td className="p-4 text-sm text-gray-400">{item.country || 'N/A'}</td>
                    <td className="p-4 text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.role === 'admin' ? 'bg-brand-violet/20 text-purple-400 border border-brand-violet/30' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRoleChange(item._id, item.role)}
                        disabled={updatingId === item._id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          item.role === 'admin' 
                            ? 'text-rose-400 border-rose-500/20 hover:bg-rose-500/10'
                            : 'text-brand-cyan border-brand-cyan/20 hover:bg-brand-cyan/10'
                        }`}
                      >
                        {updatingId === item._id ? 'Toggling...' : item.role === 'admin' ? 'Demote User' : 'Make Admin'}
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
};

export default AdminDashboard;
