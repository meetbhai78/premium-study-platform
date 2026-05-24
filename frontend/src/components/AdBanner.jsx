import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdBanner({ position = 'top' }) {
  const { isPremium, isAdmin } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Premium users and admins do NOT see advertisements
  if (isPremium || isAdmin || dismissed) {
    return null;
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-purple-200 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-pink-500/10 p-4 dark:border-purple-900/30 transition-all ${
        position === 'sidebar' ? 'my-4' : 'my-6'
      }`}
    >
      {/* Script Placeholders for future AdSense / AdMob bindings */}
      {/* <!-- Google AdSense script integration target --> */}
      {/* <!-- <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-12345" data-ad-slot="67890"></ins> --> */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/20">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <span className="inline-block rounded-md bg-purple-200 dark:bg-purple-900/60 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-purple-700 dark:text-purple-300">
              Sponsored Advertisement
            </span>
            <h4 className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
              Supercharge your preparation for Gujarati, English, Board & Competitive exams!
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Unlock direct access to PDF study guides, premium mock tests, and full course videos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/payment"
            className="flex items-center gap-1 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/25 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 fill-white" />
            Remove Ads (₹50 Only)
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss ad"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
