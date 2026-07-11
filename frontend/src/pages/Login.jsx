import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiCpu } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick seed logins for developer convenience
  const demoUsers = [
    { label: 'Employee', email: 'employee@flowwise.com', pass: 'employeepassword123' },
    { label: 'Manager', email: 'manager@flowwise.com', pass: 'managerpassword123' },
    { label: 'HR Admin', email: 'hr@flowwise.com', pass: 'hrpassword123' },
    { label: 'Sys Admin', email: 'admin@flowwise.com', pass: 'adminpassword123' }
  ];

  const handleDemoFill = (user) => {
    setEmail(user.email);
    setPassword(user.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden workflow-grid-bg">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-glass glow-indigo">
            F
          </div>
          <span className="text-3xl font-extrabold text-white tracking-wider uppercase">
            FlowWise<span className="text-indigo-400">AI</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-300">
          Sign in to your enterprise account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 py-8 px-6 shadow-glass rounded-3xl sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiMail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-850 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/35 focus:border-indigo-500"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="text-xs">
                  <Link to="/forgot-password" className="font-semibold text-indigo-400 hover:text-indigo-300">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div className="mt-2.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiLock size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-850 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/35 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-glass text-sm font-bold text-white bg-indigo-650 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick Demologin Selector */}
          <div className="mt-8 border-t border-slate-800 pt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 text-center flex items-center justify-center">
              <FiCpu className="mr-1.5" /> Fast Demo Accounts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.label}
                  onClick={() => handleDemoFill(u)}
                  className="px-3 py-2 rounded-xl bg-slate-850 border border-slate-800 text-[10px] font-semibold text-slate-400 hover:bg-indigo-950/20 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors cursor-pointer text-center"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Registration link */}
          <p className="mt-8 text-center text-xs text-slate-500 font-medium">
            Not registered?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Create an account
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;
