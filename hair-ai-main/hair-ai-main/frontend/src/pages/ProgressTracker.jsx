import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const ProgressTracker = () => {
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
      setError('Could not retrieve progress logs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-extrabold text-white">Progress Analytics</h1>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  // Norwood Stage to Numerical Mapping
  const stageMap = {
    'Norwood 1': 1,
    'Norwood 2': 2,
    'Norwood 3': 3,
    'Norwood 3 Vertex': 3.5,
    'Norwood 4': 4,
    'Norwood 5': 5,
    'Norwood 6': 6,
    'Norwood 7': 7
  };

  // Reverse mapping for axis rendering
  const reverseStageMap = (val) => {
    if (val === 1) return 'N1';
    if (val === 2) return 'N2';
    if (val === 3) return 'N3';
    if (val === 3.5) return 'N3-V';
    if (val === 4) return 'N4';
    if (val === 5) return 'N5';
    if (val === 6) return 'N6';
    if (val === 7) return 'N7';
    return '';
  };

  // Chronological sorting for trends
  const trendData = [...history].reverse().map(item => ({
    date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    density: item.densityScore,
    health: item.healthScore,
    norwoodVal: stageMap[item.norwoodStage] || 1,
    norwoodLabel: item.norwoodStage
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Progress Analytics</h1>
        <p className="text-sm text-gray-400">Chronological analysis graphs tracking density and hair loss stages</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto w-full">
          <TrendingUp className="w-12 h-12 text-gray-500" />
          <h3 className="text-lg font-bold text-white">No graphs available</h3>
          <p className="text-sm text-gray-400">Perform scans in the Upload panel to construct progress graphs.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Chart 1: Density vs Health line graph */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Hair Health & Density Trends</h3>
              <p className="text-xs text-gray-400">Tracking score ratios (0-100) across scan history</p>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232d42" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161c2a', borderColor: '#232d42', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                  <Line type="monotone" dataKey="density" name="Density Score" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="health" name="Health Index" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Norwood Hamilton Progression */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Norwood Hamilton Stage Progression</h3>
              <p className="text-xs text-gray-400">Estimation levels (Stage 1 to Stage 7) indicating recession levels</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232d42" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis
                    domain={[1, 7]}
                    ticks={[1, 2, 3, 3.5, 4, 5, 6, 7]}
                    tickFormatter={reverseStageMap}
                    stroke="#9ca3af"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161c2a', borderColor: '#232d42', borderRadius: '12px' }}
                    formatter={(value, name, props) => [props.payload.norwoodLabel, 'Estimated Stage']}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="norwoodVal"
                    name="Norwood Stage"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
