import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── House ads shown in web browser ─────────────────────────────────────────
// NOTE: Start.io earning ads work ONLY inside Android APK via native SDK.
// These house ads encourage free users to go Premium (₹99).
const HOUSE_ADS = [
  {
    id: 'tat_tet_exam',
    badge: 'TAT / TET 2026 Special',
    title: 'TAT & TET પરીક્ષામાં મેળવો 90+ સ્કોર!',
    description: 'નિષ્ણાત શિક્ષકો દ્વારા તૈયાર ટેસ્ટ સિરીઝ, મોક ટેસ્ટ અને ડેઈલી પ્રેક્ટિસ ક્લાસ.',
    icon: GraduationCap,
    gradient: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-200 dark:border-purple-900/30',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  },
  {
    id: 'class3_gpsc',
    badge: 'Class-3 GPSC Target',
    title: 'GPSC & વર્ગ-૩ સંપૂર્ણ તૈયારી',
    description: 'લેટેસ્ટ મોડેલ પેપર્સ, કરંટ અફેર્સ PDF, GK પ્રશ્નોત્તરી — એક જ જગ્યાએ.',
    icon: Trophy,
    gradient: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-200 dark:border-amber-900/30',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
  {
    id: 'english_grammar',
    badge: 'English Grammar Pro',
    title: 'સ્પર્ધા પરીક્ષા માટે English Grammar',
    description: 'ટોપ રૂલ્સ, Tenses ચાર્ટ્સ અને Vocabulary Sheets. 100% result guaranteed.',
    icon: BookOpen,
    gradient: 'from-emerald-500/10 to-cyan-500/10',
    border: 'border-emerald-200 dark:border-emerald-900/30',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
];

// ─── Android APK: Start.io SDK ads load hook ─────────────────────────────────
function tryStartioAd(position) {
  if (typeof window === 'undefined') return;
  // Start.io Native SDK (injected by Android WebView / Capacitor bridge)
  if (window.startio && typeof window.startio.loadAd === 'function') {
    window.startio.loadAd({
      appId: '204789628',
      placement: position === 'sidebar' ? 'sidebar_banner' : 'top_banner',
      onAdLoaded: () => console.log('[Start.io] Ad loaded in APK.'),
      onAdFailed: (e) => console.warn('[Start.io] Ad failed:', e),
    });
  }
}

export default function AdBanner({ position = 'top' }) {
  const { isPremium, isAdmin } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [houseAd] = useState(
    () => HOUSE_ADS[Math.floor(Math.random() * HOUSE_ADS.length)]
  );

  useEffect(() => {
    if (isPremium || isAdmin || dismissed) return;
    // Attempt Start.io ad (works inside Android APK with native SDK)
    tryStartioAd(position);
  }, [isPremium, isAdmin, dismissed, position]);

  // Premium users & admins never see ads
  if (isPremium || isAdmin || dismissed) return null;

  const Icon = houseAd.icon;

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border ${houseAd.border} bg-gradient-to-r ${houseAd.gradient} p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-scale-in ${
        position === 'sidebar' ? 'my-3' : 'my-5'
      }`}
    >
      {/* Start.io APK native ad injection target */}
      <div
        id={`startio-ad-${position}`}
        data-app-id="204789628"
        style={{ display: 'none', width: '100%', minHeight: '50px' }}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Ad content */}
        <div className="flex items-start gap-3.5 w-full sm:w-auto">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${houseAd.badgeColor}`}>
                {houseAd.badge}
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                Sponsored Ad
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-1.5 leading-snug">
              {houseAd.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {houseAd.description}
            </p>
          </div>
        </div>

        {/* Right: Upgrade CTA + Dismiss */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t border-slate-100 dark:border-slate-800/60 pt-3 sm:pt-0 sm:border-t-0">
          <Link
            to="/payment"
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 fill-white" />
            જાહેરાત બંધ (₹99 Only)
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            title="Dismiss ad"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
