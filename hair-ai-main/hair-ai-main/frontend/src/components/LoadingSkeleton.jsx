import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="skeleton h-6 w-1/3 rounded-lg"></div>
      <div className="skeleton h-12 w-full rounded-lg"></div>
      <div className="skeleton h-4 w-2/3 rounded-lg"></div>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 h-[300px]">
      <div className="skeleton h-6 w-1/4 rounded-lg"></div>
      <div className="skeleton h-full w-full rounded-lg mt-2"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 4 }) => {
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="skeleton h-7 w-1/5 rounded-lg mb-2"></div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex gap-4 items-center py-2 border-b border-dark-border/40">
            <div className="skeleton h-10 w-10 rounded-full"></div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="skeleton h-4 w-1/4 rounded"></div>
              <div className="skeleton h-3 w-1/2 rounded"></div>
            </div>
            <div className="skeleton h-6 w-16 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
