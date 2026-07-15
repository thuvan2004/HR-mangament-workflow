import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const fetchCalendarEvents = async (month, year) => {
  const { data } = await api.get(`/calendar/events?month=${month}&year=${year}`);
  return data.data;
};

const Calendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendarEvents', month, year],
    queryFn: () => fetchCalendarEvents(month, year),
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  // Calendar logic
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  
  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20" />);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = events.filter(e => {
        if (e.isHoliday) {
          return e.date.startsWith(dateStr);
        } else {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);
          const current = new Date(year, month - 1, i);
          return current >= start && current <= end;
        }
      });

      days.push(
        <div key={i} className="min-h-[100px] border border-slate-200 dark:border-slate-800 p-2 bg-white dark:bg-slate-900">
          <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{i}</div>
          <div className="space-y-1">
            {dayEvents.map(e => (
              <div 
                key={e.id} 
                className={`text-xs p-1 rounded font-medium truncate ${e.isHoliday ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}
                title={e.title}
              >
                {e.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiCalendar className="text-indigo-500" />
            Company Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View upcoming holidays and team leaves.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
              <FiChevronLeft />
            </button>
            <span className="font-semibold px-4 w-40 text-center dark:text-white">
              {currentDate.toLocaleString('default', { month: 'long' })} {year}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
              <FiChevronRight />
            </button>
          </div>
          
          {['HR', 'Admin'].includes(user?.role) && (
            <button 
              onClick={() => setIsAddHolidayModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <FiPlus /> Add Holiday
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      <AnimatePresence>
        {isAddHolidayModalOpen && (
          <AddHolidayModal 
            onClose={() => setIsAddHolidayModalOpen(false)} 
            onSuccess={() => queryClient.invalidateQueries(['calendarEvents'])}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddHolidayModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', date: '', type: 'Public Holiday', description: '' });

  const mutation = useMutation({
    mutationFn: async (data) => {
      await api.post('/calendar/holidays', data);
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold dark:text-white">Add New Holiday</h2>
        </div>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(formData);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Holiday Title</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 dark:text-white"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Date</label>
            <input 
              type="date" 
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 dark:text-white"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Type</label>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 dark:text-white"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="Public Holiday">Public Holiday</option>
              <option value="Company Holiday">Company Holiday</option>
              <option value="Optional Holiday">Optional Holiday</option>
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save Holiday'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Calendar;
