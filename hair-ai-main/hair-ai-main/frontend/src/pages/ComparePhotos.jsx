import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, ArrowRight, AlertCircle, RefreshCw, Layers, Columns2 } from 'lucide-react';

const ComparePhotos = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [beforeId, setBeforeId] = useState('');
  const [afterId, setAfterId] = useState('');
  const [compareMode, setCompareMode] = useState('slider'); // slider | side-by-side
  const [photoType, setPhotoType] = useState('front'); // front | top | crown

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analysis/history');
      if (res.data && res.data.success) {
        setHistory(res.data.history);
        if (res.data.history.length >= 2) {
          // Default: Compare the oldest with the newest
          setBeforeId(res.data.history[res.data.history.length - 1]._id);
          setAfterId(res.data.history[0]._id);
        } else if (res.data.history.length === 1) {
          setBeforeId(res.data.history[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve analysis records.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Compare Photos</h1>
        <CardSkeleton />
      </div>
    );
  }

  const beforeRecord = history.find(item => item._id === beforeId);
  const afterRecord = history.find(item => item._id === afterId);

  const getImageUrl = (record, type) => {
    if (!record) return '';
    return record.imageUrls[type] || '';
  };

  const beforeImg = getImageUrl(beforeRecord, photoType);
  const afterImg = getImageUrl(afterRecord, photoType);

  const hasPhotos = beforeImg && afterImg;

  // Stats comparison
  const densityDiff = afterRecord && beforeRecord ? afterRecord.densityScore - beforeRecord.densityScore : 0;
  const healthDiff = afterRecord && beforeRecord ? afterRecord.healthScore - beforeRecord.healthScore : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Compare Diagnostics</h1>
        <p className="text-sm text-gray-400">Track and compare physical hair loss developments visually</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {history.length < 2 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto w-full">
          <Sparkles className="w-12 h-12 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Additional scans required</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            You need to submit at least **two separate analysis reports** to run timeline comparisons. Upload another photo in the scan panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparison controls panel */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Compare Settings</h3>

              {/* Photo angle select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Photo Angle</label>
                <select
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                >
                  <option value="front">Front Hairline</option>
                  <option value="top">Top Scalp</option>
                  <option value="crown">Crown (Vertex)</option>
                </select>
              </div>

              {/* Before scan select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Before Date</label>
                <select
                  value={beforeId}
                  onChange={(e) => setBeforeId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                >
                  {history.map(item => (
                    <option key={item._id} value={item._id}>
                      {new Date(item.createdAt).toLocaleDateString()} - {item.norwoodStage}
                    </option>
                  ))}
                </select>
              </div>

              {/* After scan select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">After Date</label>
                <select
                  value={afterId}
                  onChange={(e) => setAfterId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0D0F16] border border-dark-border rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                >
                  {history.map(item => (
                    <option key={item._id} value={item._id}>
                      {new Date(item.createdAt).toLocaleDateString()} - {item.norwoodStage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Compare mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300">Comparison Format</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#0D0F16] border border-dark-border rounded-xl">
                  <button
                    onClick={() => setCompareMode('slider')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${compareMode === 'slider' ? 'bg-brand-violet text-white' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Slider
                  </button>
                  <button
                    onClick={() => setCompareMode('side-by-side')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${compareMode === 'side-by-side' ? 'bg-brand-violet text-white' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <Columns2 className="w-3.5 h-3.5" /> Side-by-Side
                  </button>
                </div>
              </div>
            </div>

            {/* Shift comparison metrics card */}
            {beforeRecord && afterRecord && (
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metrics Progression</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center py-2 border-b border-dark-border/40">
                    <span className="text-xs text-gray-400">Norwood Stage</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {beforeRecord.norwoodStage} <ArrowRight className="w-3.5 h-3.5" /> {afterRecord.norwoodStage}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dark-border/40">
                    <span className="text-xs text-gray-400">Density Shift</span>
                    <span className={`text-xs font-bold ${densityDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {densityDiff >= 0 ? `+${densityDiff}` : densityDiff} points
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-gray-400">Overall Health Shift</span>
                    <span className={`text-xs font-bold ${healthDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {healthDiff >= 0 ? `+${healthDiff}` : healthDiff} points
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visual Display side */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {!hasPhotos ? (
              <div className="glass-card p-12 text-center text-gray-400 flex items-center justify-center h-full">
                No matching photos uploaded for the selected angle in these scans.
              </div>
            ) : compareMode === 'slider' ? (
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white">Slider Viewport</h3>
                <BeforeAfterSlider
                  beforeImage={beforeImg}
                  afterImage={afterImg}
                  beforeLabel={`Before (${new Date(beforeRecord.createdAt).toLocaleDateString()})`}
                  afterLabel={`After (${new Date(afterRecord.createdAt).toLocaleDateString()})`}
                />
              </div>
            ) : (
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white">Side-by-Side Viewport</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-gray-300">Before: {new Date(beforeRecord.createdAt).toLocaleDateString()}</p>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-dark-border bg-dark-bg">
                      <img src={beforeImg} className="w-full h-full object-cover" alt="Before view" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-gray-300">After: {new Date(afterRecord.createdAt).toLocaleDateString()}</p>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-dark-border bg-dark-bg">
                      <img src={afterImg} className="w-full h-full object-cover" alt="After view" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePhotos;
