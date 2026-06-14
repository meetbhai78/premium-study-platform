import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Google AdSense Credentials ─────────────────────────────────────────────
const GOOGLE_ADSENSE_CLIENT_ID = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-2863105557528184';
const GOOGLE_ADSENSE_SLOT_ID   = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID   || '7759102911';

// ─── Fallback house ads (if Google AdSense is blocked or fails) ───────────────
const HOUSE_ADS = [
  {
    id: 'tat_tet',
    badge: 'TAT / TET 2026 Special',
    title: 'TAT & TET પરીક્ષામાં મેળવો 90+ સ્કોર!',
    description: 'નિષ્ણાત શિક્ષકો દ્વારા ટેસ્ટ સિરીઝ, મોક ટેસ્ટ, ડેઈલી ક્લાસ.',
    icon: GraduationCap,
    gradient: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-200 dark:border-purple-900/30',
    badge_color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  },
  {
    id: 'gpsc',
    badge: 'Class-3 GPSC Target',
    title: 'GPSC & વર્ગ-૩ સંપૂર્ણ તૈયારી',
    description: 'મોડેલ પેપર્સ, કરંટ અફેર્સ PDF, GK — એક જ જગ્યાએ.',
    icon: Trophy,
    gradient: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-200 dark:border-amber-900/30',
    badge_color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
  {
    id: 'english',
    badge: 'English Grammar Pro',
    title: 'સ્પર્ધા પરીક્ષા English Grammar',
    description: 'Tenses, Vocabulary, Rules — 100% result guaranteed.',
    icon: BookOpen,
    gradient: 'from-emerald-500/10 to-cyan-500/10',
    border: 'border-emerald-200 dark:border-emerald-900/30',
    badge_color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
];

// ─── Load Google AdSense SDK script dynamically (only on web browser) ────────
let _sdkState = 'idle'; // 'idle' | 'loading' | 'ready' | 'failed'
const _sdkCallbacks = [];

function loadAdSenseSDK(cb) {
  // Never load inside Capacitor native platforms
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    if (cb) cb(false);
    return;
  }

  if (_sdkState === 'ready')  { if (cb) cb(true);  return; }
  if (_sdkState === 'failed') { if (cb) cb(false); return; }

  if (cb) _sdkCallbacks.push(cb);
  if (_sdkState === 'loading') return;

  _sdkState = 'loading';

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT_ID}`;

  script.onload = () => {
    _sdkState = 'ready';
    _sdkCallbacks.forEach((fn) => fn(true));
    _sdkCallbacks.length = 0;
  };
  script.onerror = () => {
    _sdkState = 'failed';
    _sdkCallbacks.forEach((fn) => fn(false));
    _sdkCallbacks.length = 0;
  };

  document.head.appendChild(script);
}

export default function AdBanner({ position = 'top' }) {
  const { isPremium, isAdmin } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [adState, setAdState] = useState('loading'); // 'loading' | 'adsense' | 'house'
  const [houseAd] = useState(
    () => HOUSE_ADS[Math.floor(Math.random() * HOUSE_ADS.length)]
  );

  const isNativeApp = window.Capacitor && window.Capacitor.isNativePlatform();

  // ─── Load Google AdSense on mount ──────────────────────────────────────────
  useEffect(() => {
    if (isPremium || isAdmin || dismissed || isNativeApp) return;

    let timer;
    loadAdSenseSDK((loaded) => {
      if (!loaded) {
        setAdState('house');
        return;
      }

      // Give DOM time to render the container ins/div before invoking push
      timer = setTimeout(() => {
        try {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdState('adsense');
          } else {
            // Script loaded but adsbygoogle blocked (e.g. adblocker)
            setAdState('house');
          }
        } catch (e) {
          console.warn('Google AdSense push failed:', e);
          setAdState('house');
        }
      }, 300);
    });

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPremium, isAdmin, dismissed, isNativeApp, position]);

  // ─── Never show ads to premium / admin / native app users ──────────────────
  if (isPremium || isAdmin || dismissed || isNativeApp) return null;

  // ─── Shared wrapper classes ───────────────────────────────────────────────
  const wrapClass = `relative w-full animate-scale-in ${position === 'sidebar' ? 'my-3' : 'my-5'}`;

  // ─── Dismiss + Upgrade overlay (shown on every ad type) ──────────────────
  const OverlayControls = () => (
    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/50">
      <Link
        to="/payment"
        className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Sparkles className="h-3.5 w-3.5 fill-white" />
        જાહેરાત બંધ (₹99 Only)
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
        title="Dismiss ad"
      >
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );

  // ─── LOADING skeleton ─────────────────────────────────────────────────────
  if (adState === 'loading') {
    return (
      <div className={wrapClass}>
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 p-4 animate-pulse space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-1/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── GOOGLE ADSENSE real banner container ──────────────────────────────────
  if (adState === 'adsense') {
    return (
      <div className={wrapClass}>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/40 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Advertisement (Google Ad)
            </span>
          </div>
          {/* AdSense Unit */}
          <div className="w-full overflow-hidden flex justify-center bg-slate-50 dark:bg-slate-900/20 rounded-2xl p-2 min-h-[90px]">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minWidth: '250px' }}
              data-ad-client={GOOGLE_ADSENSE_CLIENT_ID}
              data-ad-slot={GOOGLE_ADSENSE_SLOT_ID}
              data-ad-format="horizontal"
              data-full-width-responsive="true"
            />
          </div>
          <OverlayControls />
        </div>
      </div>
    );
  }

  // ─── FALLBACK: House ad ────────────────────────────────────────────────────
  const Icon = houseAd.icon;
  return (
    <div
      className={`${wrapClass} rounded-3xl overflow-hidden border ${houseAd.border} bg-gradient-to-r ${houseAd.gradient} p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 w-full sm:w-auto">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${houseAd.badge_color}`}>
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
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss ad"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
