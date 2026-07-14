import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, Calendar, Activity, ChevronRight, UploadCloud, AlertCircle, Apple } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analysis/history');
      if (res.data && res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve analysis logs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 skeleton rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const latest = history[0];

  // Prepare chart data (reverse history to show chronological progress)
  const chartData = [...history].reverse().map(item => ({
    date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    density: item.densityScore,
    health: item.healthScore
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Hello, {user?.name || 'User'}</h1>
          <p className="text-sm text-gray-400">Here is your current hair health summary</p>
        </div>
        <Link
          to="/upload"
          className="px-5 py-2.5 bg-brand-violet hover:bg-purple-600 font-bold rounded-xl text-sm text-white flex items-center gap-2 shadow-lg shadow-purple-950/20 transition-all hover:scale-[1.01]"
        >
          <UploadCloud className="w-4 h-4" /> Start Analysis
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {history.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-6 max-w-2xl mx-auto w-full">
          <div className="w-16 h-16 rounded-2xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">No analysis records yet</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              Ready to analyze your hair health? Upload front hairline, top scalp, and crown photos to unlock your scores and nutrition guides.
            </p>
          </div>
          <Link
            to="/upload"
            className="px-6 py-3 bg-brand-violet hover:bg-purple-600 font-bold rounded-xl text-sm text-white shadow-lg transition-all"
          >
            Run First Analysis
          </Link>
        </div>
      ) : (
        /* Dashboard Content */
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 flex items-center gap-4 glow-purple">
              <div className="w-12 h-12 rounded-xl bg-brand-violet/15 flex items-center justify-center text-purple-400 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Norwood Stage</p>
                <h3 className="text-2xl font-readout font-semibold text-white mt-0.5">{latest.norwoodStage}</h3>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4 glow-cyan">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/15 flex items-center justify-center text-cyan-400 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Density Score</p>
                <h3 className="text-2xl font-readout font-semibold text-white mt-0.5">{latest.densityScore}/100</h3>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4 glow-emerald">
              <div className="w-12 h-12 rounded-xl bg-brand-emerald/15 flex items-center justify-center text-emerald-400 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Hair Health Score</p>
                <h3 className="text-2xl font-readout font-semibold text-white mt-0.5">{latest.healthScore}/100</h3>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-400 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Last Scanned</p>
                <h3 className="text-sm font-bold text-white mt-1">
                  {new Date(latest.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="glass-card p-6 lg:col-span-2 flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Hair Metrics Trend</h3>
                <p className="text-xs text-gray-400">Progression of density and health indices</p>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262B3A" vertical={false} />
                    <XAxis dataKey="date" stroke="#8B93A7" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#8B93A7" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#12141C', borderColor: '#262B3A', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="density" name="Density" stroke="#00C2D1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="health" name="Health Score" stroke="#6D5DF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-col gap-6">
              <div className="glass-card p-6 flex flex-col gap-4 flex-1 justify-center">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/15 flex items-center justify-center text-brand-emerald">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Your Hair Loss Diet</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Personalized protein, zinc, iron scores, and a weekly meal guide are ready based on your latest scan.
                  </p>
                </div>
                <Link
                  to="/nutrition"
                  className="mt-2 text-sm font-semibold text-brand-cyan hover:text-cyan-400 flex items-center gap-1 group"
                >
                  View Meal Planner <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Recent Scan Panel */}
              <div className="glass-card p-5 flex flex-col gap-3">
                <h4 className="text-sm font-bold text-white">Latest Images</h4>
                <div className="grid grid-cols-3 gap-2">
                  {latest.imageUrls.front && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-dark-bg border border-dark-border relative group">
                      <img src={latest.imageUrls.front} alt="Front hairline" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[8px] font-bold text-center text-gray-200">Front</div>
                    </div>
                  )}
                  {latest.imageUrls.top && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-dark-bg border border-dark-border relative group">
                      <img src={latest.imageUrls.top} alt="Top scalp" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[8px] font-bold text-center text-gray-200">Top</div>
                    </div>
                  )}
                  {latest.imageUrls.crown && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-dark-bg border border-dark-border relative group">
                      <img src={latest.imageUrls.crown} alt="Crown" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[8px] font-bold text-center text-gray-200">Crown</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
