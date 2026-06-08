import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="glass premium-card flex items-center justify-between rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
      <div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {title}
        </p>
        <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
          {value}
        </h3>
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
