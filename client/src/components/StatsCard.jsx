import React from 'react';

const StatsCard = ({ title, value, icon: Icon, colorClass, gradientClass }) => {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-slate-200/10 dark:hover:shadow-black/30">
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-8 -mt-8 ${gradientClass}`} />
      
      <div className="flex items-center justify-between">
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none tracking-tight">
            {value}
          </h3>
        </div>
        
        <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 shadow-inner flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-slate-800 dark:text-white" style={{ color: 'inherit' }} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
