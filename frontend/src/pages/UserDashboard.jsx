import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL, SERVER_URL } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import AdBanner from '../components/AdBanner';
import PdfViewer from '../components/PdfViewer';
import { NoticeSkeleton, TableRowSkeleton } from '../components/SkeletonLoader';
import { ShieldCheck, User, Star, Megaphone, Clock, Sparkles, BookOpen, ChevronRight, AlertTriangle, XCircle, FileText, Play, Pause, RotateCcw, Award, Trash2, Eye, X, Film, FolderArchive, Download, MessageCircle, Send, BarChart3, Calendar, CheckCircle2, HelpCircle, ExternalLink, Smartphone, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user, isPremium, isAdmin, refreshUser } = useAuth();
  const [notices, setNotices] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [stats, setStats] = useState({ totalMaterials: 0 });
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Gamification & Quiz additions
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [isPdfFullScreen, setIsPdfFullScreen] = useState(false);

  // Interactive Quiz gameplay state
  const [activePlayQuiz, setActivePlayQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResultSummary, setQuizResultSummary] = useState(null);

  // Advanced feature additions
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem('bookmarks') || '[]'));
  const [activePdf, setActivePdf] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [freeMaterialsCount, setFreeMaterialsCount] = useState(0);

  // Doubt System State
  const [myDoubts, setMyDoubts] = useState([]);
  const [loadingDoubts, setLoadingDoubts] = useState(true);
  const [showDoubtForm, setShowDoubtForm] = useState(false);
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtMaterial, setDoubtMaterial] = useState('');
  const [doubtCategory, setDoubtCategory] = useState('');
  const [submittingDoubt, setSubmittingDoubt] = useState(false);

  // Activity Report State
  const [activityReport, setActivityReport] = useState(null);
  const [activityList, setActivityList] = useState([]);
  const [activityPeriod, setActivityPeriod] = useState('today');
  const [loadingActivity, setLoadingActivity] = useState(true);

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

  const handleShareApp = async () => {
    const downloadLink = 'https://github.com/meetbhai78/premium-study-platform/releases/latest/download/app-debug.apk';
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'EDUCATION07_ - Premium Study Material App',
          text: 'EDUCATION07_ એપ ડાઉનલોડ કરો! ધોરણ 6 થી 10 અને સરકારી પરીક્ષાઓની શ્રેષ્ઠ તૈયારી. PDFs, Videos, Quizzes - બધું એક જ જગ્યાએ.',
          url: downloadLink,
        });
      } else {
        throw new Error('Web share not supported');
      }
    } catch (err) {
      const msg = encodeURIComponent(`EDUCATION07_ - Premium Study Material App 📚\n\nધોરણ 6 થી 10 અને સરકારી પરીક્ષાઓની શ્રેષ્ઠ તૈયારી.\nPDFs, Videos, Daily Quizzes - બધું Free!\n\nડાઉનલોડ લિંક 👉 ${downloadLink}`);
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
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

  // Quiz Play Controller Actions
  const startQuizPlay = (quiz) => {
    setActivePlayQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setUserAnswers([]);
    setQuizScore(0);
    setQuizCompleted(false);
    setQuizResultSummary(null);
  };

  const handleOptionSelect = (optionIdx) => {
    if (hasAnswered) return;
    setSelectedOption(optionIdx);
    setHasAnswered(true);

    const isCorrect = optionIdx === activePlayQuiz.questions[currentQuestionIndex].correctOptionIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    setUserAnswers(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = optionIdx;
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < activePlayQuiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      submitQuizResults();
    }
  };

  const submitQuizResults = async () => {
    setSubmittingQuiz(true);
    try {
      const res = await axios.post(`${API_URL}/quizzes/${activePlayQuiz._id}/submit`, {
        answers: userAnswers
      });
      if (res.data && res.data.success) {
        setQuizResultSummary(res.data.data);
        setQuizCompleted(true);
        refreshUser(); // Syncs active streaks/points
        
        // Refresh leaderboard with latest points
        const lbRes = await axios.get(`${API_URL}/quizzes/leaderboard`);
        if (lbRes.data && lbRes.data.success) {
          setLeaderboard(lbRes.data.data);
        }
      }
    } catch (err) {
      console.error('Quiz submission failed:', err.message);
    } finally {
      setSubmittingQuiz(false);
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

      // 3. Fetch active practice quizzes
      try {
        const quizRes = await axios.get(`${API_URL}/quizzes`);
        if (quizRes.data && quizRes.data.success) {
          setQuizzes(quizRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load quizzes:', err.message);
      } finally {
        setLoadingQuizzes(false);
      }

      // 4. Fetch ranking leaderboard
      try {
        const lbRes = await axios.get(`${API_URL}/quizzes/leaderboard`);
        if (lbRes.data && lbRes.data.success) {
          setLeaderboard(lbRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err.message);
      } finally {
        setLoadingLeaderboard(false);
      }
      // 5. Fetch my doubts
      try {
        const doubtRes = await axios.get(`${API_URL}/doubts/my`);
        if (doubtRes.data && doubtRes.data.success) {
          setMyDoubts(doubtRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load doubts:', err.message);
      } finally {
        setLoadingDoubts(false);
      }

      // 6. Fetch activity report
      try {
        const actRes = await axios.get(`${API_URL}/activity/report?period=today`);
        if (actRes.data && actRes.data.success) {
          setActivityReport(actRes.data.summary);
          setActivityList(actRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load activity:', err.message);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch activity when period changes
  useEffect(() => {
    const fetchActivity = async () => {
      setLoadingActivity(true);
      try {
        const actRes = await axios.get(`${API_URL}/activity/report?period=${activityPeriod}`);
        if (actRes.data && actRes.data.success) {
          setActivityReport(actRes.data.summary);
          setActivityList(actRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load activity:', err.message);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchActivity();
  }, [activityPeriod]);

  // Submit a new doubt
  const handleSubmitDoubt = async () => {
    if (!doubtQuestion.trim()) return;
    setSubmittingDoubt(true);
    try {
      const res = await axios.post(`${API_URL}/doubts`, {
        question: doubtQuestion,
        materialTitle: doubtMaterial || 'General Doubt',
        materialCategory: doubtCategory || '',
      });
      if (res.data && res.data.success) {
        setMyDoubts(prev => [res.data.data, ...prev]);
        setDoubtQuestion('');
        setDoubtMaterial('');
        setDoubtCategory('');
        setShowDoubtForm(false);
      }
    } catch (err) {
      console.error('Doubt submission failed:', err.message);
    } finally {
      setSubmittingDoubt(false);
    }
  };

  // Activity logger helper (call from frontend actions)
  const logActivity = async (actionType, title = '', category = '') => {
    try {
      await axios.post(`${API_URL}/activity/log`, { actionType, title, category });
    } catch (err) { /* silent */ }
  };

  const getStatusBanner = () => {
    const bannerImg = "/study_banner.png";

    if (isPremium) {
      return (
        <div className="rounded-3xl bg-gradient-to-tr from-premium-500 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-premium-500/10 border border-premium-400/25 overflow-hidden animate-scale-in relative">
          <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:16px_16px]" />
          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-6 p-6 sm:p-8 relative z-10">
            <div className="md:col-span-3 space-y-3.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-slate-900 shadow-md premium-glow animate-pulse">
                <Sparkles className="h-3.5 w-3.5 fill-slate-900" />
                EDUCATION07_ - PREMIUM USER
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight leading-tight">
                અભ્યાસ મટીરીયલ અને વિડીયો લેક્ચર્સ
              </h2>
              <p className="text-xs sm:text-sm text-indigo-105 font-medium leading-relaxed max-w-xl">
                તમારા ઉજ્જવળ ભવિષ્ય તરફ એક ડગલું. ધોરણ 9-10 અને સરકારી પરીક્ષાઓ માટેનું તમામ પ્રીમિયમ સાહિત્ય સફળતાપૂર્વક અનલોક કરેલ છે.
              </p>
              <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2.5">
                <Link
                  to="/materials"
                  className="rounded-2xl bg-white px-5 py-3 text-xs font-black text-premium-600 shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all"
                >
                  સ્ટડી મટીરીયલ જુઓ (Browse Study)
                </Link>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-center items-center">
              <div className="relative group max-w-[240px] md:max-w-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <img
                  src={bannerImg}
                  alt="Study Illustration"
                  className="relative rounded-2xl shadow-lg border border-white/10 max-h-40 md:max-h-48 object-cover transform hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (user?.paymentStatus === 'pending') {
      return (
        <div className="rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white shadow-xl border border-slate-700/50 overflow-hidden animate-scale-in relative">
          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-6 p-6 sm:p-8 relative z-10">
            <div className="md:col-span-3 space-y-3.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/35 px-3 py-1 text-[10px] font-black text-amber-400">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                ચકાસણી ચાલુ છે (VERIFICATION PENDING)
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                પેમેન્ટ વેરિફિકેશન પ્રક્રિયામાં છે
              </h2>
              <p className="text-xs text-slate-350 leading-relaxed max-w-xl">
                અમને તમારી ₹99 ટ્રાન્ઝેક્શન સ્ક્રીનશોટ રસીદ મળી છે. એડમિનિસ્ટ્રેટર હાલમાં તેની ચકાસણી કરી રહ્યા છે. આગામી 1-2 કલાકમાં પ્રીમિયમ સેવાઓ સક્રિય થઈ જશે.
              </p>
            </div>
            <div className="md:col-span-2 flex justify-center items-center">
              <img
                src={bannerImg}
                alt="Study Illustration"
                className="rounded-2xl shadow-lg border border-slate-700/30 max-h-36 object-cover opacity-60 filter grayscale"
              />
            </div>
          </div>
        </div>
      );
    }

    if (user?.paymentStatus === 'rejected') {
      return (
        <div className="rounded-3xl bg-gradient-to-tr from-rose-950 via-slate-900 to-slate-950 text-white shadow-xl border border-rose-800/30 overflow-hidden animate-scale-in relative">
          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-6 p-6 sm:p-8 relative z-10">
            <div className="md:col-span-3 space-y-3.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-[10px] font-black text-rose-400">
                <XCircle className="h-3.5 w-3.5 animate-pulse" />
                અસ્વીકાર થયેલ છે (CLAIM REJECTED)
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                પેમેન્ટ સ્ક્રીનશોટ અસ્વીકાર કરવામાં આવ્યો છે
              </h2>
              <p className="text-xs text-rose-200/85 leading-relaxed max-w-xl">
                તમારી અગાઉની રસીદ એડમિન દ્વારા અસ્વીકાર કરવામાં આવી છે. કૃપા કરીને ખાતરી કરો કે તમે UTR નંબર ધરાવતો સાચો સ્ક્રીનશોટ અપલોડ કર્યો છે.
              </p>
              <div className="pt-2">
                <Link
                  to="/payment"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-500 hover:bg-rose-600 px-5 py-3 text-xs font-black text-white shadow-md hover:-translate-y-0.5 transition-all"
                >
                  નવો સ્ક્રીનશોટ અપલોડ કરો
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-center items-center">
              <img
                src={bannerImg}
                alt="Study Illustration"
                className="rounded-2xl shadow-lg border border-rose-800/20 max-h-36 object-cover opacity-50 filter saturate-50"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-3xl bg-gradient-to-tr from-premium-500 via-indigo-600 to-indigo-700 text-white shadow-xl border border-premium-400/25 overflow-hidden animate-scale-in relative">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:16px_16px]" />
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-6 p-6 sm:p-8 relative z-10">
          <div className="md:col-span-3 space-y-3.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/50 border border-indigo-400/40 px-3 py-1 text-[10px] font-black text-white">
              EDUCATION07_ - PREMIUM LEARNING
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              ધોરણ 9-10 અને સરકારી પરીક્ષાની શ્રેષ્ઠ તૈયારી
            </h2>
            <p className="text-xs sm:text-sm text-indigo-105 leading-relaxed max-w-xl">
              નમસ્તે, તમારા ઉજ્જવળ ભવિષ્ય અને શ્રેષ્ઠ તૈયારી માટે આજે જ જોડાવ. માત્ર ₹99 ચૂકવીને આજીવન તમામ મટીરીયલ્સ ડાઉનલોડ કરો.
            </p>
            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2.5">
              <Link
                to="/payment"
                className="rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black text-slate-900 shadow-md hover:bg-amber-305 hover:-translate-y-0.5 transition-all premium-glow animate-pulse"
              >
                પ્રીમિયમ સભ્ય બનો (₹99 માત્ર)
              </Link>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-center items-center">
            <div className="relative group max-w-[240px] md:max-w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
              <img
                src={bannerImg}
                alt="Study Illustration"
                className="relative rounded-2xl shadow-lg border border-white/10 max-h-40 md:max-h-48 object-cover transform hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
          </div>
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
        {/* Study badge overlay & Share App Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShareApp}
            className="flex items-center gap-1.5 rounded-2xl bg-premium-100 hover:bg-premium-200 dark:bg-premium-900/40 dark:hover:bg-premium-900/60 px-3 py-2.5 text-[10px] font-black text-premium-600 dark:text-premium-300 transition-all shadow-sm ring-1 ring-premium-500/10 focus:outline-none"
            title="Share App with Friends"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share App
          </button>
          
          <div className="flex gap-2 rounded-2xl bg-white dark:bg-darkbg-200 border border-slate-200/50 dark:border-slate-800/40 p-2 text-[10px] font-bold text-slate-500 shadow-sm glass">
            <div className="px-2.5 py-1 bg-slate-50 dark:bg-darkbg-100 rounded-xl">
              Syllabus: <span className="text-premium-500 font-extrabold">{stats.totalMaterials} Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 Download Android APK Callout for Web Users */}
      {!(window.Capacitor && window.Capacitor.isNativePlatform()) && (
        <div className="rounded-3xl p-4 sm:p-5 border border-indigo-200/40 bg-gradient-to-r from-indigo-50/50 via-premium-50/20 to-indigo-50/50 dark:from-indigo-950/15 dark:via-premium-950/5 dark:to-indigo-950/15 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 glass animate-scale-in">
          <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-premium-500 to-indigo-650 text-white shadow-lg shadow-premium-500/20 shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                EDUCATION07_ એન્ડ્રોઇડ એપ્લિકેશન ડાઉનલોડ કરો!
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xl">
                અભ્યાસ મટીરીયલ્સ, વિડીયોઝ અને ડેઇલી ક્વિઝની શ્રેષ્ઠ સગવડ માટે અમારી સત્તાવાર એન્ડ્રોઇડ એપ ડાઉનલોડ કરો અને જાહેરાત મુક્ત ભણતરનો આનંદ માણો.
              </p>
            </div>
          </div>
          <a
            href="https://github.com/meetbhai78/premium-study-platform/releases/latest/download/app-debug.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-gradient-to-tr from-premium-500 to-indigo-650 px-5 py-3 text-xs font-black text-white shadow-md shadow-premium-500/20 hover:scale-[1.03] active:scale-95 transition-all shrink-0 text-center w-full sm:w-auto"
          >
            Download APK File
          </a>
        </div>
      )}

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

      {/* Quick Resume / Last Saved Material */}
      {bookmarks.length > 0 ? (
        <div
          onClick={() => triggerBookmarkView(bookmarks[bookmarks.length - 1])}
          className="glass rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between animate-scale-in cursor-pointer hover:shadow-md hover:border-emerald-400/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 shadow-md shadow-emerald-500/20 text-white group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 fill-white ml-0.5" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-450">
                છેલ્લું સેવ કરેલ (Last Saved)
              </span>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1 group-hover:text-emerald-600 transition-colors">
                {bookmarks[bookmarks.length - 1].title}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {bookmarks[bookmarks.length - 1].category} • {bookmarks[bookmarks.length - 1].type?.toUpperCase()}
              </p>
            </div>
          </div>
          <Link
            to="/materials"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-all border border-slate-250 dark:border-slate-700 shadow-sm"
          >
            Browse All Materials
          </Link>
        </div>
      ) : (
        <Link
          to="/materials"
          className="glass rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between animate-scale-in hover:shadow-md hover:border-premium-400/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-premium-500 shadow-md shadow-premium-500/20 text-white group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-block rounded-md bg-premium-100 dark:bg-premium-950/40 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-premium-600 dark:text-premium-400">
                અભ્યાસ શરૂ કરો (Start Studying)
              </span>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1 group-hover:text-premium-500 transition-colors">
                Study Library માં જાઓ — PDFs, Videos & Quizzes
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Tap to explore free and premium study materials
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-premium-500 px-4 py-2 text-[11px] font-bold text-white shadow-md shadow-premium-500/20">
            Explore Library →
          </div>
        </Link>
      )}

      {/* Analytics KPI metrics & Download App Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Clickable Card for Direct App Download */}
        <a
          href="https://github.com/meetbhai78/premium-study-platform/releases/latest/download/app-debug.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="glass premium-card flex items-center justify-between rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md hover:border-premium-400/30 transition-all group cursor-pointer"
        >
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Mobile Application
            </p>
            <h3 className="mt-2 text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-105 group-hover:text-premium-500 transition-colors font-sans tracking-tight">
              Download App
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
              Direct download from GitHub
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-tr from-indigo-500 to-premium-600 shadow-indigo-500/10 group-hover:scale-110 transition-transform">
            <Smartphone className="h-5 w-5" />
          </div>
        </a>
      </div>

      {/* Advertisements for free members */}
      <AdBanner position="top" />

      {/* Core double column details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Announcements & Saved Library */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Quiz Challenge Portal */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-6 shadow-sm bg-gradient-to-br from-indigo-500/5 to-amber-500/5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Daily MCQ Challenge (દૈનિક ક્વિઝ)</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">ટેસ્ટ રમો, પોઈન્ટ્સ કમાઓ અને રેન્ક લાવો</p>
                </div>
              </div>
              
              {/* User streak and points badge */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl bg-orange-500/10 px-2.5 py-1 text-[10px] font-black text-orange-500 border border-orange-500/20 animate-pulse">
                  🔥 {user?.streak || 0} Days Streak
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black text-premium-500 border border-indigo-500/20">
                  🪙 {user?.totalPoints || 0} Pts
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loadingQuizzes ? (
                <div className="text-center py-6 text-slate-400 text-xs pl-1">
                  Loading daily quizzes...
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs pl-1">
                  આજની કોઈ ક્વિઝ સક્રિય નથી.
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-slate-150 dark:border-slate-800/40 rounded-2xl bg-white/50 dark:bg-darkbg-200/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div>
                      <span className="inline-block rounded-md bg-premium-100 dark:bg-premium-900/40 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-premium-600 dark:text-premium-300">
                        {quiz.subject}
                      </span>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-1">
                        {quiz.title}
                      </h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                        મહત્તમ ગુણ: {quiz.questions.length * 10} | પોઈન્ટ્સ બોનસ: +{quiz.pointsForCompletion}
                      </p>
                    </div>
                    <button
                      onClick={() => startQuizPlay(quiz)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1 rounded-xl bg-premium-500 hover:bg-premium-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-premium-500/20 transition-all hover:-translate-y-0.5"
                    >
                      ટેસ્ટ શરૂ કરો (Start)
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

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
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerBookmarkView(b);
                        }}
                        className="rounded-lg p-1.5 text-slate-450 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors focus:outline-none"
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

          {/* Gujarat State-wide Leaderboard */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4 shadow-sm bg-gradient-to-tr from-yellow-500/5 via-transparent to-indigo-500/5 relative overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">State Leaderboard (ગુજરાત રેન્કિંગ)</h3>
                  <p className="text-[10px] text-slate-400">ટોપ પર્ફોર્મન્સ દર્શાવતા વિદ્યાર્થીઓ</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              {loadingLeaderboard ? (
                <div className="text-center py-6 text-slate-400 text-xs pl-1">
                  Loading leaderboard...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs pl-1">
                  No rank data recorded yet.
                </div>
              ) : (
                leaderboard.slice(0, 5).map((item, index) => {
                  const isCurrentUser = item.email === user?.email;
                  const rankBadge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                  return (
                    <div
                      key={item._id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${isCurrentUser ? 'bg-premium-500/10 border-premium-400 shadow-sm' : 'border-slate-100 dark:border-slate-800/60 bg-white/20 dark:bg-darkbg-200/20'}`}
                    >
                      <div className="flex items-center gap-2.5 truncate w-2/3">
                        <span className="font-black text-xs text-slate-400 w-6 text-center">{rankBadge}</span>
                        <div className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full text-white font-extrabold text-xs bg-gradient-to-tr ${index === 0 ? 'from-amber-400 to-orange-500' : index === 1 ? 'from-slate-300 to-slate-450' : index === 2 ? 'from-amber-600 to-amber-800' : 'from-slate-400 to-indigo-500'}`}>
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="truncate">
                          <h4 className={`font-black text-xs truncate ${isCurrentUser ? 'text-premium-600 dark:text-premium-450' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.name} {isCurrentUser && '(You)'}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">🔥 {item.streak || 0} Day Streak</span>
                        </div>
                      </div>
                      <span className={`font-black text-xs ${index === 0 ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.totalPoints || 0} Pts
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Study Motivation & Challenge Widget */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4 shadow-sm bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-premium-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-premium-100 dark:bg-premium-900/40 text-premium-600 dark:text-premium-300">
                <Sparkles className="h-4.5 w-4.5 text-premium-500 fill-premium-500" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Daily Study Focus</h3>
            </div>

            <div className="space-y-4 pl-1 text-xs">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/50">
                <p className="italic text-slate-650 dark:text-slate-350 leading-relaxed">
                  "ધ્યેય પ્રાપ્ત કરવા માટે સતત મહેનત અને ધીરજ એ જ સાચી ચાવી છે. આજનો દિવસ તમારી તૈયારીને વધુ મજબૂત બનાવવાનો છે!"
                </p>
                <p className="text-[10px] text-premium-500 font-bold mt-2 text-right">— EDUCATION07_ Guide</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Today's Study Goal</p>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-150 dark:border-slate-800/60 p-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Read 1 free Gujarati/English Grammar PDF</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-150 dark:border-slate-800/60 p-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Complete 1 Pomodoro session (25 mins)</span>
                </div>
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

      {/* ============ DOUBT Q&A SYSTEM ============ */}
      <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-5 shadow-sm bg-gradient-to-br from-violet-500/5 to-indigo-500/5 animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
              <MessageCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Doubt Q&A (શંકા-સમાધાન)</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">તમારો પ્રશ્ન પૂછો, Admin જવાબ આપશે</p>
            </div>
          </div>
          <button
            onClick={() => setShowDoubtForm(!showDoubtForm)}
            className="flex items-center gap-1 rounded-xl bg-violet-500 hover:bg-violet-600 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:-translate-y-0.5"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {showDoubtForm ? 'Cancel' : 'Ask Doubt'}
          </button>
        </div>

        {/* Doubt Form */}
        {showDoubtForm && (
          <div className="rounded-2xl border border-violet-200/50 dark:border-violet-900/30 bg-white/50 dark:bg-darkbg-200/50 p-4 space-y-3 animate-scale-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={doubtMaterial}
                onChange={(e) => setDoubtMaterial(e.target.value)}
                placeholder="Material / Topic name (Optional)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all"
              />
              <input
                type="text"
                value={doubtCategory}
                onChange={(e) => setDoubtCategory(e.target.value)}
                placeholder="Category (e.g. Gujarati Grammer)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all"
              />
            </div>
            <textarea
              value={doubtQuestion}
              onChange={(e) => setDoubtQuestion(e.target.value)}
              placeholder="તમારો doubt / પ્રશ્ન અહીં લખો... (Write your question here)"
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{doubtQuestion.length}/1000</span>
              <button
                onClick={handleSubmitDoubt}
                disabled={submittingDoubt || !doubtQuestion.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-violet-500 hover:bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 disabled:opacity-50 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                {submittingDoubt ? 'Sending...' : 'Submit Doubt'}
              </button>
            </div>
          </div>
        )}

        {/* Doubts List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {loadingDoubts ? (
            <div className="text-center py-6 text-slate-400 text-xs">Loading doubts...</div>
          ) : myDoubts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              તમે હજુ કોઈ doubt પૂછ્યો નથી. ઉપર "Ask Doubt" button press કરો!
            </div>
          ) : (
            myDoubts.map((d) => (
              <div
                key={d._id}
                className={`rounded-2xl border p-4 transition-all ${
                  d.status === 'solved'
                    ? 'border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10'
                    : 'border-amber-200/50 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                        d.status === 'solved'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                      }`}>
                        {d.status === 'solved' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {d.status === 'solved' ? 'Solved' : 'Pending'}
                      </span>
                      {d.materialTitle && d.materialTitle !== 'General Doubt' && (
                        <span className="text-[9px] text-slate-400 font-bold">{d.materialTitle}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{d.question}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {new Date(d.createdAt).toLocaleDateString('gu-IN')} • {new Date(d.createdAt).toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Admin Reply */}
                {d.status === 'solved' && d.adminReply && (
                  <div className="mt-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/30 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[8px] font-black">A</div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Admin Reply</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{d.adminReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============ STUDENT ACTIVITY REPORT ============ */}
      <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-5 shadow-sm bg-gradient-to-br from-cyan-500/5 to-blue-500/5 animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Activity Report (પ્રગતિ રિપોર્ટ)</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">તમારી study activity track કરો</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/50 dark:border-slate-700/50">
            {['today', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setActivityPeriod(p)}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                  activityPeriod === p
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        {loadingActivity ? (
          <div className="text-center py-6 text-slate-400 text-xs">Loading report...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-darkbg-200/50 p-3 text-center space-y-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 mx-auto">
                  <FileText className="h-4 w-4" />
                </div>
                <p className="text-lg font-black text-slate-800 dark:text-white">{activityReport?.pdfViews || 0}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">PDFs Read</p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-darkbg-200/50 p-3 text-center space-y-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-500 mx-auto">
                  <Play className="h-4 w-4" />
                </div>
                <p className="text-lg font-black text-slate-800 dark:text-white">{activityReport?.videoWatches || 0}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Videos</p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-darkbg-200/50 p-3 text-center space-y-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-500 mx-auto">
                  <Award className="h-4 w-4" />
                </div>
                <p className="text-lg font-black text-slate-800 dark:text-white">{activityReport?.quizAttempts || 0}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quizzes</p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-darkbg-200/50 p-3 text-center space-y-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 mx-auto">
                  <Download className="h-4 w-4" />
                </div>
                <p className="text-lg font-black text-slate-800 dark:text-white">{activityReport?.downloads || 0}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Downloads</p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-darkbg-200/50 p-3 text-center space-y-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-500 mx-auto">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <p className="text-lg font-black text-slate-800 dark:text-white">{activityReport?.doubtsAsked || 0}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Doubts</p>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activityList.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  {activityPeriod === 'today' ? 'આજે' : activityPeriod === 'week' ? 'આ અઠવાડિયે' : 'આ મહિને'} કોઈ activity record નથી.
                </div>
              ) : (
                activityList.slice(0, 20).map((act, idx) => {
                  const icons = {
                    pdf_view: { icon: FileText, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30', label: 'PDF Viewed' },
                    video_watch: { icon: Play, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30', label: 'Video Watched' },
                    quiz_attempt: { icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30', label: 'Quiz Played' },
                    material_download: { icon: Download, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30', label: 'Downloaded' },
                    doubt_asked: { icon: MessageCircle, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30', label: 'Doubt Asked' },
                    login: { icon: User, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/30', label: 'Logged In' },
                  };
                  const config = icons[act.actionType] || icons.login;
                  const IconComp = config.icon;
                  return (
                    <div key={act._id || idx} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          {config.label}{act.title ? `: ${act.title}` : ''}
                        </p>
                        <span className="text-[9px] text-slate-400">
                          {new Date(act.createdAt).toLocaleDateString('gu-IN')} {new Date(act.createdAt).toLocaleTimeString('gu-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

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



      {/* Interactive Quiz Play Modal */}
      {activePlayQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-scale-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-darkbg-200 shadow-2xl overflow-hidden glass flex flex-col justify-between animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-850 dark:text-white truncate max-w-xs">
                  {activePlayQuiz.title}
                </h3>
                <span className="inline-block rounded-md bg-premium-100 dark:bg-premium-900/40 px-2 py-0.5 text-[9px] font-bold text-premium-600 dark:text-premium-300 mt-0.5 animate-pulse">
                  દૈનિક ક્વિઝ પ્રેક્ટિસ (Daily Challenge)
                </span>
              </div>
              {!quizCompleted && !submittingQuiz && (
                <button
                  onClick={() => setActivePlayQuiz(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-750 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Modal Body / Quiz play screen */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
              {!quizCompleted ? (
                <>
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>પ્રશ્ન {currentQuestionIndex + 1} / {activePlayQuiz.questions.length}</span>
                      <span className="text-premium-500 font-extrabold">
                        {Math.round(((currentQuestionIndex) / activePlayQuiz.questions.length) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-premium-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-md shadow-premium-500/25"
                        style={{ width: `${((currentQuestionIndex) / activePlayQuiz.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-150 dark:border-slate-800/50">
                    <p className="font-extrabold text-slate-800 dark:text-slate-100 leading-relaxed text-sm sm:text-base">
                      Q{currentQuestionIndex + 1}: {activePlayQuiz.questions[currentQuestionIndex].questionText}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {activePlayQuiz.questions[currentQuestionIndex].options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrectAnswer = idx === activePlayQuiz.questions[currentQuestionIndex].correctOptionIndex;
                      
                      let optionStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 text-slate-700 dark:text-slate-300';
                      
                      if (hasAnswered) {
                        if (isCorrectAnswer) {
                          optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black shadow-md shadow-emerald-500/5 scale-[1.01]';
                        } else if (isSelected) {
                          optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black shadow-md shadow-rose-500/5 scale-[1.01]';
                        } else {
                          optionStyle = 'border-slate-200 dark:border-slate-800 opacity-60 text-slate-400';
                        }
                      } else if (isSelected) {
                        optionStyle = 'border-premium-500 bg-premium-500/5 text-premium-600 font-black';
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasAnswered}
                          onClick={() => handleOptionSelect(idx)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-between gap-3 focus:outline-none ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black uppercase ${isSelected ? 'bg-premium-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{option}</span>
                          </div>
                          {hasAnswered && isCorrectAnswer && (
                            <span className="text-emerald-500 text-sm font-bold">✓</span>
                          )}
                          {hasAnswered && isSelected && !isCorrectAnswer && (
                            <span className="text-rose-500 text-sm font-bold">✗</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Show Study Explanation Instantly */}
                  {hasAnswered && activePlayQuiz.questions[currentQuestionIndex].explanation && (
                    <div className="rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/15 border border-indigo-500/15 p-4 text-[11px] sm:text-xs text-slate-600 dark:text-slate-350 leading-relaxed animate-scale-in">
                      <span className="font-extrabold text-premium-500 block mb-1">📘 સમજૂતી (Study Explanation):</span>
                      {activePlayQuiz.questions[currentQuestionIndex].explanation}
                    </div>
                  )}

                  {/* Navigation Control */}
                  {hasAnswered && (
                    <button
                      onClick={handleNextQuestion}
                      disabled={submittingQuiz}
                      className="w-full flex items-center justify-center gap-1 rounded-2xl bg-premium-500 hover:bg-premium-600 py-3.5 text-xs font-black text-white shadow-lg shadow-premium-500/25 transition-all hover:scale-[1.01] focus:outline-none"
                    >
                      {currentQuestionIndex + 1 === activePlayQuiz.questions.length ? (submittingQuiz ? 'Grading answers...' : 'સબમિટ કરો (Submit Answers)') : 'આગળનો પ્રશ્ન (Next Question)'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                /* Quiz Complete Screen */
                <div className="text-center py-6 space-y-6 animate-scale-in">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border-4 border-amber-400 text-amber-500 text-3xl animate-bounce">
                    🎉
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-lg text-slate-800 dark:text-white">અભિનંદન! ટેસ્ટ પૂર્ણ થઈ ગઈ છે.</h4>
                    <p className="text-xs text-slate-400">EDUCATION07_ Daily MCQ Practice Result</p>
                  </div>

                  {/* Score breakdown metrics card */}
                  <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/60">
                    <div className="text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">સ્કોર (Score)</span>
                      <span className="font-black text-sm text-slate-700 dark:text-slate-200">
                        {quizResultSummary?.score} / {quizResultSummary?.totalQuestions}
                      </span>
                    </div>
                    <div className="text-center space-y-0.5 border-x border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">મેળવેલા પોઈન્ટ્સ</span>
                      <span className="font-black text-sm text-amber-500">
                        +{quizResultSummary?.pointsEarned} Pts
                      </span>
                    </div>
                    <div className="text-center space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Study Streak</span>
                      <span className="font-black text-sm text-orange-500">
                        🔥 {quizResultSummary?.streak} Days
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivePlayQuiz(null)}
                    className="w-full rounded-2xl bg-premium-500 hover:bg-premium-600 py-3.5 text-xs font-black text-white shadow-lg shadow-premium-500/25 transition-all hover:scale-[1.01] focus:outline-none"
                  >
                    ડેશબોર્ડ પર પાછા જાઓ (Done)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
