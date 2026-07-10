import React from 'react';
import { FiCheck, FiX, FiClock, FiMessageCircle, FiUser } from 'react-icons/fi';

const Timeline = ({ steps = [], timeline = [], comments = [], onAddComment }) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Visual Approval Stages Timeline */}
      <div className="bg-slate-900/40 dark:bg-darkbg-800 glass-panel p-5 rounded-2xl">
        <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-6 uppercase tracking-wider">Approval Journey</h4>
        <div className="relative border-l border-slate-200 dark:border-slate-850 ml-4 space-y-8 pb-2">
          {steps.map((step, idx) => {
            let iconColor = 'bg-slate-200 text-slate-500';
            let stepIcon = FiClock;
            let statusText = 'Pending';
            
            if (step.status === 'Approved') {
              iconColor = 'bg-emerald-500 text-white';
              stepIcon = FiCheck;
              statusText = 'Completed';
            } else if (step.status === 'Rejected') {
              iconColor = 'bg-rose-500 text-white';
              stepIcon = FiX;
              statusText = 'Rejected';
            } else if (idx === 0 || (steps[idx - 1] && steps[idx - 1].status === 'Approved')) {
              iconColor = 'bg-indigo-600 text-white animate-pulse';
              stepIcon = FiClock;
              statusText = 'Awaiting Action';
            }

            const Icon = stepIcon;

            return (
              <div key={step._id || idx} className="relative pl-8">
                {/* Dot Icon */}
                <div className={`absolute -left-3.5 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-900 ${iconColor}`}>
                  <Icon size={12} />
                </div>
                
                {/* Step Content */}
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-semibold text-xs text-slate-850 dark:text-slate-200">{step.label}</h5>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      step.status === 'Approved' ? 'bg-emerald-550/10 text-emerald-500' :
                      step.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {statusText}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Assigned Role: {step.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Operations History Timeline */}
      <div className="bg-slate-900/40 dark:bg-darkbg-800 glass-panel p-5 rounded-2xl space-y-4">
        <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Activity Feed</h4>
        <div className="space-y-4 max-h-52 overflow-y-auto">
          {timeline.length === 0 ? (
            <div className="text-xs text-slate-400">No activity logged yet.</div>
          ) : (
            timeline.map((event, idx) => (
              <div key={event._id || idx} className="flex items-start space-x-3 text-xs leading-relaxed border-b border-slate-100 dark:border-slate-800/80 pb-3 last:border-0 last:pb-0">
                <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0 mt-0.5">
                  <FiUser size={12} />
                </div>
                <div>
                  <p className="text-slate-800 dark:text-slate-250 font-medium">
                    <span className="font-bold">{event.performedBy?.name || 'User'}</span> ({event.performedByRole}): <span className="italic">"{event.comment}"</span>
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Timeline;
