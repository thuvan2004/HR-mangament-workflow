import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-[#17C978]/10 text-emerald-400 border-[#17C978]/30 hover:border-[#17C978]/50',
    error: 'bg-[#FF4D6A]/10 text-rose-400 border-[#FF4D6A]/30 hover:border-[#FF4D6A]/50',
    info: 'bg-[#00C2D1]/10 text-cyan-400 border-[#00C2D1]/30 hover:border-[#00C2D1]/50'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg backdrop-blur-md animate-slide-up ${typeStyles[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium pr-2">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
