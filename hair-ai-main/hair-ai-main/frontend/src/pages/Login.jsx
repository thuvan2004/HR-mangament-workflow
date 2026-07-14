import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Please enter all fields');
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col md:flex-row">
      {/* Left — instrument / status panel. Not a hero image, a readout: this is what
          a diagnostic tool's "idle screen" looks like while it waits for a signed-in user. */}
      <aside className="relative md:w-[40%] border-b md:border-b-0 md:border-r border-dark-border/70 flex flex-col justify-between px-8 py-10 md:px-12 md:py-14 overflow-hidden bg-[#0B0D13]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent animate-pulse-scan" />
        </div>

        <div>
          <Link to="/" className="inline-flex items-baseline gap-2">
            <span className="text-xl font-display font-bold text-white tracking-tight">HAIRSCOPE</span>
            <span className="font-readout text-[10px] text-brand-cyan tracking-widest">AI</span>
          </Link>

          <div className="mt-16 md:mt-24">
            <p className="font-readout text-[11px] text-brand-cyan tracking-[0.2em] uppercase mb-3">
              System / Authentication
            </p>
            <h1 className="text-3xl md:text-[2.4rem] font-display font-bold text-white leading-[1.15]">
              Your scan history<br />is waiting.
            </h1>
            <p className="text-sm text-gray-400 mt-4 max-w-xs leading-relaxed">
              Sign in to resume tracking — density scores, Norwood progression, and your meal plan pick up right where you left off.
            </p>
          </div>
        </div>

        {/* Status readout footer — the signature diagnostic-instrument detail */}
        <div className="hidden md:flex flex-col gap-2 font-readout text-[10px] text-gray-500 tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
            SCANNER_ENGINE — ONLINE
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
            SESSION — AWAITING_CREDENTIALS
          </div>
        </div>
      </aside>

      {/* Right — the intake form itself. Deliberately flat: no floating card, no blur,
          no icon-in-input pattern. Fields read like a lab requisition slip. */}
      <main className="flex-1 flex items-center justify-center px-6 py-14 md:py-0">
        <div className="w-full max-w-sm">
          <p className="font-readout text-[11px] text-gray-500 tracking-[0.2em] uppercase mb-2">
            Patient Access — 002
          </p>
          <h2 className="text-2xl font-display font-bold text-white mb-8">Sign in</h2>

          {error && (
            <div className="flex items-center gap-2 py-3 px-3 mb-6 border-l-2 border-brand-rose bg-brand-rose/5 text-sm text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="group flex flex-col gap-2 py-4 border-b border-dark-border focus-within:border-brand-cyan transition-colors">
              <label className="font-readout text-[10px] text-gray-500 group-focus-within:text-brand-cyan tracking-widest uppercase transition-colors">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-[15px] text-white placeholder-gray-600 focus:outline-none"
                required
              />
            </div>

            <div className="group flex flex-col gap-2 py-4 border-b border-dark-border focus-within:border-brand-cyan transition-colors">
              <div className="flex justify-between items-baseline">
                <label className="font-readout text-[10px] text-gray-500 group-focus-within:text-brand-cyan tracking-widest uppercase transition-colors">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-brand-cyan transition-colors">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-[15px] text-white placeholder-gray-600 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-10 w-full py-4 bg-transparent border border-brand-violet/50 hover:border-brand-violet hover:bg-brand-violet/10 disabled:opacity-50 rounded-none text-sm text-white transition-all flex items-center justify-center gap-3"
            >
              <span className="font-readout tracking-[0.15em] uppercase text-xs">
                {loading ? 'Verifying' : 'Authenticate'}
              </span>
              <span className="text-brand-cyan transition-transform group-hover:translate-x-1">→</span>
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-8">
            No account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-cyan hover:underline">
              Register a profile
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
