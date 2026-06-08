import React from 'react';

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-4 space-y-4 shadow-sm bg-white dark:bg-darkbg-200/30">
      <div className="skeleton h-44 w-full rounded-xl" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-1/4 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="skeleton h-7 w-20 rounded-lg" />
        <div className="skeleton h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800/50 px-4">
      <div className="flex items-center space-x-3 w-2/3">
        <div className="skeleton h-9 w-9 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3.5 w-1/3 rounded" />
          <div className="skeleton h-2.5 w-1/2 rounded" />
        </div>
      </div>
      <div className="skeleton h-7 w-20 rounded-lg" />
    </div>
  );
}

export function NoticeSkeleton() {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-2.5 bg-white dark:bg-darkbg-200/20">
      <div className="skeleton h-4.5 w-1/3 rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}
