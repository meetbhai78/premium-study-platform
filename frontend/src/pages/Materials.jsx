import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL, SERVER_URL } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';
import PdfViewer from '../components/PdfViewer';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Search, Filter, Play, Download, Lock, FileText, FolderArchive, Film, ExternalLink, Sparkles, X, Star, Eye, BookOpen, Languages, Percent, FlaskConical, Binary, Atom, Brain, GraduationCap, Lightbulb, Calculator, Globe, FolderOpen, Share2, Award } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function Materials() {
  const { isPremium, isAdmin, triggerInterstitialAd, triggerRewardedAd } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState('');
  const [activeVideo, setActiveVideo] = useState(null); // Holds item details when modal is visible
  const [activePdf, setActivePdf] = useState(null);
  const [isPdfFullScreen, setIsPdfFullScreen] = useState(false);
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem('bookmarks') || '[]'));
  const [activeTab, setActiveTab] = useState('free'); // 'free' or 'premium'

  const categoryConfigs = {
    'Gujarati Grammer': { icon: BookOpen, color: 'from-orange-500 to-rose-600' },
    'English Grammer': { icon: Languages, color: 'from-blue-500 to-indigo-600' },
    'Std 9 Maths': { icon: Percent, color: 'from-emerald-500 to-teal-600' },
    'Std 9 Science': { icon: FlaskConical, color: 'from-purple-500 to-pink-600' },
    'Std 9 SS': { icon: Globe, color: 'from-orange-400 to-amber-600' },
    'Std 9 English': { icon: Languages, color: 'from-pink-400 to-rose-500' },
    'Std 10 Maths': { icon: Binary, color: 'from-cyan-500 to-blue-600' },
    'Std 10 Science': { icon: Atom, color: 'from-rose-500 to-red-600' },
    'Std 10 SS': { icon: Globe, color: 'from-amber-500 to-rose-500' },
    'Std 10 English': { icon: Languages, color: 'from-violet-400 to-pink-500' },
    'Manovigyan': { icon: Brain, color: 'from-violet-500 to-purple-600' },
    'Pedagogy': { icon: GraduationCap, color: 'from-fuchsia-500 to-pink-600' },
    'Reasoning': { icon: Lightbulb, color: 'from-amber-500 to-orange-600' },
    'Maths': { icon: Calculator, color: 'from-teal-500 to-emerald-600' },
    'GK': { icon: Globe, color: 'from-sky-500 to-blue-600' },
    'TAT': { icon: Sparkles, color: 'from-fuchsia-500 to-indigo-650' },
    'TET': { icon: Award, color: 'from-rose-500 to-pink-600' },
    'Std 6 to 8': { icon: GraduationCap, color: 'from-emerald-500 to-sky-650' },
    'Std 6 to 8 SS': { icon: Globe, color: 'from-emerald-400 to-cyan-600' },
    'Others': { icon: FolderOpen, color: 'from-slate-500 to-slate-600' },
    'Teachers Material (Maths Science)': { icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
    'Others (For Teachers)': { icon: FolderOpen, color: 'from-indigo-500 to-purple-650' }
  };
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

  const handleReadPdf = async (item) => {
    const isLocked = item.accessType === 'premium' && !isPremium && !isAdmin;
    if (isLocked) {
      navigate('/payment');
      return;
    }
    await triggerInterstitialAd();
    setActivePdf(item);
  };

  const categories = [
    'Gujarati Grammer',
    'English Grammer',
    'Std 9 Maths',
    'Std 9 Science',
    'Std 9 SS',
    'Std 9 English',
    'Std 10 Maths',
    'Std 10 Science',
    'Std 10 SS',
    'Std 10 English',
    'Manovigyan',
    'Pedagogy',
    'Reasoning',
    'Maths',
    'GK',
    'TAT',
    'TET',
    'Std 6 to 8',
    'Std 6 to 8 SS',
    'Others',
    'Teachers Material (Maths Science)',
    'Others (For Teachers)',
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

    // Trigger rewarded video ad for free users on Android native
    if (window.Capacitor && window.Capacitor.isNativePlatform() && !isPremium && !isAdmin) {
      const confirmed = window.confirm("તમારું મટીરીયલ ડાઉનલોડ કરવા માટે એક ટૂંકી એડ જુઓ");
      if (!confirmed) return;
      
      const success = await triggerRewardedAd();
      if (!success) {
        alert("ડાઉનલોડ કરવા માટે આખી વિડીયો એડ જોવી જરૂરી છે.");
        return;
      }
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

  const handleWatchVideo = async (item) => {
    const isLocked = item.accessType === 'premium' && !isPremium && !isAdmin;
    if (isLocked) {
      navigate('/payment');
      return;
    }
    await triggerInterstitialAd();
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

  const filteredMaterials = materials.filter((item) => {
    return item.accessType === activeTab;
  });

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

      {/* Search and File Type Filter Row */}
      <div className="glass rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within this subject..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100/80 transition-all"
          />
        </div>

        {/* Types Select */}
        <div className="relative w-full md:w-44 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FileText className="h-4 w-4" />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-8 text-xs sm:text-sm text-slate-700 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100/80 transition-all cursor-pointer"
          >
            <option value="">All File Types</option>
            <option value="pdf">PDFs</option>
            <option value="video">Videos</option>
            <option value="zip">ZIP Files</option>
          </select>
        </div>
      </div>

      {/* Tactile Subject Selector Badge Grid */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Select Subject (વિષય પસંદ કરો)</p>
          {category && (
            <button
              onClick={() => setCategory('')}
              className="text-[10px] text-premium-500 font-extrabold hover:underline"
            >
              Clear Subject Filter
            </button>
          )}
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          {categories.map((c) => {
            const config = categoryConfigs[c] || { icon: FileText, color: 'from-slate-400 to-slate-500' };
            const Icon = config.icon;
            const isSelected = category === c;

            return (
              <button
                key={c}
                onClick={() => setCategory(isSelected ? '' : c)}
                className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-black shrink-0 transition-all shadow-sm border ${
                  isSelected
                    ? `bg-gradient-to-tr ${config.color} text-white border-transparent shadow-md shadow-slate-900/10`
                    : 'bg-white text-slate-600 border-slate-200/60 hover:bg-slate-50 dark:bg-darkbg-200 dark:border-slate-800 dark:text-slate-350'
                }`}
              >
                <div className={`flex h-5 w-5 items-center justify-center rounded-lg ${isSelected ? 'bg-white/20' : 'text-slate-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free vs Paid Toggle Tab Bar */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/60 max-w-md mx-auto border border-slate-200/40 dark:border-slate-800/40 glass">
        <button
          onClick={() => setActiveTab('free')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all ${
            activeTab === 'free'
              ? 'bg-white text-slate-800 shadow-sm dark:bg-darkbg-200 dark:text-white border border-slate-200/45 dark:border-slate-800/45'
              : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="h-4 w-4 text-emerald-500 fill-emerald-500 animate-pulse" />
          Free Materials (મુક્ત)
        </button>
        <button
          onClick={() => setActiveTab('premium')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all ${
            activeTab === 'premium'
              ? 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-900 shadow-sm border border-amber-300'
              : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
          }`}
        >
          <Lock className="h-4 w-4 text-slate-900 fill-slate-900" />
          Paid / Premium (🔒)
        </button>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 bg-white dark:bg-transparent">
          <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 animate-pulse" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            No {activeTab === 'free' ? 'Free' : 'Premium'} Materials Found
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            There are no {activeTab === 'free' ? 'free resources' : 'premium locks'} matching your search in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((item) => {
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
                        Unlock ₹99
                      </Link>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
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

                        {/* Share button */}
                        <button
                          onClick={async () => {
                            try {
                              await navigator.share({ title: item.title, text: `EDUCATION07_: ${item.title} - ${item.category}`, url: window.location.origin });
                            } catch (e) {
                              const msg = encodeURIComponent(`📚 EDUCATION07_: ${item.title}\n${item.category}\n\n👉 ${window.location.origin}`);
                              window.open(`https://wa.me/?text=${msg}`, '_blank');
                            }
                          }}
                          className="flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition-all border border-emerald-200/50 dark:border-emerald-800/40"
                        >
                          <Share2 className="h-3 w-3" />
                          Share
                        </button>
                        
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

      {/* In-App PDF Reader — uses dedicated PdfViewer component */}
      {activePdf && (
        <PdfViewer
          activePdf={activePdf}
          isPdfFullScreen={isPdfFullScreen}
          isPremium={isPremium}
          isAdmin={isAdmin}
          serverUrl={SERVER_URL}
          onClose={() => { setActivePdf(null); setIsPdfFullScreen(false); }}
          onFullScreenToggle={() => setIsPdfFullScreen((f) => !f)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}

