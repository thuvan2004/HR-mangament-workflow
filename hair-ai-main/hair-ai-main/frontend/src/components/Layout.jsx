import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  UploadCloud,
  History,
  Sparkles,
  TrendingUp,
  Apple,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Analysis', path: '/upload', icon: UploadCloud },
    { name: 'Analysis History', path: '/history', icon: History },
    { name: 'Compare Photos', path: '/compare', icon: Sparkles },
    { name: 'Progress Tracker', path: '/tracker', icon: TrendingUp },
    { name: 'Nutrition Plans', path: '/nutrition', icon: Apple },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  // Admin section
  if (user && user.role === 'admin') {
    navigation.push({ name: 'Admin Hub', path: '/admin', icon: Shield });
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#090B10] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Navbar */}
      <div className="md:hidden glass-nav h-16 px-4 flex items-center justify-between z-30 fixed top-0 w-full">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-display font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            HAIRSCOPE AI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-dark-card hover:bg-dark-border text-gray-400 hover:text-white transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-dark-card hover:bg-dark-border transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#090B10]/95 backdrop-blur-lg z-20 flex flex-col p-6 gap-4 border-t border-dark-border animate-fade-in">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-violet/20 border border-brand-violet/30 text-white font-medium'
                    : 'text-gray-400 hover:bg-dark-card/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 mt-auto transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F1118]/90 border-r border-dark-border/60 p-6 fixed inset-y-0 left-0 z-20">
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              HAIRSCOPE
            </span>
          </Link>
          <span className="font-readout text-[10px] tracking-widest text-brand-cyan font-semibold block mt-1.5">
            AI ANALYSIS PLATFORM
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-3 pl-3 pr-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-violet/10 text-white'
                    : 'text-gray-400 hover:bg-dark-card hover:text-gray-200'
                }`}
              >
                {isActive(item.path) && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-cyan" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-brand-cyan' : ''}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout on Bottom */}
        <div className="border-t border-dark-border/60 pt-4 mt-6 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-violet/30 border border-brand-violet/50 flex items-center justify-center font-bold text-brand-cyan overflow-hidden">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate capitalize">{user?.role} Account</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-dark-card hover:bg-dark-border text-gray-400 hover:text-white transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col md:pl-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in pb-16">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
