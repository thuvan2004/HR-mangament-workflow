import React from 'react';
import { useAuth } from '../../context/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import HRDashboard from './HRDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardSwitcher = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  switch (user.role) {
    case 'employee':
      return <EmployeeDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'hr':
      return <HRDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <EmployeeDashboard />;
  }
};

export default DashboardSwitcher;
