import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL, SERVER_URL } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Search, Filter, Play, Download, Lock, FileText, FolderArchive, Film, ExternalLink, Sparkles, X, Star, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Materials() {
  const { isPremium, isAdmin } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [activeVideo, setActiveVideo] = useState(null); // Holds item details when modal is visible
  const [activePdf, setActivePdf] = useState(null);
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem('bookmarks') || '[]'));
  const navigate = useNavigate();

  const toggleBookmark = (item) => {
    let updated;
    if (bookmarks.some((b) => b._id === item._id)) {
      updated = bookmarks.filter((b) => b._id !== item._id);
    } else {
      updated = [...bookmarks, item];
    }
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  const handleReadPdf = (item) => {
    const isLocked = item.accessType === 'premium' && !isPremium && !isAdmin;
    if (isLocked) {
      navigate('/payment');
      return;
    }
    setActivePdf(item);
  };

  const categories = [
    'Gujarati Grammer',
    'English Grammer',
    'Std 9 Maths',
    'Std 9 Science',
    'Std 10 Maths',
    'Std 10 Science',
    'Manovigyan',
    'Pedagogy',
    'Reasoning',
    'Maths',
    'GK',
    'Others',
  ];

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/materials?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (category) url += `category=${encodeURIComponent(category)}&`;
      if (type) url += `type=${type}&`;

      const res = await axios.get(url);
      if (res.data && res.data.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load study materials:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, category, type]);

  const handleDownload = async (item) => {
    // Check access first
    const isLocked = item.accessType === 'premium' && !isPremium && !isAdmin;
    if (isLocked) {
      navigate('/payment');
      return;
    }

    try {
      // Increment download counter
      await axios.post(`${API_URL}/materials/${item._id}/download`);
      
      // Update local state download count visually
      setMaterials((prev) =>
        prev.map((m) => (m._id === item._id ? { ...m, downloadCount: m.downloadCount + 1 } : m))
      );

      // Trigger standard browser download
      const link = document.createElement('a');
      link.href = item.fileUrl.startsWith('http') ? item.fileUrl : `${SERVER_URL}${item.fileUrl}`;
      link.target = '_blank';
      link.download = item.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to register download action:', err.message);
    }
  };

  const handleWatchVideo = (item) => {
    const isLocked = item.accessType === 'premium' && !isPremium && !isAdmin;
    if (isLocked) {
      navigate('/payment');
      return;
    }
    setActiveVideo(item);
  };

  const getFileIcon = (itemType) => {
    switch (itemType) {
      case 'video':
        return <Film className="h-4 w-4" />;
      case 'zip':
        return <FolderArchive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
            Study Material Library
          </h1>
          <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
            Search, filter, download, or watch premium study materials
          </p>
        </div>
        
        {/* Statistics Badge */}
        <div className="flex gap-2.5 rounded-2xl bg-white border border-slate-200/50 p-2 text-xs font-bold text-slate-600 dark:border-slate-800/40 dark:bg-darkbg-200 glass">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-darkbg-100/50">
            Total Materials: <span className="text-premium-500">{materials.length}</span>
          </div>
        </div>
      </div>

      {/* Conditionally displays advertisements for free members */}
      <AdBanner position="top" />

      {/* Search and Filters Drawer */}
      <div className="glass rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material titles..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100/80 transition-all"
          />
        </div>

        {/* Categories Select */}
        <div className="relative w-full md:w-48 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-8 text-xs sm:text-sm text-slate-700 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100/80 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Types Select */}
        <div className="relative w-full md:w-44 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FileText className="h-4 w-4" />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-8 text-xs sm:text-sm text-slate-700 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100/80 transition-all cursor-pointer"
          >
            <option value="">All File Types</option>
            <option value="pdf">PDFs</option>
            <option value="video">Videos</option>
            <option value="zip">ZIP Files</option>
          </select>
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 bg-white dark:bg-transparent">
          <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Materials Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Try adjusting your search filters or check back later for recent uploads.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((item) => {
            const isLocked = item.accessType === 'premium' && !isPremium && !isAdmin;

            return (
              <div
                key={item._id}
                className="relative rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between dark:bg-darkbg-200/20 premium-card"
              >
                {/* Upper thumbnail container */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-darkbg-100 flex items-center justify-center border border-slate-100 dark:border-slate-800/40">
                  {item.thumbnailUrl && item.thumbnailUrl !== '' ? (
                    <img
                      src={item.thumbnailUrl.startsWith('http') || item.thumbnailUrl.startsWith('/uploads') || item.thumbnailUrl.startsWith('/assets') ? (item.thumbnailUrl.startsWith('http') ? item.thumbnailUrl : `${SERVER_URL}${item.thumbnailUrl}`) : `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop`}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="text-slate-300 dark:text-slate-700 flex flex-col items-center gap-2">
                      {getFileIcon(item.type)}
                      <span className="text-[10px] uppercase font-bold">{item.type}</span>
                    </div>
                  )}

                  {/* Bookmark star overlay */}
                  <button
                    onClick={() => toggleBookmark(item)}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/95 dark:bg-slate-900/95 flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800/80 text-slate-400 hover:text-amber-500 transition-all z-10"
                  >
                    <Star className={`h-4 w-4 ${bookmarks.some((b) => b._id === item._id) ? 'fill-amber-400 text-amber-400' : 'text-slate-400 hover:text-amber-500'}`} />
                  </button>

                  {/* Access type badge (Premium Lock) */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="rounded-lg bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800">
                      {item.category}
                    </span>
                    {item.accessType === 'premium' ? (
                      <span className="rounded-lg bg-amber-400 px-2 py-1 text-[10px] font-extrabold text-slate-900 flex items-center gap-1 shadow-sm premium-glow">
                        <Lock className="h-3 w-3 fill-slate-900" />
                        Premium
                      </span>
                    ) : (
                      <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
                        Free
                      </span>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="mt-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/40">
                    <span className="text-[10px] font-bold text-slate-400">
                      Downloads: {item.downloadCount}
                    </span>

                    {isLocked ? (
                      <Link
                        to="/payment"
                        className="flex items-center gap-1 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-amber-500 transition-all shadow-md shadow-amber-400/20"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Unlock ₹50
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        {/* Always show "View/Read" if it is PDF or Video */}
                        {(item.type === 'pdf' || item.type === 'video') && (
                          <button
                            onClick={() => item.type === 'video' ? handleWatchVideo(item) : handleReadPdf(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700"
                          >
                            {item.type === 'video' ? <Play className="h-3 w-3 fill-slate-700 dark:fill-slate-200" /> : <Eye className="h-3 w-3" />}
                            {item.type === 'video' ? 'Watch' : 'Read'}
                          </button>
                        )}
                        
                        {/* Show download ONLY if user is Premium or Admin */}
                        {(isPremium || isAdmin) ? (
                          <button
                            onClick={() => handleDownload(item)}
                            className="flex items-center gap-1 rounded-xl bg-premium-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-premium-600 transition-all shadow-md shadow-premium-500/20 animate-scale-in"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        ) : (
                          // If free user, and it's a zip or pdf, show premium lock badge on download capability
                          item.type === 'zip' && (
                            <Link
                              to="/payment"
                              className="flex items-center gap-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 px-3 py-1.5 text-[11px] font-bold text-amber-500 border border-amber-400/30 transition-all"
                            >
                              <Lock className="h-3 w-3" />
                              Premium
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Streaming Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-scale-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-darkbg-200 shadow-2xl overflow-hidden glass">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white truncate max-w-md">
                  {activeVideo.title}
                </h3>
                <span className="inline-block rounded-md bg-premium-100 dark:bg-premium-900/40 px-2 py-0.5 text-[9px] font-bold text-premium-600 dark:text-premium-300 mt-0.5">
                  {activeVideo.category} Study Tutorial
                </span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideo.fileUrl.startsWith('http') || activeVideo.fileUrl.startsWith('/uploads') ? (activeVideo.fileUrl.startsWith('http') ? activeVideo.fileUrl : `${SERVER_URL}${activeVideo.fileUrl}`) : activeVideo.fileUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                controlsList="nodownload" // Basic download prevention
              />
            </div>

            {/* Modal Footer Description */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-darkbg-100/50">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* In-App PDF Reader Modal */}
      {activePdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-scale-in">
          <div className="relative w-full h-[90vh] max-w-5xl rounded-3xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-darkbg-200 shadow-2xl overflow-hidden glass flex flex-col justify-between animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 animate-scale-in">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white truncate max-w-md">
                  {activePdf.title}
                </h3>
                <span className="inline-block rounded-md bg-premium-100 dark:bg-premium-900/40 px-2 py-0.5 text-[9px] font-bold text-premium-600 dark:text-premium-300 mt-0.5 animate-pulse">
                  Secure PDF Document Frame
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Download option inside modal ONLY for premium */}
                {(isPremium || isAdmin) && (
                  <button
                    onClick={() => handleDownload(activePdf)}
                    className="flex items-center gap-1.5 rounded-xl bg-premium-500 hover:bg-premium-600 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-md shadow-premium-500/25"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                )}
                <button
                  onClick={() => setActivePdf(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 bg-slate-100 dark:bg-darkbg-100 p-2 select-none relative" onContextMenu={(e) => e.preventDefault()}>
              <iframe
                src={activePdf.fileUrl.startsWith('http') || activePdf.fileUrl.startsWith('/uploads') ? (activePdf.fileUrl.startsWith('http') ? activePdf.fileUrl : `${SERVER_URL}${activePdf.fileUrl}`) : activePdf.fileUrl}
                className="w-full h-full border-none rounded-2xl shadow-inner bg-slate-50 dark:bg-slate-900"
                title={activePdf.title}
              />
            </div>

            {/* Modal Footer Description */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-darkbg-100/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <p className="text-slate-500 dark:text-slate-400 truncate max-w-xl">
                {activePdf.description || 'No document description.'}
              </p>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                In-App Viewer Fallback
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
