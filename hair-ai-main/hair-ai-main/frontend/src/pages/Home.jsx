import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Apple } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col">
      {/* Nav */}
      <header className="glass-nav h-20 w-full fixed top-0 left-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-xl font-display font-bold text-white tracking-tight">HAIRSCOPE</span>
          <span className="font-readout text-[10px] text-brand-cyan tracking-widest">AI</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
            About the science
          </Link>
          {token ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 border border-brand-cyan/50 hover:bg-brand-cyan/10 font-readout text-xs uppercase tracking-widest text-brand-cyan transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-5">
              <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 border border-brand-violet/60 hover:bg-brand-violet/10 font-readout text-xs uppercase tracking-widest text-white transition-all"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero — asymmetric: copy on the left, a live-readout instrument mock on the right,
          instead of the centered-gradient-headline pattern. */}
      <section className="flex-1 pt-36 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-8 items-center">
          {/* Copy */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-px bg-brand-cyan" />
              <span className="font-readout text-[11px] text-brand-cyan tracking-[0.25em] uppercase">
                Norwood Engine — v2
              </span>
            </div>

            <h1 className="text-4xl md:text-[3.4rem] font-display font-bold text-white leading-[1.08] mb-6">
              Your hairline,<br />
              measured — <span className="relative inline-block">
                not guessed
                <span className="absolute left-0 -bottom-1 w-full h-[6px] bg-brand-violet/40" />
              </span>.
            </h1>

            <p className="text-base text-gray-400 max-w-md mb-10 leading-relaxed">
              Upload a front, top, and crown photo. HairScope estimates your Norwood stage, scores density, and builds a nutrition plan around what it finds — logged over time, not guessed once.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-14">
              <Link
                to={token ? '/dashboard' : '/register'}
                className="group px-7 py-4 border border-brand-violet bg-brand-violet/10 hover:bg-brand-violet/20 transition-all flex items-center gap-3"
              >
                <span className="font-readout text-xs uppercase tracking-[0.15em] text-white">Start your first scan</span>
                <span className="text-brand-cyan group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/about"
                className="px-7 py-4 border border-dark-border hover:border-gray-600 font-readout text-xs uppercase tracking-[0.15em] text-gray-300 transition-all"
              >
                How scoring works
              </Link>
            </div>

            {/* Three facts as a hairline-divided readout row, not icon-boxes */}
            <div className="grid grid-cols-3 gap-6 max-w-md border-t border-dark-border pt-6">
              <div>
                <p className="font-readout text-2xl text-white">7</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">Norwood stages tracked</p>
              </div>
              <div>
                <p className="font-readout text-2xl text-brand-cyan">3</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">Angles per scan</p>
              </div>
              <div>
                <p className="font-readout text-2xl text-brand-emerald">2</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">Diet-matched meal plans</p>
              </div>
            </div>
          </div>

          {/* Instrument readout mock — the signature visual, replacing a stock hero image */}
          <div className="scan-frame relative border border-dark-border bg-dark-card/60 p-7">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent animate-pulse-scan" />

            <div className="flex justify-between items-baseline mb-8">
              <span className="font-readout text-[10px] text-gray-500 tracking-widest uppercase">Sample readout</span>
              <span className="flex items-center gap-1.5 font-readout text-[10px] text-brand-emerald tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" /> LIVE
              </span>
            </div>

            <div className="flex items-center gap-8 mb-8">
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#262B3A" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="#00C2D1" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - 0.74)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-readout text-2xl text-white">74</span>
                  <span className="text-[9px] text-gray-500">density</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-dark-border/60 pb-2">
                  <span className="text-xs text-gray-400">Norwood stage</span>
                  <span className="font-readout text-sm text-white">N2</span>
                </div>
                <div className="flex justify-between items-center border-b border-dark-border/60 pb-2">
                  <span className="text-xs text-gray-400">Health index</span>
                  <span className="font-readout text-sm text-brand-emerald">81/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Crown exposure</span>
                  <span className="font-readout text-sm text-white">12%</span>
                </div>
              </div>
            </div>

            <div className="border-t border-dark-border pt-4 flex items-start gap-3">
              <Apple className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Zinc and iron intake flagged below target — meal plan adjusted for this scan.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-20 border-l-2 border-brand-rose/60 bg-brand-rose/5 max-w-4xl w-full flex items-start gap-4 p-6">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-readout text-[10px] text-rose-400 tracking-widest uppercase mb-1">Medical disclaimer</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              HairScope AI is built for cosmetic tracking, education, and dietary support — not clinical diagnosis. Consult a board-certified dermatologist for treatment decisions or advanced hair loss.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-dark-border/60 py-8 text-center">
        <p className="font-readout text-[10px] text-gray-500 tracking-widest">© 2026 HAIRSCOPE AI — MERN STACK</p>
      </footer>
    </div>
  );
};

export default Home;
