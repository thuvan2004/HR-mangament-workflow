import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMonitor, FiHardDrive, FiCheckCircle } from 'react-icons/fi';

const AssetTracking = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assetTracking'],
    queryFn: async () => {
      const { data } = await api.get('/requests?requestType=Asset&status=Approved');
      return data.data;
    }
  });

  const filteredAssets = assetsData?.filter(asset => 
    asset.details.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const hardwareCount = assetsData?.filter(a => a.details.assetType === 'Hardware').length || 0;
  const softwareCount = assetsData?.filter(a => a.details.assetType === 'Software').length || 0;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight flex items-center gap-3">
            <FiMonitor className="text-indigo-500" />
            Asset Tracking
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track company hardware and software assignments.</p>
        </div>
        
        <div className="w-full md:w-64">
          <input 
            type="text"
            placeholder="Search assets or assignees..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:text-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <FiMonitor size={24} />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Assets Tracked</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{assetsData?.length || 0}</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <FiHardDrive size={24} />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Hardware Assigned</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{hardwareCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Software Licenses</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{softwareCount}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asset Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignee</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssets.map(asset => (
                <tr key={asset._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800 dark:text-white">{asset.details.assetName}</div>
                    <div className="text-xs text-slate-500">Req ID: {asset._id.substring(asset._id.length - 6)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      asset.details.assetType === 'Hardware' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'
                    }`}>
                      {asset.details.assetType}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800 dark:text-slate-300">{asset.user?.name}</div>
                    <div className="text-xs text-slate-500">{asset.user?.email}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(asset.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Active
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No active assets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetTracking;
