import React, { useState, useRef, useEffect } from 'react';

const BeforeAfterSlider = ({ beforeImage, afterImage, beforeLabel = 'Before', afterLabel = 'After' }) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(position);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none border border-dark-border cursor-ew-resize"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Before Image (Background) */}
      <img
        src={beforeImage}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-semibold text-gray-200">
        {beforeLabel}
      </div>

      {/* After Image (Overlay, width clipped based on sliderPos) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={afterImage}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.getBoundingClientRect().width }}
        />
        <div className="absolute top-4 left-4 z-10 bg-brand-violet/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-semibold text-white whitespace-nowrap">
          {afterLabel}
        </div>
      </div>

      {/* Slider Bar & Handle */}
      <div
        className="absolute inset-y-0 w-1 bg-brand-violet z-20 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-violet text-white flex items-center justify-center shadow-lg border-2 border-white slider-handle">
          <svg
            className="w-4 h-4 fill-current rotate-90"
            viewBox="0 0 24 24"
          >
            <path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2M12 18A6 6 0 1 1 18 12A6 6 0 0 1 12 18Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
