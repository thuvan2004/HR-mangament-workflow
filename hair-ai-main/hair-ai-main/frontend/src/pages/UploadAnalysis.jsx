import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { UploadCloud, Image, Check, Sparkles, RefreshCw, Apple, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

const UploadAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState({ front: null, top: null, crown: null });
  const [previews, setPreviews] = useState({ front: '', top: '', crown: '' });
  const [dietType, setDietType] = useState('Non-Vegetarian');
  
  // Loading & Scan Animation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sync default user diet if available
  useEffect(() => {
    if (user?.dietType) {
      setDietType(user.dietType);
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleFileChange = (e, slot) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return showToast('File exceeds 10MB limit', 'error');
    }

    setFiles(prev => ({ ...prev, [slot]: file }));
    setPreviews(prev => ({ ...prev, [slot]: URL.createObjectURL(file) }));
  };

  const scanStepsText = [
    'Establishing secure link to diagnostic models...',
    'Analyzing hairline recession angles & template margins...',
    'Gaging crown hair-to-scalp coverage ratio...',
    'Correlating results to Norwood classifications...',
    'Generating targeted nutritional food scores...'
  ];

  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanStep(prev => {
          if (prev < scanStepsText.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.front && !files.top && !files.crown) {
      return showToast('Please upload at least one photo for analysis', 'error');
    }

    try {
      setIsScanning(true);
      setScanStep(0);

      // Step 1: Upload photos via Multer
      const formData = new FormData();
      if (files.front) formData.append('front', files.front);
      if (files.top) formData.append('top', files.top);
      if (files.crown) formData.append('crown', files.crown);

      const uploadRes = await axios.post('/api/analysis/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!uploadRes.data.success) {
        throw new Error('Image uploading failed');
      }

      // Step 2: Trigger AI Analysis
      const analyzeRes = await axios.post('/api/analysis/analyze', {
        imageUrls: uploadRes.data.imageUrls,
        dietType
      });

      if (analyzeRes.data.success) {
        // Complete the animation beautifully
        setTimeout(() => {
          setIsScanning(false);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setIsScanning(false);
      showToast(err.response?.data?.message || 'Analysis processing failed. Try again.', 'error');
    }
  };

  const removePhoto = (slot) => {
    setFiles(prev => ({ ...prev, [slot]: null }));
    setPreviews(prev => ({ ...prev, [slot]: '' }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Main scanning screen overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-[#090B10]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="scan-frame relative w-64 h-64 rounded-2xl overflow-hidden border border-brand-violet/40 mb-8 max-w-full">
            {/* Show whatever preview is available */}
            <img
              src={previews.front || previews.top || previews.crown}
              className="w-full h-full object-cover opacity-60"
              alt="Scanning view"
            />
            {/* Pulsing scanning bar */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-0 animate-pulse-scan shadow-[0_0_10px_#00C2D1]"></div>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-brand-cyan animate-spin" />
            <h3 className="text-xl font-bold text-white">Analyzing Hair Profiles</h3>
          </div>
          <p className="text-sm text-gray-400 max-w-md h-6 animate-pulse">
            {scanStepsText[scanStep]}
          </p>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-display font-bold text-white">AI Diagnostic Scan</h1>
        <p className="text-sm text-gray-400">Upload hair and scalp photos to trigger deep analysis</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Upload Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Front hairline */}
          <div className="glass-card p-6 flex flex-col gap-4 items-center justify-center text-center relative min-h-[220px]">
            <h3 className="text-sm font-bold text-white"><span className="font-readout text-brand-cyan">01</span> Front Hairline</h3>
            {previews.front ? (
              <div className="scan-frame relative w-full aspect-square rounded-xl overflow-hidden border border-dark-border">
                <img src={previews.front} className="w-full h-full object-cover" alt="Preview" />
                <button
                  type="button"
                  onClick={() => removePhoto('front')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <label className="flex-1 w-full border border-dashed border-dark-border hover:border-brand-violet/50 rounded-xl flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-500" />
                <span className="text-xs font-semibold text-gray-300">Choose hairline photo</span>
                <span className="text-[10px] text-gray-500">JPG, PNG, WEBP (Max 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'front')}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Top scalp */}
          <div className="glass-card p-6 flex flex-col gap-4 items-center justify-center text-center relative min-h-[220px]">
            <h3 className="text-sm font-bold text-white"><span className="font-readout text-brand-cyan">02</span> Top Scalp</h3>
            {previews.top ? (
              <div className="scan-frame relative w-full aspect-square rounded-xl overflow-hidden border border-dark-border">
                <img src={previews.top} className="w-full h-full object-cover" alt="Preview" />
                <button
                  type="button"
                  onClick={() => removePhoto('top')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <label className="flex-1 w-full border border-dashed border-dark-border hover:border-brand-violet/50 rounded-xl flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-500" />
                <span className="text-xs font-semibold text-gray-300">Choose top scalp photo</span>
                <span className="text-[10px] text-gray-500">JPG, PNG, WEBP (Max 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'top')}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Crown */}
          <div className="glass-card p-6 flex flex-col gap-4 items-center justify-center text-center relative min-h-[220px]">
            <h3 className="text-sm font-bold text-white"><span className="font-readout text-brand-cyan">03</span> Crown (Vertex)</h3>
            {previews.crown ? (
              <div className="scan-frame relative w-full aspect-square rounded-xl overflow-hidden border border-dark-border">
                <img src={previews.crown} className="w-full h-full object-cover" alt="Preview" />
                <button
                  type="button"
                  onClick={() => removePhoto('crown')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <label className="flex-1 w-full border border-dashed border-dark-border hover:border-brand-violet/50 rounded-xl flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-gray-500" />
                <span className="text-xs font-semibold text-gray-300">Choose crown photo</span>
                <span className="text-[10px] text-gray-500">JPG, PNG, WEBP (Max 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'crown')}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Nutritional Diet Options */}
        <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald/15 flex items-center justify-center text-brand-emerald shrink-0">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Personal Diet Target</h3>
              <p className="text-xs text-gray-400">Syncs meal plan generator according to preference</p>
            </div>
          </div>
          <div className="flex gap-2 p-1 bg-[#0D0F16] border border-dark-border rounded-xl">
            <button
              type="button"
              onClick={() => setDietType('Non-Vegetarian')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                dietType === 'Non-Vegetarian' ? 'bg-brand-violet text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Non-Vegetarian
            </button>
            <button
              type="button"
              onClick={() => setDietType('Vegetarian')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                dietType === 'Vegetarian' ? 'bg-brand-violet text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Vegetarian
            </button>
          </div>
        </div>

        {/* Action button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 font-bold rounded-xl text-white shadow-xl shadow-purple-900/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Sparkles className="w-5 h-5 animate-pulse" /> Launch Diagnostic Analysis
        </button>

        {/* Disclaimer reminder */}
        <div className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Reminder: HairScope AI is not a clinical medical diagnostics platform. Images uploaded here are processed using cosmetic computer vision models. Consult a dermatologist or medical professional for specialized clinical treatments.
          </p>
        </div>
      </form>
    </div>
  );
};

export default UploadAnalysis;
