import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Load existing notifications on auth
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect socket to base URL (Vite proxy redirects socket connections as well)
    const socketInstance = io('/', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server.');
      socketInstance.emit('join_room', user._id || user.id);
    });

    // Listen for live notifications
    socketInstance.on('notification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      
      // Trigger floating premium toast message
      setToast({
        id: Date.now(),
        message: newNotif.message,
        type: newNotif.type,
      });
    });

    setSocket(socketInstance);

    // Fetch historical notifications
    const fetchNotifications = async () => {
      try {
        // We can lazy load from a general endpoint if we need to
        const { default: api } = await import('../services/api');
        const { data } = await api.get(`/requests?filter=approvals`); // or general notification history
        // To keep database clean, we'll request approvals count or use recent notifications
      } catch (err) {
        console.warn('Could not fetch notifications history:', err.message);
      }
    };
    fetchNotifications();

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Clear active toast alert
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const showToast = (message, type = 'info') => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications, markAsRead, showToast }}>
      {children}

      {/* Premium Floating Slide-In Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-bounce max-w-sm">
          <div className="pointer-events-auto bg-slate-900/90 text-white glass-panel p-4 rounded-xl shadow-glass border-l-4 border-indigo-500 flex items-start space-x-3 transition-all duration-300">
            <div className="mt-0.5 text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-xs text-slate-300 tracking-wide uppercase">Workflow Notification</h4>
              <p className="text-sm mt-1 text-slate-100">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
