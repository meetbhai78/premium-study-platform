import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Download, X, FileText, RefreshCw, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';

/**
 * PdfViewer — Robust PDF viewer component
 *
 * Strategy (in order):
 *   1. Cloudinary URL  → inject `fl_attachment:false` → serve inline directly in iframe
 *   2. Other public URL → use directly in iframe (most public PDF hosts allow it)
 *   3. Local dev URL   → use directly in iframe
 *   4. On error        → show recovery UI: "Open in Browser" + Retry
 *
 * WHY NOT gview: Google Docs Viewer is rate-limited, unreliable, and blocked by Cloudinary
 * raw file headers. Direct embedding with fl_attachment:false is far more reliable.
 */

/**
 * Make Cloudinary raw PDF URLs serve inline by injecting fl_attachment:false.
 * From: https://res.cloudinary.com/xxx/raw/upload/v123/folder/file.pdf
 * To:   https://res.cloudinary.com/xxx/raw/upload/fl_attachment:false/v123/folder/file.pdf
 */
const makeInlineUrl = (url) => {
  if (!url) return url;
  // Cloudinary raw upload URL pattern
  if (url.includes('res.cloudinary.com') && url.includes('/raw/upload/')) {
    // Don't double-inject
    if (url.includes('fl_attachment')) return url;
    return url.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
  }
  // Cloudinary image/video URLs also support fl_attachment
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('fl_attachment')) return url;
    return url.replace('/upload/', '/upload/fl_attachment:false/');
  }
  return url;
};

/** Normalize any fileUrl to a full absolute URL */
const normalizeUrl = (fileUrl, serverUrl) => {
  if (!fileUrl || fileUrl === '#locked') return null;
  if (fileUrl.startsWith('http')) return fileUrl;
  if (fileUrl.startsWith('/uploads')) return `${serverUrl}${fileUrl}`;
  return fileUrl;
};

/** Build the iframe src — direct embed for all URLs */
const buildIframeSrc = (pdfUrl) => {
  // Inject fl_attachment:false for Cloudinary so it serves inline
  return makeInlineUrl(pdfUrl);
};

export default function PdfViewer({
  activePdf,
  isPdfFullScreen,
  isPremium,
  isAdmin,
  onClose,
  onFullScreenToggle,
  onDownload,
  serverUrl,
}) {
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const [retryCount, setRetryCount] = useState(0);
  const [iframeSrc, setIframeSrc] = useState('');

  const pdfUrl = normalizeUrl(activePdf?.fileUrl, serverUrl);
  // The open-in-browser link always points to the original (not modified) URL
  const openUrl = pdfUrl;

  useEffect(() => {
    if (!pdfUrl) return;
    setLoadState('loading');
    setIframeSrc(buildIframeSrc(pdfUrl));
  }, [pdfUrl, retryCount]);

  // Timeout: if iframe doesn't fire onLoad in 20s, show error UI
  useEffect(() => {
    if (loadState !== 'loading') return;
    const timer = setTimeout(() => {
      setLoadState('error');
    }, 20000);
    return () => clearTimeout(timer);
  }, [iframeSrc, loadState]);

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setLoadState('loaded');
  }, []);

  const handleIframeError = useCallback(() => {
    setLoadState('error');
  }, []);

  // Locked content guard
  if (!activePdf?.fileUrl || activePdf.fileUrl === '#locked') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Premium Content</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            This document requires a premium subscription.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
            <a
              href="/payment"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isPdfFullScreen
          ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-2 sm:p-4'
      }
    >
      <div
        className={
          isPdfFullScreen
            ? 'w-full h-full flex flex-col bg-white dark:bg-slate-950'
            : 'relative w-full h-[90vh] max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col'
        }
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-xs font-black text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 focus:outline-none active:scale-95"
            >
              <span className="text-sm leading-none">←</span>
              <span className="hidden xs:inline">Exit</span>
            </button>
            <div className="min-w-0 hidden sm:block">
              <p className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-white truncate max-w-xs md:max-w-md">
                {activePdf.title}
              </p>
              <span className="inline-block mt-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-300">
                PDF Reader
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Retry — only when error */}
            {loadState === 'error' && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 px-2.5 py-2 text-[10px] sm:text-xs font-bold text-white transition-all focus:outline-none"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden xs:inline">Retry</span>
              </button>
            )}

            {/* Open in new tab — always visible */}
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-2.5 py-2 text-[10px] sm:text-xs font-bold text-white transition-all focus:outline-none"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Open</span>
            </a>

            {/* Fullscreen toggle */}
            <button
              onClick={onFullScreenToggle}
              className="flex items-center gap-1 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-2.5 py-2 text-[10px] sm:text-xs font-bold text-white transition-all focus:outline-none"
            >
              {isPdfFullScreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              <span className="hidden sm:inline">{isPdfFullScreen ? 'Exit Full' : 'Full Screen'}</span>
            </button>

            {/* Download — premium only */}
            {(isPremium || isAdmin) && (
              <button
                onClick={() => onDownload(activePdf)}
                className="flex items-center gap-1 rounded-xl bg-violet-500 hover:bg-violet-600 px-2.5 py-2 text-[10px] sm:text-xs font-bold text-white transition-all focus:outline-none"
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Viewer Body ── */}
        <div
          className="flex-1 relative bg-slate-100 dark:bg-slate-950 overflow-hidden"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Loading overlay */}
          {loadState === 'loading' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-indigo-500 animate-pulse" />
              </div>
              <div className="flex gap-1.5 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '160ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '320ms' }} />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">PDF લોડ થઈ રહ્યું છે...</p>
              <p className="text-xs text-slate-400 mt-1">Loading document, please wait</p>
            </div>
          )}

          {/* Error / fallback overlay */}
          {loadState === 'error' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-base font-black text-slate-800 dark:text-white mb-2">
                  PDF લોડ ન થઈ શક્યો
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  Browser security settings blocked the in-app viewer.
                  Use <strong>"Open in Browser"</strong> to view the PDF directly — it will open in a new tab.
                </p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Browser માં ખોલો (Open in Browser)
                  </a>
                  <button
                    onClick={handleRetry}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    ફરી પ્રયાસ (Retry)
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Iframe — always rendered; hidden via opacity when error */}
          {iframeSrc && (
            <iframe
              key={`pdf-${activePdf._id}-r${retryCount}`}
              src={iframeSrc}
              className={`w-full h-full border-none transition-opacity duration-300 ${
                loadState === 'error' ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              title={activePdf.title}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs sm:max-w-xl">
            {activePdf.description || 'No description available.'}
          </p>
          <span className={`flex items-center gap-1.5 text-[10px] font-bold flex-shrink-0 ${
            loadState === 'loaded' ? 'text-emerald-500' :
            loadState === 'loading' ? 'text-amber-500' : 'text-red-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              loadState === 'loaded' ? 'bg-emerald-500' :
              loadState === 'loading' ? 'bg-amber-500 animate-ping' : 'bg-red-500'
            }`} />
            {loadState === 'loaded' ? 'Loaded ✓' : loadState === 'loading' ? 'Loading...' : 'Error'}
          </span>
        </div>
      </div>
    </div>
  );
}
