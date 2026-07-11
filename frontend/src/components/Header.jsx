import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { FiSun, FiMoon, FiBell, FiSearch, FiChevronDown, FiMail, FiCheck } from 'react-icons/fi';

const Header = ({ onOpenCommandPalette }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, clearNotifications, markAsRead } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 w-full glass-panel h-16 border-b flex items-center justify-between px-6">
      
      {/* Search Input Bar (Shortcut trigger to Command Palette) */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-400 dark:text-slate-400 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-left cursor-pointer group"
        >
          <FiSearch size={16} className="mr-2.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span className="flex-1 truncate">Search actions or commands...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 ml-2 border border-slate-300 dark:border-slate-600/60 rounded text-[10px] bg-white dark:bg-slate-700 font-mono text-slate-500 dark:text-slate-400 tracking-widest font-semibold shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Control Buttons & Dropdowns */}
      <div className="flex items-center space-x-4">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications Icon and Dropdown Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-semibold text-[10px] flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 shadow-glass overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Live Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id || Math.random()} 
                      onClick={() => markAsRead(n._id)}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start space-x-3 cursor-pointer transition-all duration-150 ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}
                    >
                      <div className="mt-1 p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                        <FiMail size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{n.message}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2.5 p-1 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block pr-1">
                <span className="block text-xs font-semibold text-slate-850 dark:text-slate-200 leading-none">{user.name}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 leading-none">{user.role}</span>
              </div>
              <FiChevronDown size={14} className="text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-glass overflow-hidden z-50 py-1.5 text-sm">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="block font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                  <span className="text-xs text-slate-400 truncate block">{user.email}</span>
                </div>
                <a 
                  href="/settings"
                  className="block px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  onClick={() => setShowUserDropdown(false)}
                >
                  My Profile
                </a>
                <a 
                  href="/settings"
                  className="block px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  onClick={() => setShowUserDropdown(false)}
                >
                  Account Settings
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
