import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiGrid, FiUsers, FiGitBranch, FiBriefcase, 
  FiTrendingUp, FiSettings, FiLogOut, FiChevronLeft, FiChevronRight,
  FiCalendar, FiMonitor
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const getMenuItems = (role) => {
    const baseItems = [];
    switch (role) {
      case 'employee':
        return [
          { name: 'Dashboard', path: '/', icon: FiGrid },
          { name: 'My Requests', path: '/requests', icon: FiBriefcase },
          { name: 'Calendar', path: '/calendar', icon: FiCalendar },
          { name: 'My Assets', path: '/assets', icon: FiMonitor },
          { name: 'Profile', path: '/settings', icon: FiUsers },
          { name: 'Settings', path: '/settings', icon: FiSettings },
        ];
      case 'manager':
        return [
          { name: 'Dashboard', path: '/', icon: FiGrid },
          { name: 'Team Requests', path: '/requests', icon: FiBriefcase },
          { name: 'Approvals', path: '/requests?filter=approvals', icon: FiBriefcase },
          { name: 'Calendar', path: '/calendar', icon: FiCalendar },
          { name: 'Team Assets', path: '/assets', icon: FiMonitor },
          { name: 'Reports', path: '/analytics', icon: FiTrendingUp },
          { name: 'Settings', path: '/settings', icon: FiSettings },
        ];
      case 'hr':
        return [
          { name: 'Dashboard', path: '/', icon: FiGrid },
          { name: 'Employees', path: '/employees', icon: FiUsers },
          { name: 'Requests', path: '/requests', icon: FiBriefcase },
          { name: 'Calendar', path: '/calendar', icon: FiCalendar },
          { name: 'Asset Tracking', path: '/assets', icon: FiMonitor },
          { name: 'Reports', path: '/analytics', icon: FiTrendingUp },
          { name: 'Audit Logs', path: '/analytics?tab=audit', icon: FiTrendingUp },
          { name: 'Settings', path: '/settings', icon: FiSettings },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/', icon: FiGrid },
          { name: 'User Management', path: '/employees', icon: FiUsers },
          { name: 'Requests', path: '/requests', icon: FiBriefcase },
          { name: 'Calendar', path: '/calendar', icon: FiCalendar },
          { name: 'Asset Tracking', path: '/assets', icon: FiMonitor },
          { name: 'Analytics', path: '/analytics', icon: FiTrendingUp },
          { name: 'Audit Logs', path: '/analytics?tab=audit', icon: FiTrendingUp },
          { name: 'AI Insights', path: '/workflows', icon: FiGitBranch },
          { name: 'Settings', path: '/settings', icon: FiSettings },
        ];
      default:
        return [
          { name: 'Dashboard', path: '/', icon: FiGrid },
        ];
    }
  };

  const allowedMenuItems = user ? getMenuItems(user.role) : [];

  return (
    <aside className={`bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col z-30 min-h-screen ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Sidebar Header Brand */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
            F
          </div>
          {!collapsed && (
            <span className="font-extrabold text-lg text-white tracking-wider uppercase animate-pulse">
              FlowWise<span className="text-indigo-400">AI</span>
            </span>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="text-slate-400 hover:text-white transition-colors ml-2 hidden md:block"
        >
          {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {allowedMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-indigo-600/90 text-white font-medium shadow-glass border-l-4 border-indigo-300' 
                  : 'hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="text-sm tracking-wide">{item.name}</span>}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-20 bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-glass border border-slate-850">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Profile Card Summary & Logout */}
      <div className="p-4 border-t border-slate-800 flex flex-col space-y-3">
        {user && !collapsed && (
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/40">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-indigo-400">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
              <p className="text-xs text-indigo-400 font-medium truncate">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center space-x-4 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition-all duration-200 w-full group relative"
        >
          <FiLogOut size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium tracking-wide">Logout</span>}
          {collapsed && (
            <span className="absolute left-20 bg-rose-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50">
              Logout
            </span>
          )}
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
