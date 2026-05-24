import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL, SERVER_URL } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import AdBanner from '../components/AdBanner';
import { NoticeSkeleton, TableRowSkeleton } from '../components/SkeletonLoader';
import { ShieldCheck, User, Star, Megaphone, Clock, Sparkles, BookOpen, ChevronRight, AlertTriangle, XCircle, FileText, Play, Pause, RotateCcw, Award, Trash2, Eye, X, Film, FolderArchive, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user, isPremium, isAdmin, refreshUser } = useAuth();
  const [notices, setNotices] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [stats, setStats] = useState({ totalMaterials: 0 });
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Advanced feature additions
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem('bookmarks') || '[]'));
  const [activePdf, setActivePdf] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [freeMaterialsCount, setFreeMaterialsCount] = useState(0);

  // Pomodoro Focus Timer State
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('study'); // 'study' or 'break'
  const [showTimerAlert, setShowTimerAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const totalDuration = timerMode === 'study' ? 1500 : 300;

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (timerMode === 'study') {
        setTimerMode('break');
        setTimeLeft(300);
        setAlertMessage('Great focus! Take a 5-minute break.');
        setShowTimerAlert(true);
      } else {
        setTimerMode('study');
        setTimeLeft(1500);
        setAlertMessage('Break is over! Time to start a new focus session.');
        setShowTimerAlert(true);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMode === 'study' ? 1500 : 300);
  };

  const removeBookmark = (id, e) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b._id !== id);
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  const triggerBookmarkView = (item) => {
    const isLocked = item.accessType === 'premium' && !isPremium && !isAdmin;
    if (isLocked) {
      window.location.href = '/payment';
      return;
    }
    if (item.type === 'video') {
      setActiveVideo(item);
    } else if (item.type === 'pdf') {
      setActivePdf(item);
    } else {
      window.location.href = '/materials';
    }
  };

  const handleDownload = async (item) => {
    try {
      await axios.post(`${API_URL}/materials/${item._id}/download`);
      const link = document.createElement('a');
      link.href = item.fileUrl.startsWith('http') ? item.fileUrl : `${SERVER_URL}${item.fileUrl}`;
      link.target = '_blank';
      link.download = item.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to trigger download:', err.message);
    }
  };

  useEffect(() => {
    refreshUser(); // Keep active profile status synced on load
    
    const fetchDashboardData = async () => {
      // 1. Fetch notices
      try {
        const noticeRes = await axios.get(`${API_URL}/notices`);
        if (noticeRes.data && noticeRes.data.success) {
          setNotices(noticeRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load notices:', err.message);
      } finally {
        setLoadingNotices(false);
      }

      // 2. Fetch latest materials
      try {
        const materialRes = await axios.get(`${API_URL}/materials`);
        if (materialRes.data && materialRes.data.success) {
          const allMat = materialRes.data.data;
          setStats({ totalMaterials: materialRes.data.count });
          setRecentMaterials(allMat.slice(0, 3));
          
          // Calculate free materials count
          const freeMat = allMat.filter(m => m.accessType === 'free').length;
          setFreeMaterialsCount(freeMat);
        }
      } catch (err) {
        console.error('Failed to load recent materials:', err.message);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBanner = () => {
    if (isPremium) {
      return (
        <div className="rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-6 text-white shadow-lg shadow-amber-500/15 border border-amber-400/20 premium-glow animate-scale-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-yellow-100 animate-pulse">
                Lifetime Premium
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight">You have Full Vault Access</h2>
              <p className="text-xs text-amber-50 font-medium">
                Ad-free streaming, direct PDF downloads, and complete category coverage unlocked.
              </p>
            </div>
            <div className="h-16 w-16 shrink-0 flex items-center justify-center rounded-2xl bg-white/20 text-white animate-bounce">
              <Sparkles className="h-10 w-10 fill-white text-yellow-200" />
            </div>
          </div>
        </div>
      );
    }

    if (user?.paymentStatus === 'pending') {
      return (
        <div className="rounded-3xl bg-gradient-to-tr from-amber-400/90 to-amber-500 p-6 text-white shadow-lg border border-amber-300/30 animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
              <Clock className="h-6 w-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-extrabold">Payment Verification Pending</h2>
              <p className="text-xs text-amber-50 leading-relaxed">
                We have received your ₹50 transaction screenshot receipt. An administrator is currently validating your payment. Your premium membership will activate automatically once approved (typically within 1-2 hours).
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (user?.paymentStatus === 'rejected') {
      return (
        <div className="rounded-3xl bg-gradient-to-tr from-rose-500 to-rose-600 p-6 text-white shadow-lg border border-rose-400/20 animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
              <XCircle className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="text-base sm:text-lg font-extrabold">Payment Claim Rejected</h2>
              <p className="text-xs text-rose-50 leading-relaxed">
                Your previous payment upload request was rejected by an administrator. Please check that you uploaded the correct UPI transfer receipt showing the Transaction Reference ID (UTR).
              </p>
              <div className="mt-2 pt-2 border-t border-white/10">
                <Link
                  to="/payment"
                  className="inline-flex items-center gap-1 text-xs font-black underline hover:text-white"
                >
                  Upload New Receipt screenshot
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-3xl bg-gradient-to-tr from-premium-500 to-indigo-600 p-6 text-white shadow-lg border border-premium-400/20 animate-scale-in relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-32 w-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-purple-100">
              Basic Membership
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Unlock All Syllabus Materials</h2>
            <p className="text-xs text-purple-50">
              Pay ₹50 once using UPI methods to download premium templates and disable advertisements.
            </p>
          </div>
          <Link
            to="/payment"
            className="flex items-center gap-1 rounded-2xl bg-white px-5 py-3 text-xs font-black text-premium-600 shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center shrink-0"
          >
            Unlock Now (₹50)
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Title */}
      <div className="border-b border-slate-100 dark:border-slate-800/60 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name}</span>!
          </h1>
          <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
            Monitor your premium state, check active alerts, or focus on studying
          </p>
        </div>
        {/* Study badge overlay */}
        <div className="flex gap-2 rounded-2xl bg-white dark:bg-darkbg-200 border border-slate-200/50 dark:border-slate-800/40 p-2 text-[10px] font-bold text-slate-500 shadow-sm glass">
          <div className="px-2.5 py-1 bg-slate-50 dark:bg-darkbg-100 rounded-xl">
            Syllabus: <span className="text-premium-500 font-extrabold">{stats.totalMaterials} Items</span>
          </div>
        </div>
      </div>

      {/* Conditionally displays payment status banner */}
      {getStatusBanner()}

      {/* Syllabus Progress Tracker widget */}
      <div className="rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-darkbg-200/20 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between glass animate-scale-in">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 shadow-md shadow-indigo-500/20 text-white animate-pulse">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
              Syllabus Coverage Progress
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isPremium ? 'All syllabus materials unlocked with Premium Access!' : 'Unlock premium to access locked subjects.'}
            </p>
          </div>
        </div>
        <div className="w-full md:w-80 space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>Syllabus Unlocked</span>
            <span className="text-premium-500 font-extrabold">
              {isPremium ? 100 : (stats.totalMaterials > 0 ? Math.round((freeMaterialsCount / stats.totalMaterials) * 100) : 0)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-premium-500 to-indigo-500 h-full rounded-full transition-all duration-1000 shadow-md shadow-premium-500/30"
              style={{ width: `${isPremium ? 100 : (stats.totalMaterials > 0 ? Math.round((freeMaterialsCount / stats.totalMaterials) * 100) : 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics KPI metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Study Vault Count"
          value={stats.totalMaterials}
          icon={BookOpen}
          colorClass="bg-gradient-to-tr from-premium-500 to-indigo-600 shadow-premium-500/10"
        />
        <StatCard
          title="Account Membership Status"
          value={isPremium ? 'Premium (Active)' : user?.paymentStatus === 'pending' ? 'Pending Review' : 'Free Account'}
          icon={isPremium ? Sparkles : User}
          colorClass={isPremium ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-500/10' : 'bg-gradient-to-tr from-slate-400 to-slate-500'}
        />
      </div>

      {/* Advertisements for free members */}
      <AdBanner position="top" />

      {/* Core double column details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Announcements & Saved Library */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Announcements */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-premium-100 dark:bg-premium-900/40 text-premium-600 dark:text-premium-300">
                <Megaphone className="h-4.5 w-4.5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Active Announcements</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Global alerts and targeted guides</p>
              </div>
            </div>

            <div className="space-y-4">
              {loadingNotices ? (
                <>
                  <NoticeSkeleton />
                  <NoticeSkeleton />
                </>
              ) : notices.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs pl-1">
                  No active announcements for your subscription tier.
                </div>
              ) : (
                notices.map((n) => (
                  <div
                    key={n._id}
                    className="rounded-2xl border border-slate-100 dark:border-slate-800/60 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bookmarks Library Frame ("My Study Library") */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 animate-pulse">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">My Bookmark Library</h3>
                <p className="text-[10px] text-slate-400">Saved study documents & streaming tutorials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookmarks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs sm:col-span-2 pl-1">
                  No materials saved yet. Star files in the library to see them here!
                </div>
              ) : (
                bookmarks.map((b) => (
                  <div
                    key={b._id}
                    onClick={() => triggerBookmarkView(b)}
                    className="flex items-center justify-between gap-3 text-xs p-3.5 border border-slate-150 dark:border-slate-800/60 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md glass hover:border-premium-400/30 group"
                  >
                    <div className="flex items-center gap-2.5 truncate w-5/6">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-darkbg-100 text-slate-500 group-hover:text-premium-500 transition-colors">
                        {b.type === 'video' ? <Film className="h-4 w-4" /> : b.type === 'zip' ? <FolderArchive className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div className="truncate">
                        <h4 className="font-extrabold text-slate-700 dark:text-slate-200 truncate group-hover:text-premium-500 transition-colors">{b.title}</h4>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{b.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => removeBookmark(b._id, e)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 transition-colors"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
                        title="View Frame"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timer, Profile, Recent uploads */}
        <div className="space-y-6">
          {/* Circular Pomodoro Focus Timer */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4 relative overflow-hidden neon-glow-border shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Focus Pomodoro</h3>
                <p className="text-[10px] text-slate-400">Stay centered while you study</p>
              </div>
            </div>

            {showTimerAlert && (
              <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-2.5 flex justify-between items-center text-[10px] text-orange-600 dark:text-orange-400 animate-scale-in">
                <span>{alertMessage}</span>
                <button onClick={() => setShowTimerAlert(false)} className="font-extrabold underline uppercase tracking-widest ml-2">Dismiss</button>
              </div>
            )}

            <div className="flex flex-col items-center justify-center py-3 space-y-4">
              {/* Circular SVG Timer */}
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-slate-100 dark:stroke-slate-800/60"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    className="stroke-orange-500 transition-all duration-1000 pomodoro-ring-circle"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (timeLeft / totalDuration) * 289}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10 space-y-0.5">
                  <p className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                    {(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    {timerMode === 'study' ? 'Focus' : 'Break'}
                  </p>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTimer}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md hover:scale-105 transition-all ${isRunning ? 'bg-amber-500 shadow-amber-500/20 animate-pulse' : 'bg-orange-500 shadow-orange-500/20'}`}
                >
                  {isRunning ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 shadow-sm transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* User Profile Details Block */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                <User className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Profile Details</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 pl-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Account Name</p>
                <p className="font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{user?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</p>
                <p className="font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{user?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mobile Number</p>
                <p className="font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{user?.mobile}</p>
              </div>
            </div>
          </div>

          {/* Quick Recent Uploads */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Recent Additions</h3>
              </div>
              <Link
                to="/materials"
                className="text-[10px] font-bold text-premium-600 dark:text-premium-400 hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {loadingRecent ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : recentMaterials.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 pl-1">No recent uploads available.</p>
              ) : (
                recentMaterials.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 truncate w-2/3">
                      <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-darkbg-100 text-slate-500">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-extrabold text-slate-700 dark:text-slate-300 truncate">{m.title}</h4>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{m.category}</span>
                      </div>
                    </div>
                    {m.accessType === 'premium' ? (
                      <span className="rounded-md bg-amber-400/10 dark:bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-500 uppercase">
                        Premium
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-500 uppercase">
                        Free
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Streaming Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-scale-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-darkbg-200 shadow-2xl overflow-hidden glass animate-scale-in">
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
