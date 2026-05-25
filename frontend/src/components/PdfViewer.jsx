import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExternalLink, Download, X, FileText, RefreshCw, Maximize2, Minimize2, AlertTriangle, Loader } from 'lucide-react';

/**
 * PdfViewer — Definitive PDF viewer using Blob URL strategy
 *
 * HOW IT WORKS:
 *   1. Fetch the PDF file as a binary blob via JavaScript fetch()
 *      → fetch() ignores Content-Disposition:attachment headers (that's only for browser navigation)
 *   2. Create a browser-local blob: URL from the blob
 *   3. Load the blob: URL in an <iframe>
 *      → Blob URLs ALWAYS render inline in the browser — no download prompt, no blocking
 *   4. On close/unmount, revoke the blob URL to free memory
 *
 * WHY THIS WORKS:
 *   - Cloudinary raw PDFs have Content-Disposition:attachment — this only affects direct URL navigation
 *   - fetch() is unaffected by Content-Disposition
 *   - blob: URLs are served from browser memory — browser treats them as inline always
 *   - No Google gview, no third-party proxy, no flaky rate limits
 *   - Works 100% of the time as long as CORS is allowed (Cloudinary allows CORS by default)
 */

const normalizeUrl = (fileUrl, serverUrl) => {
  if (!fileUrl || fileUrl === '#locked') return null;
  let url = fileUrl;
  if (url.includes('fl_attachment:false')) {
    url = url.replace(/fl_attachment:false\/?/, '');
  }
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `${serverUrl}${url}`;
  return url;
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
  // 'fetching' | 'rendering' | 'loaded' | 'error'
  const [loadState, setLoadState] = useState('fetching');
  const [errorMsg, setErrorMsg] = useState('');
  const [blobUrl, setBlobUrl] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const blobUrlRef = useRef(null); // track for cleanup

  const pdfUrl = normalizeUrl(activePdf?.fileUrl, serverUrl);
  const proxyUrl = `${serverUrl}/api/materials/${activePdf?._id}/view`;

  // Step 1: Fetch PDF as blob, create blob: URL via secure backend proxy
  useEffect(() => {
    if (!proxyUrl || !activePdf?._id) return;

    let cancelled = false;
    setLoadState('fetching');
    setErrorMsg('');

    // Revoke previous blob URL to avoid memory leaks
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setBlobUrl(null);
    }

    const fetchPdf = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: { 
            'Accept': 'application/pdf,*/*',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        if (cancelled) return;

        // Ensure it's treated as a PDF regardless of what server says
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        blobUrlRef.current = url;

        setBlobUrl(url);
        setLoadState('rendering'); // iframe is now loading the blob
      } catch (err) {
        if (cancelled) return;
        console.error('[PdfViewer] Fetch failed:', err.message);
        setErrorMsg(err.message);
        setLoadState('error');
      }
    };

    fetchPdf();

    return () => {
      cancelled = true;
    };
  }, [proxyUrl, retryCount, activePdf?._id]);

  // Cleanup blob URL on unmount or PDF change
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setLoadState('loaded');
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

  const isLoading = loadState === 'fetching' || loadState === 'rendering';
  const isError = loadState === 'error';
  const isLoaded = loadState === 'loaded';

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
            {/* Retry button — only on error */}
            {isError && (
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
              href={pdfUrl}
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
          {/* Loading state — fetching from Cloudinary */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
              <div className="relative w-20 h-20 mb-5">
                <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center">
                  <FileText className="h-9 w-9 text-indigo-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
                  <Loader className="h-3.5 w-3.5 text-white animate-spin" />
                </div>
              </div>
              <div className="flex gap-1.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '160ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '320ms' }} />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {loadState === 'fetching' ? 'PDF ડાઉનલોડ થઈ રહ્યું છે...' : 'Document render...'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {loadState === 'fetching' ? 'Fetching from Cloudinary' : 'Rendering PDF in browser'}
              </p>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-base font-black text-slate-800 dark:text-white mb-1">
                  PDF Load Failed
                </h3>
                {errorMsg && (
                  <p className="text-[10px] font-mono text-slate-400 mb-3 bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-1.5">
                    {errorMsg}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  The PDF could not be loaded. Click <strong>"Open in Browser"</strong> to view it directly — it will open in a new tab.
                </p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href={pdfUrl}
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

          {/* Iframe — renders the blob: URL (always inline, no Content-Disposition issues) */}
          {blobUrl && (
            <iframe
              key={`pdf-blob-${activePdf._id}-r${retryCount}`}
              src={blobUrl}
              className={`w-full h-full border-none transition-opacity duration-300 ${
                isError ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              title={activePdf.title}
              onLoad={handleIframeLoad}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs sm:max-w-xl">
            {activePdf.description || 'No description available.'}
          </p>
          <span className={`flex items-center gap-1.5 text-[10px] font-bold flex-shrink-0 ${
            isLoaded ? 'text-emerald-500' : isLoading ? 'text-amber-500' : 'text-red-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isLoaded ? 'bg-emerald-500' : isLoading ? 'bg-amber-500 animate-ping' : 'bg-red-500'
            }`} />
            {isLoaded ? 'Loaded ✓' : isLoading ? (loadState === 'fetching' ? 'Fetching...' : 'Rendering...') : 'Error'}
          </span>
        </div>
      </div>
    </div>
  );
}
