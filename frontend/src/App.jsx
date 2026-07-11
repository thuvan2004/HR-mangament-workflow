import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import AIAssistant from './components/AIAssistant';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequestManager from './pages/RequestManager';
import WorkflowBuilder from './pages/WorkflowBuilder';
import Employees from './pages/Employees';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Auth Route Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Public Route Guard (Redirect to dashboard if already logged in)
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};

// Main Layout Wrapper
const DashboardLayout = ({ onOpenCommandPalette }) => {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-darkbg-900 overflow-hidden">
      
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Sticky Header */}
        <Header onOpenCommandPalette={onOpenCommandPalette} />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-darkbg-900/40">
          <Outlet />
        </main>

      </div>

      {/* Floating AI assistant bubble mounted globally */}
      <AIAssistant />
    </div>
  );
};

const AppContent = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Bind Ctrl+K and Cmd+K to Command Palette toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Router>
      <Routes>
        
        {/* Public Authentication routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Dashboard Workspace routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />}>
            
            {/* Common dashboard pages */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/requests" element={<RequestManager />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/settings" element={<Settings />} />

            {/* Manager and HR specific routes */}
            <Route element={<ProtectedRoute allowedRoles={['Manager', 'HR', 'Admin']} />}>
              <Route path="/analytics" element={<Analytics />} />
            </Route>
            
            {/* HR / Admin explicit templates routes */}
            <Route element={<ProtectedRoute allowedRoles={['HR', 'Admin']} />}>
              <Route path="/workflows" element={<WorkflowBuilder />} />
            </Route>

          </Route>
        </Route>

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {/* Global Command Palette modal overlay */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
