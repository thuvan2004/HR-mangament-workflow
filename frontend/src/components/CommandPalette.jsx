import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSearch, FiCalendar, FiDollarSign, FiMonitor, FiCpu, FiUserPlus, FiTrendingUp, FiSettings, FiSliders, FiSun, FiMoon } from 'react-icons/fi';

const CommandPalette = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const allActions = [
    { id: 'leave', title: 'Apply for Leave / Vacation', category: 'Requests', icon: FiCalendar, action: () => { navigate('/requests'); onClose(); }, roles: ['Employee', 'Manager', 'HR', 'Admin'] },
    { id: 'expense', title: 'Submit Expense Claim Reimbursement', category: 'Requests', icon: FiDollarSign, action: () => { navigate('/requests'); onClose(); }, roles: ['Employee', 'Manager', 'HR', 'Admin'] },
    { id: 'asset', title: 'Request New Hardware or Software License', category: 'Requests', icon: FiMonitor, action: () => { navigate('/requests'); onClose(); }, roles: ['Employee', 'Manager', 'HR', 'Admin'] },
    { id: 'hr_letter', title: 'Request Salary or Employment Letter', category: 'Requests', icon: FiSliders, action: () => { navigate('/requests'); onClose(); }, roles: ['Employee', 'Manager', 'HR', 'Admin'] },
    
    { id: 'workflow', title: 'Configure Workflow Approval Templates', category: 'HR Tools', icon: FiSliders, action: () => { navigate('/workflows'); onClose(); }, roles: ['HR', 'Admin'] },
    { id: 'add_employee', title: 'Add New Employee Profile', category: 'HR Tools', icon: FiUserPlus, action: () => { navigate('/employees'); onClose(); }, roles: ['HR', 'Admin'] },
    
    { id: 'sla', title: 'View System Approval Analytics & SLA Reports', category: 'Management', icon: FiTrendingUp, action: () => { navigate('/analytics'); onClose(); }, roles: ['Manager', 'HR', 'Admin'] },
    
    { id: 'profile', title: 'Edit Personal Contact & Emergency Profile', category: 'Configuration', icon: FiSettings, action: () => { navigate('/settings'); onClose(); }, roles: ['Employee', 'Manager', 'HR', 'Admin'] },
    { id: 'theme', title: 'Toggle Theme (Light / Dark Mode)', category: 'Configuration', icon: theme === 'dark' ? FiSun : FiMoon, action: () => { toggleTheme(); onClose(); }, roles: ['Employee', 'Manager', 'HR', 'Admin'] },
  ];

  // Filter actions based on search and roles
  const filteredActions = allActions.filter(act => 
    user && act.roles.includes(user.role) &&
    (act.title.toLowerCase().includes(search.toLowerCase()) || 
     act.category.toLowerCase().includes(search.toLowerCase()))
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredActions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 md:p-20 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center">
      <div 
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-glass overflow-hidden mt-10 md:mt-20 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800/80">
          <FiSearch className="text-slate-400 mr-3" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-0 outline-none text-sm text-slate-850 dark:text-slate-200 placeholder-slate-400"
            placeholder="Type a command or search actions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
          />
          <button 
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Action Results Container */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No command matches found.
            </div>
          ) : (
            filteredActions.map((act, index) => {
              const Icon = act.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={act.id}
                  onClick={act.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    px-4 py-3 rounded-xl flex items-center space-x-3.5 cursor-pointer transition-all duration-150
                    ${isSelected 
                      ? 'bg-indigo-600 text-white shadow-glass-hover' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350'
                    }
                  `}
                >
                  <Icon size={18} className={`${isSelected ? 'text-white' : 'text-slate-400 dark:text-indigo-400'}`} />
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium block">{act.title}</span>
                    <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {act.category}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono border border-indigo-400 rounded px-1.5 py-0.5 bg-indigo-500">
                      ENTER
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850/40 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <div className="flex space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>FlowWise AI Quick Actions</span>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;
