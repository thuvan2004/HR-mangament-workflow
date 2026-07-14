import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Calendar, Download, Mail, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';

const AnalysisHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // Email sending status tracker
  const [mailingId, setMailingId] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDownloadPDF = (id) => {
    // Open standard browser window for attachment download
    window.open(`/api/analysis/export-pdf/${id}`, '_blank');
    showToast('Preparing PDF download...', 'info');
  };

  const handleEmailPDF = async (id) => {
    try {
      setMailingId(id);
      showToast('Compiling report to email...', 'info');
      const res = await axios.post(`/api/analysis/email-report/${id}`);
      if (res.data && res.data.success) {
        showToast('PDF report has been emailed successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not send email report.', 'error');
    } finally {
      setMailingId('');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-display font-bold text-white">Analysis History</h1>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div>
        <h1 className="text-3xl font-display font-bold text-white">Analysis History</h1>
        <p className="text-sm text-gray-400">Review, download, and email your clinical hair loss summaries</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto w-full">
          <Calendar className="w-12 h-12 text-gray-500" />
          <h3 className="text-lg font-bold text-white">No scans found</h3>
          <p className="text-sm text-gray-400">Run a diagnostic scan in the Upload panel to see your report log here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((record) => {
            const isExpanded = expandedId === record._id;
            const isMailing = mailingId === record._id;
            const dateStr = new Date(record.createdAt).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div key={record._id} className="glass-card overflow-hidden transition-all duration-300">
                {/* Accordion header */}
                <div
                  onClick={() => toggleExpand(record._id)}
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-dark-card/30 transition-colors"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{dateStr}</h3>
                      <p className="text-xs text-gray-400">Norwood classification: <span className="text-purple-400 font-semibold">{record.norwoodStage}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(record._id);
                      }}
                      className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-border text-gray-300 hover:text-white border border-dark-border transition-colors flex items-center gap-1.5 text-xs font-bold"
                      title="Download PDF Report"
                    >
                      <Download className="w-4 h-4" /> Export
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEmailPDF(record._id);
                      }}
                      disabled={isMailing}
                      className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-border text-gray-300 hover:text-white border border-dark-border transition-colors flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
                      title="Email PDF Report"
                    >
                      <Mail className="w-4 h-4" /> {isMailing ? 'Mailing...' : 'Email'}
                    </button>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-dark-border/40 pt-6 bg-dark-card/10 flex flex-col gap-6 animate-fade-in">
                    {/* Score summary grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-[#0D0F16] border border-dark-border/50 rounded-xl">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Norwood Stage</p>
                        <p className="text-lg font-readout font-semibold text-violet-400 mt-1">{record.norwoodStage}</p>
                      </div>
                      <div className="p-4 bg-[#0D0F16] border border-dark-border/50 rounded-xl">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Density Index</p>
                        <p className="text-lg font-readout font-semibold text-brand-cyan mt-1">{record.densityScore}/100</p>
                      </div>
                      <div className="p-4 bg-[#0D0F16] border border-dark-border/50 rounded-xl">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Crown Scalp Area</p>
                        <p className="text-lg font-readout font-semibold text-white mt-1">{record.crownThinning}%</p>
                      </div>
                      <div className="p-4 bg-[#0D0F16] border border-dark-border/50 rounded-xl">
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">General Health</p>
                        <p className="text-lg font-readout font-semibold text-brand-emerald mt-1">{record.healthScore}/100</p>
                      </div>
                    </div>

                    {/* Previews of scanned images */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-3">Scanned Photos</h4>
                      <div className="grid grid-cols-3 gap-4 max-w-md">
                        {record.imageUrls.front && (
                          <div className="aspect-square rounded-xl overflow-hidden bg-dark-bg border border-dark-border relative">
                            <img src={record.imageUrls.front} className="w-full h-full object-cover" alt="Front" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[8px] font-bold text-center text-gray-200">Front</div>
                          </div>
                        )}
                        {record.imageUrls.top && (
                          <div className="aspect-square rounded-xl overflow-hidden bg-dark-bg border border-dark-border relative">
                            <img src={record.imageUrls.top} className="w-full h-full object-cover" alt="Top" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[8px] font-bold text-center text-gray-200">Top</div>
                          </div>
                        )}
                        {record.imageUrls.crown && (
                          <div className="aspect-square rounded-xl overflow-hidden bg-dark-bg border border-dark-border relative">
                            <img src={record.imageUrls.crown} className="w-full h-full object-cover" alt="Crown" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[8px] font-bold text-center text-gray-200">Crown</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recommendations list */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> System Recommendations
                      </h4>
                      <ul className="flex flex-col gap-1.5 list-disc pl-5">
                        {record.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-400 leading-relaxed">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
