import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL, SERVER_URL } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { TableRowSkeleton } from '../components/SkeletonLoader';
import {
  Users, Sparkles, Shield, DollarSign, BookOpen, Megaphone, Trash2, Check, X, ShieldAlert,
  ShieldCheck, Upload, AlertCircle, FileText, Image as ImageIcon, Search, PlusCircle, ExternalLink, HelpCircle,
  MessageCircle, Send, CheckCircle2, Clock, Key, Eye, EyeOff
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
  // States
  const [stats, setStats] = useState({ totalUsers: 0, premiumUsers: 0, totalMaterials: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notices, setNotices] = useState([]);
  
  // Loaders
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search state
  const [userSearch, setUserSearch] = useState('');
  
  // Forms states
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', category: 'Gujarati Grammer', type: 'pdf', accessType: 'free' });
  const [materialFile, setMaterialFile] = useState(null);
  const [materialThumb, setMaterialThumb] = useState(null);
  
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', target: 'all' });
  const [rejectReason, setRejectReason] = useState('');
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Doubt Management State
  const [allDoubts, setAllDoubts] = useState([]);
  const [pendingDoubtCount, setPendingDoubtCount] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [activeReplyDoubtId, setActiveReplyDoubtId] = useState(null);
  const [doubtFilter, setDoubtFilter] = useState('all'); // 'all', 'pending', 'solved'

  // Quiz Management State
  const [quizzesList, setQuizzesList] = useState([]);
  const [quizForm, setQuizForm] = useState({ title: '', subject: 'Gujarati Grammer', pointsForCompletion: 50 });
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' }
  ]);

  const categories = [
    'Gujarati Grammer',
    'English Grammer',
    'Std 9 Maths',
    'Std 9 Science',
    'Std 9 SS',
    'Std 10 Maths',
    'Std 10 Science',
    'Std 10 SS',
    'Manovigyan',
    'Pedagogy',
    'Reasoning',
    'Maths',
    'GK',
    'TAT',
    'TET',
    'Std 6',
    'Std 7',
    'Std 8',
    'Others',
    'Teachers Material (Maths Science)',
    'Others (For Teachers)',
  ];

  const chartData = [
    { label: 'Guj Gram', pct: '20%', height: 75, fill: 'url(#purpleBar)' },
    { label: 'Eng Gram', pct: '15%', height: 60, fill: 'url(#indigoBar)' },
    { label: 'Std 9 M', pct: '8%', height: 35, fill: 'url(#pinkBar)' },
    { label: 'Std 9 S', pct: '10%', height: 42, fill: 'url(#amberBar)' },
    { label: 'Std 9 SS', pct: '10%', height: 42, fill: 'url(#amberBar)' },
    { label: 'Std 10 M', pct: '12%', height: 50, fill: 'url(#emeraldBar)' },
    { label: 'Std 10 S', pct: '14%', height: 58, fill: 'url(#cyanBar)' },
    { label: 'Std 10 SS', pct: '11%', height: 46, fill: 'url(#emeraldBar)' },
    { label: 'Psych', pct: '12%', height: 50, fill: 'url(#purpleBar)' },
    { label: 'Pedagogy', pct: '18%', height: 68, fill: 'url(#indigoBar)' },
    { label: 'Reason', pct: '22%', height: 80, fill: 'url(#pinkBar)' },
    { label: 'Maths', pct: '25%', height: 90, fill: 'url(#amberBar)' },
    { label: 'GK', pct: '30%', height: 105, fill: 'url(#emeraldBar)' },
    { label: 'TAT', pct: '14%', height: 58, fill: 'url(#purpleBar)' },
    { label: 'TET', pct: '16%', height: 64, fill: 'url(#indigoBar)' },
    { label: 'Std 6', pct: '10%', height: 42, fill: 'url(#cyanBar)' },
    { label: 'Std 7', pct: '8%', height: 35, fill: 'url(#cyanBar)' },
    { label: 'Std 8', pct: '12%', height: 48, fill: 'url(#cyanBar)' },
    { label: 'Others', pct: '8%', height: 35, fill: 'url(#pinkBar)' },
    { label: 'Teach Mat', pct: '15%', height: 60, fill: 'url(#purpleBar)' },
    { label: 'Oth Teach', pct: '12%', height: 50, fill: 'url(#indigoBar)' },
  ];

  // Clear notifications
  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 5000);
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`);
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users?search=${userSearch}`);
      if (res.data && res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Materials
  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API_URL}/materials`);
      if (res.data && res.data.success) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Pending Payments
  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_URL}/payments/admin/pending`);
      if (res.data && res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Notices
  const fetchNotices = async () => {
    try {
      const res = await axios.get(`${API_URL}/notices`);
      if (res.data && res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Master Initializer
  const loadTabData = async () => {
    setLoading(true);
    await fetchStats();
    if (activeTab === 'users') await fetchUsers();
    if (activeTab === 'materials') await fetchMaterials();
    if (activeTab === 'payments') await fetchPayments();
    if (activeTab === 'notices') await fetchNotices();
    if (activeTab === 'doubts') await fetchDoubts();
    if (activeTab === 'quizzes') await fetchQuizzes();
    setLoading(false);
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'users') {
      const delaySearch = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(delaySearch);
    }
  }, [userSearch]);

  // Handle User Moderations
  const handleToggleStatus = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${userId}/toggle-status`);
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message);
        fetchUsers();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Failed to update user status.');
      clearMessages();
    }
  };

  const handleTogglePremium = async (userId, currentPremium) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${userId}/premium`, { premium: !currentPremium });
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message);
        fetchUsers();
        fetchStats();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Failed to toggle premium access.');
      clearMessages();
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their payment logs?')) return;
    try {
      const res = await axios.delete(`${API_URL}/admin/users/${userId}`);
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message);
        fetchUsers();
        fetchStats();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Failed to delete user.');
      clearMessages();
    }
  };

  // Handle Material Upload
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!materialForm.title || !materialForm.description || !materialFile) {
      setErrorMsg('Please fill in text fields and upload the material file.');
      clearMessages();
      return;
    }

    const formData = new FormData();
    formData.append('title', materialForm.title);
    formData.append('description', materialForm.description);
    formData.append('category', materialForm.category);
    formData.append('type', materialForm.type);
    formData.append('accessType', materialForm.accessType);
    formData.append('file', materialFile);
    if (materialThumb) formData.append('thumbnail', materialThumb);

    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_URL}/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.success) {
        setSuccessMsg('Study resource uploaded successfully!');
        setMaterialForm({ title: '', description: '', category: 'Gujarati Grammer', type: 'pdf', accessType: 'free' });
        setMaterialFile(null);
        setMaterialThumb(null);
        // Reset file inputs visually
        document.getElementById('fileInput').value = '';
        const thumbInput = document.getElementById('thumbInput');
        if (thumbInput) thumbInput.value = '';
        fetchMaterials();
        fetchStats();
        clearMessages();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to upload resource.');
      clearMessages();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this study resource? This deletes the file from storage.')) return;
    try {
      const res = await axios.delete(`${API_URL}/materials/${id}`);
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message);
        fetchMaterials();
        fetchStats();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Deletion failed.');
      clearMessages();
    }
  };

  // Handle Payments Claims Verification
  const handleVerifyPayment = async (paymentId, status) => {
    if (status === 'rejected' && !rejectReason) {
      setActiveRejectId(paymentId);
      return;
    }

    setActionLoading(true);
    try {
      const res = await axios.put(`${API_URL}/payments/admin/${paymentId}/verify`, {
        status,
        rejectReason: status === 'rejected' ? rejectReason : '',
      });

      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message);
        setRejectReason('');
        setActiveRejectId(null);
        fetchPayments();
        fetchStats();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Failed to process payment claim verification.');
      clearMessages();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Notices announcements
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      setErrorMsg('Provide notice title and description.');
      clearMessages();
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/notices`, noticeForm);
      if (res.data && res.data.success) {
        setSuccessMsg('Announcement broadcasted successfully!');
        setNoticeForm({ title: '', content: '', target: 'all' });
        fetchNotices();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Broadcasting failed.');
      clearMessages();
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Delete this announcement notice?')) return;
    try {
      const res = await axios.delete(`${API_URL}/notices/${noticeId}`);
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message);
        fetchNotices();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Notice deletion failed.');
      clearMessages();
    }
  };

  // Fetch Doubts
  const fetchDoubts = async () => {
    try {
      const res = await axios.get(`${API_URL}/doubts/all`);
      if (res.data && res.data.success) {
        setAllDoubts(res.data.data);
        setPendingDoubtCount(res.data.pendingCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reply to doubt
  const handleDoubtReply = async (doubtId) => {
    if (!replyText.trim()) return;
    try {
      const res = await axios.put(`${API_URL}/doubts/${doubtId}/reply`, { adminReply: replyText });
      if (res.data && res.data.success) {
        setSuccessMsg('Doubt solved! Reply sent to student.');
        setReplyText('');
        setActiveReplyDoubtId(null);
        fetchDoubts();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Failed to send reply.');
      clearMessages();
    }
  };

  // Delete doubt
  const handleDeleteDoubt = async (doubtId) => {
    if (!window.confirm('Delete this doubt permanently?')) return;
    try {
      const res = await axios.delete(`${API_URL}/doubts/${doubtId}`);
      if (res.data && res.data.success) {
        setSuccessMsg('Doubt deleted.');
        fetchDoubts();
        clearMessages();
      }
    } catch (err) {
      setErrorMsg('Failed to delete doubt.');
      clearMessages();
    }
  };

  // Fetch Quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`${API_URL}/quizzes`);
      if (res.data && res.data.success) {
        setQuizzesList(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load quizzes.');
      clearMessages();
    }
  };

  // Manage Quiz Formulation
  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (quizQuestions.length <= 1) return;
    const updated = quizQuestions.filter((_, idx) => idx !== index);
    setQuizQuestions(updated);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[optIndex] = value;
    setQuizQuestions(updated);
  };

  // Create Quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!quizForm.title.trim()) {
      setErrorMsg('Please specify a quiz title.');
      clearMessages();
      return;
    }
    
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.questionText.trim()) {
        setErrorMsg(`Question ${i + 1} has empty question text.`);
        clearMessages();
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          setErrorMsg(`Question ${i + 1} option ${j + 1} is empty.`);
          clearMessages();
          return;
        }
      }
    }

    setActionLoading(true);
    try {
      const res = await axios.post(`${API_URL}/quizzes`, {
        title: quizForm.title,
        subject: quizForm.subject,
        pointsForCompletion: Number(quizForm.pointsForCompletion) || 50,
        questions: quizQuestions
      });

      if (res.data && res.data.success) {
        setSuccessMsg('Quiz created and published successfully!');
        setQuizForm({ title: '', subject: 'Gujarati Grammer', pointsForCompletion: 50 });
        setQuizQuestions([
          { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '' }
        ]);
        fetchQuizzes();
        fetchStats();
        clearMessages();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to create quiz.');
      clearMessages();
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All user attempts will also be deleted.')) return;
    try {
      const res = await axios.delete(`${API_URL}/quizzes/${id}`);
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || 'Quiz deleted successfully.');
        fetchQuizzes();
        fetchStats();
        clearMessages();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete quiz.');
      clearMessages();
    }
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="border-b border-slate-100 dark:border-slate-800/60 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
            Administrative Command Control
          </h1>
          <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
            Configure uploads, review receipts, broadcast announcements, and moderate users
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-premium-600 bg-premium-100 dark:bg-premium-900/40 dark:text-premium-300 px-3 py-1.5 rounded-xl">
          <Shield className="h-4 w-4" />
          SYSTEM ADMIN ACTIVE
        </div>
      </div>

      {/* Toast Notification Container (React Toastify UI Mockup) */}
      {(successMsg || errorMsg) && (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full animate-scale-in">
          {successMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-darkbg-200 border-l-4 border-emerald-500 p-4 shadow-2xl border border-slate-100 dark:border-slate-800 glass relative">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Success</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{successMsg}</p>
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none select-none">×</button>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-darkbg-200 border-l-4 border-rose-500 p-4 shadow-2xl border border-slate-100 dark:border-slate-800 glass relative">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/20 text-rose-600">
                <AlertCircle className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Alert</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{errorMsg}</p>
              </div>
              <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none select-none">×</button>
            </div>
          )}
        </div>
      )}

      {/* Tabs list anchors */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200/50 pb-2 dark:border-slate-800/60">
        {[
          { id: 'stats', label: 'KPI Analytics', icon: DollarSign },
          { id: 'users', label: 'Users Management', icon: Users },
          { id: 'materials', label: 'Materials Library', icon: BookOpen },
          { id: 'payments', label: 'Payment Approvals', icon: ShieldCheck, count: payments.length },
          { id: 'notices', label: 'Broadcast Bulletin', icon: Megaphone },
          { id: 'doubts', label: 'Student Doubts', icon: MessageCircle, count: pendingDoubtCount },
          { id: 'quizzes', label: 'Quiz Management', icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-premium-500 text-white shadow-md shadow-premium-500/20'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="rounded-full bg-rose-500 text-white text-[9px] px-1.5 py-0.5 animate-pulse ml-0.5">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TABS CONTAINER PANELS */}
      {/* 1. Analytics tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Platform Users" value={stats.totalUsers} icon={Users} colorClass="bg-gradient-to-tr from-blue-500 to-indigo-600" />
            <StatCard title="Premium Activations" value={stats.premiumUsers} icon={Sparkles} colorClass="bg-gradient-to-tr from-amber-500 to-orange-600" />
            <StatCard title="Uploaded Resources" value={stats.totalMaterials} icon={BookOpen} colorClass="bg-gradient-to-tr from-purple-500 to-pink-600" />
            <StatCard title="Overall UPI Revenue" value={`₹${stats.totalRevenue}`} icon={DollarSign} colorClass="bg-gradient-to-tr from-emerald-500 to-teal-600" />
          </div>

          {/* Visual Charts Grid (Recharts Framework Style SVGs) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Area Chart */}
            <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-700 dark:text-slate-300">Revenue Performance Trend</h3>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2 py-0.5 rounded-full font-bold">MoM Growth +24%</span>
              </div>
              <div className="h-60 w-full relative pt-2">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800/60" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800/60" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800/60" />
                  
                  {/* Filled Gradient Area */}
                  <path d="M 0 160 Q 100 135 200 95 T 400 45 T 500 15 L 500 160 L 0 160 Z" fill="url(#chartGradient)" />
                  
                  {/* Glowing Stroke Line */}
                  <path d="M 0 160 Q 100 135 200 95 T 400 45 T 500 15" fill="none" stroke="#8b5cf6" strokeWidth="3" className="drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]" />
                  
                  {/* Coordinating Circles */}
                  <circle cx="100" cy="135" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
                  <circle cx="200" cy="95" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
                  <circle cx="300" cy="70" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
                  <circle cx="400" cy="45" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
                  <circle cx="500" cy="15" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
                  
                  {/* Month points */}
                  <text x="100" y="185" textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-bold">Jan</text>
                  <text x="200" y="185" textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-bold">Feb</text>
                  <text x="300" y="185" textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-bold">Mar</text>
                  <text x="400" y="185" textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-bold">Apr</text>
                  <text x="500" y="185" textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-bold">May</text>
                </svg>
              </div>
            </div>

            {/* Category distribution bar chart */}
            <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-700 dark:text-slate-300">Category-wise Materials</h3>
                <span className="text-[10px] bg-purple-50 dark:bg-purple-950/20 text-purple-600 px-2 py-0.5 rounded-full font-bold">Distribution</span>
              </div>
              
              <div className="h-60 w-full relative pt-2">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Base Line */}
                  <line x1="20" y1="150" x2="480" y2="150" stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
                  
                  {chartData.map((item, index) => {
                    const barWidth = 12;
                    const barGap = 30;
                    const startX = 20;
                    const x = startX + index * barGap;
                    const height = item.height;
                    const y = 150 - height;

                    return (
                      <g key={item.label} className="transition-all hover:opacity-85">
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={height}
                          rx="4"
                          fill={item.fill}
                        />
                        <text
                          x={x + barWidth / 2}
                          y={166}
                          textAnchor="middle"
                          fontSize="7"
                          fill="#94a3b8"
                          className="font-bold"
                        >
                          {item.label}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          fontSize="7"
                          fill={item.fill.includes('purpleBar') ? '#8b5cf6' : item.fill.includes('indigoBar') ? '#6366f1' : item.fill.includes('pinkBar') ? '#ec4899' : item.fill.includes('amberBar') ? '#f59e0b' : item.fill.includes('emeraldBar') ? '#10b981' : '#0891b2'}
                          className="font-bold"
                        >
                          {item.pct}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Defined Bar Gradient Fills */}
                  <defs>
                    <linearGradient id="purpleBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="indigoBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="pinkBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#db2777" />
                    </linearGradient>
                    <linearGradient id="amberBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="emeraldBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="cyanBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#0891b2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Quick instructions alert */}
          <div className="glass rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <h4 className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5 text-xs">
              <ShieldAlert className="h-4 w-4 text-premium-500" />
              Administrative Guidelines
            </h4>
            To test the full user-flow cycle, toggle the "Payment Approvals" tab to review receipts submitted by users. You can also elevate accounts to premium instantly in the "Users Management" list.
          </div>
        </div>
      )}

      {/* 2. Users management tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user names, emails, mobile..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 focus:dark:bg-darkbg-100 transition-all"
            />
          </div>

          <div className="glass border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Premium Tier</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-4">
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No matching user profiles found.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{item.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{item.mobile}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(item._id)}
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                          }`}
                          title="Toggle Status (Activate/Deactivate)"
                        >
                          {item.isActive ? 'Active' : 'Banned'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleTogglePremium(item._id, item.premium)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.premium
                              ? 'bg-amber-400 text-slate-900 premium-glow'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                          }`}
                          title="Toggle Premium membership manually"
                        >
                          {item.premium ? 'Premium' : 'Free'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => setResettingUser(item)}
                          className="rounded-lg p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
                          title="Reset User Password"
                        >
                          <Key className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(item._id)}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                          title="Permanently remove user"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Materials Upload & Management Tab */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Upload Form Block */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/40 pb-3">
              <PlusCircle className="h-4.5 w-4.5 text-premium-500" />
              Add Study Resource
            </h3>

            <form onSubmit={handleMaterialSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Resource Title</label>
                <input
                  type="text"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. Gujarati Vyakaran - Sandhi & Samas Rules"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Description</label>
                <textarea
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="Summarize the study resource chapter guidelines..."
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Category</label>
                  <select
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Resource Type</label>
                  <select
                    value={materialForm.type}
                    onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="pdf">PDF File</option>
                    <option value="video">MP4 Video</option>
                    <option value="zip">ZIP Archive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Access Tier</label>
                <select
                  value={materialForm.accessType}
                  onChange={(e) => setMaterialForm({ ...materialForm, accessType: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 cursor-pointer"
                >
                  <option value="free">Free Access</option>
                  <option value="premium">Premium Access (🔒 Requires Unlock)</option>
                </select>
              </div>

              {/* Upload Main resource file */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">
                  Select Study File (Max 100MB)
                </label>
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-darkbg-100/30 text-center relative hover:border-premium-500 transition-colors">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {materialFile ? (
                      <span className="font-bold text-emerald-500 truncate block max-w-xs mx-auto">
                        ✓ {materialFile.name}
                      </span>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mx-auto text-slate-400 mb-1" />
                        PDF / MP4 / ZIP
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="fileInput"
                    onChange={(e) => setMaterialFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Upload thumbnail (optional) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">
                  Optional Thumbnail (Image)
                </label>
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-darkbg-100/30 text-center relative hover:border-premium-500 transition-colors">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {materialThumb ? (
                      <span className="font-bold text-emerald-500 truncate block max-w-xs mx-auto">
                        ✓ {materialThumb.name}
                      </span>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 mx-auto text-slate-400 mb-1" />
                        JPEG / PNG / WEBP
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="thumbInput"
                    accept="image/*"
                    onChange={(e) => setMaterialThumb(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-premium-500 py-3 text-xs font-bold text-white shadow-lg shadow-premium-500/25 hover:bg-premium-600 disabled:opacity-50 transition-all pt-3"
              >
                {actionLoading ? 'Uploading Resource...' : 'Upload Study Resource'}
              </button>
            </form>
          </div>

          {/* Existing materials lists */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-800/40">
              Manage Vault Contents
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : materials.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">No study assets uploaded yet.</p>
              ) : (
                materials.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between gap-3 text-xs p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all"
                  >
                    <div className="flex items-center gap-3 truncate w-2/3">
                      <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-darkbg-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-100 dark:border-slate-800/30">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 truncate">{m.title}</h4>
                        <div className="flex gap-2 items-center text-[9px] text-slate-400 mt-0.5 uppercase font-medium">
                          <span>{m.category}</span>
                          <span>•</span>
                          <span>{m.type}</span>
                          <span>•</span>
                          <span className={m.accessType === 'premium' ? 'text-amber-500 font-extrabold' : 'text-emerald-500 font-extrabold'}>
                            {m.accessType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDeleteMaterial(m._id)}
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                        title="Delete resource"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Payment Approval Management Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="glass border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-6 py-4">User Claim</th>
                  <th className="px-6 py-4 text-center">Amount</th>
                  <th className="px-6 py-4">Reference UTR</th>
                  <th className="px-6 py-4 text-center">Receipt Screenshot</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-4">
                      <TableRowSkeleton />
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No pending payment requests needing verification.
                    </td>
                  </tr>
                ) : (
                  payments.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{item.userId?.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.userId?.email}</div>
                        <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Cell: {item.userId?.mobile}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        ₹{item.amount}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-premium-600 dark:text-premium-400">
                        {item.transactionId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setLightboxImage(item.screenshotUrl)}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-50 dark:bg-darkbg-100 hover:bg-premium-100 dark:hover:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-800 transition-all font-bold text-[9px] text-slate-500 cursor-pointer"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          View Receipt
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 shrink-0">
                        {activeRejectId === item._id ? (
                          <div className="flex flex-col gap-2 items-end">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Reason for rejection"
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] w-48 text-slate-800 outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerifyPayment(item._id, 'rejected')}
                                className="rounded-lg bg-rose-500 text-white px-3 py-1 text-[10px] font-bold"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  setActiveRejectId(null);
                                  setRejectReason('');
                                }}
                                className="rounded-lg bg-slate-100 text-slate-500 px-3 py-1 text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleVerifyPayment(item._id, 'approved')}
                              className="rounded-lg bg-emerald-500 text-white p-2 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10"
                              title="Approve Claims"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(item._id, 'rejected')}
                              className="rounded-lg bg-rose-500 text-white p-2 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/10"
                              title="Reject Claims"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Announcements notices broadcast tab */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Post Form */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/40 pb-3">
              <Megaphone className="h-4.5 w-4.5 text-premium-500" />
              Write Announcement
            </h3>

            <form onSubmit={handleNoticeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Notice Title</label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. Schedule Update for SSC Prep"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Alert Content</label>
                <textarea
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Detail changes or study resources released..."
                  rows="4"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Target Audience</label>
                <select
                  value={noticeForm.target}
                  onChange={(e) => setNoticeForm({ ...noticeForm, target: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Platform Users</option>
                  <option value="free">Free Tier Users Only</option>
                  <option value="premium">Premium Pass Holders Only</option>
                </select>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-premium-500 py-3 text-xs font-bold text-white shadow-lg shadow-premium-500/25 hover:bg-premium-600 transition-all pt-3"
              >
                Broadcast Announcement
              </button>
            </form>
          </div>

          {/* Past notices */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-800/40">
              Broadcast Archive Logs
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {loading ? (
                <>
                  <TableRowSkeleton />
                </>
              ) : notices.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">No notices broadcasted yet.</p>
              ) : (
                notices.map((n) => (
                  <div
                    key={n._id}
                    className="flex items-start justify-between gap-3 text-xs p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all animate-scale-in"
                  >
                    <div className="space-y-1 flex-1">
                      <h4 className="font-bold text-slate-700 dark:text-slate-300">{n.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{n.content}</p>
                      <div className="flex gap-2 items-center text-[9px] text-slate-400 mt-1 uppercase font-bold">
                        <span>Group: {n.target}</span>
                        <span>•</span>
                        <span>Date: {new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNotice(n._id)}
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all shrink-0"
                      title="Remove Notice"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Doubts Management Tab */}
      {activeTab === 'doubts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">Student Doubt Management</h2>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/50 dark:border-slate-700/50">
              {['all', 'pending', 'solved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setDoubtFilter(f)}
                  className={`rounded-lg px-3 py-1 text-[10px] font-bold transition-all ${doubtFilter === f ? 'bg-violet-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Solved'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></>
            ) : allDoubts.filter(d => doubtFilter === 'all' ? true : d.status === doubtFilter).length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                No {doubtFilter !== 'all' ? doubtFilter : ''} doubts found.
              </div>
            ) : (
              allDoubts.filter(d => doubtFilter === 'all' ? true : d.status === doubtFilter).map((doubt) => (
                <div
                  key={doubt._id}
                  className={`rounded-2xl border p-5 transition-all ${doubt.status === 'solved' ? 'border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-amber-200/50 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10'}`}
                >
                  {/* Student Info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 text-white font-extrabold text-xs">
                        {doubt.student?.name ? doubt.student.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {doubt.student?.name || 'Unknown'}
                        </h4>
                        <p className="text-[9px] text-slate-400">
                          {doubt.student?.email} • {doubt.student?.mobile}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${doubt.status === 'solved' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'}`}>
                        {doubt.status === 'solved' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {doubt.status}
                      </span>
                      <button
                        onClick={() => handleDeleteDoubt(doubt._id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Doubt Content */}
                  <div className="rounded-xl bg-white/50 dark:bg-darkbg-100/30 border border-slate-100 dark:border-slate-800/40 p-3 mb-3">
                    {doubt.materialTitle && doubt.materialTitle !== 'General Doubt' && (
                      <span className="inline-block rounded-md bg-premium-100 dark:bg-premium-900/40 px-1.5 py-0.5 text-[9px] font-bold text-premium-600 dark:text-premium-300 mb-1">
                        {doubt.materialCategory && `${doubt.materialCategory} • `}{doubt.materialTitle}
                      </span>
                    )}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{doubt.question}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {new Date(doubt.createdAt).toLocaleDateString()} {new Date(doubt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Existing Reply */}
                  {doubt.status === 'solved' && doubt.adminReply && (
                    <div className="rounded-xl bg-emerald-100/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/30 p-3 mb-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[8px] font-black">A</div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Your Reply</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{doubt.adminReply}</p>
                    </div>
                  )}

                  {/* Reply Form (for pending doubts) */}
                  {doubt.status === 'pending' && (
                    <div>
                      {activeReplyDoubtId === doubt._id ? (
                        <div className="space-y-2 animate-scale-in">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="તમારો જવાબ લખો... (Type your answer here)"
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDoubtReply(doubt._id)}
                              disabled={!replyText.trim()}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50 transition-all"
                            >
                              <Send className="h-3.5 w-3.5" />
                              Send Reply & Solve
                            </button>
                            <button
                              onClick={() => { setActiveReplyDoubtId(null); setReplyText(''); }}
                              className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveReplyDoubtId(doubt._id)}
                          className="flex items-center gap-1.5 rounded-xl bg-violet-500 hover:bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:-translate-y-0.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Reply to Student
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. Quiz Management Tab */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Create Quiz Panel */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/40 pb-3">
              <PlusCircle className="h-4.5 w-4.5 text-premium-500" />
              Create Daily MCQ Quiz
            </h3>

            <form onSubmit={handleCreateQuiz} className="space-y-6 text-xs">
              {/* Quiz Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Quiz Title</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    placeholder="e.g. Daily Gujarati Grammer Practice"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Subject Category</label>
                  <select
                    value={quizForm.subject}
                    onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 cursor-pointer text-xs sm:text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase tracking-widest pl-0.5">Completion Bonus Points</label>
                  <input
                    type="number"
                    value={quizForm.pointsForCompletion}
                    onChange={(e) => setQuizForm({ ...quizForm, pointsForCompletion: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="50"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Questions Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
                  <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">Quiz Questions ({quizQuestions.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-[10px] font-bold text-premium-600 bg-premium-50 dark:bg-premium-950/40 hover:bg-premium-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Question
                  </button>
                </div>

                {quizQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-darkbg-100/20 space-y-4 relative">
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="absolute top-4 right-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded-lg transition-all"
                        title="Remove Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div className="pr-8 space-y-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Question {qIndex + 1} Text</label>
                        <textarea
                          value={q.questionText}
                          onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                          placeholder="Type the question query..."
                          rows="2"
                          className="w-full rounded-2xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-premium-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/40 dark:text-slate-200 transition-all resize-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className="space-y-1">
                            <label className="flex items-center gap-1.5 font-bold text-slate-400 uppercase tracking-widest text-[9px] pl-0.5">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.correctOptionIndex === optIndex}
                                onChange={() => handleQuestionChange(qIndex, 'correctOptionIndex', optIndex)}
                                className="text-premium-500 focus:ring-premium-400 h-3.5 w-3.5 cursor-pointer accent-premium-500"
                              />
                              Option {String.fromCharCode(65 + optIndex)} {q.correctOptionIndex === optIndex && <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded">Correct</span>}
                            </label>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)} value`}
                              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-premium-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/40 dark:text-slate-200 transition-all"
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px] pl-0.5">Optional Explanation</label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                          placeholder="e.g. Correct answer because of Rule X..."
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-premium-500 focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/40 dark:text-slate-200 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-premium-500 py-3.5 text-xs font-bold text-white shadow-lg shadow-premium-500/25 hover:bg-premium-600 disabled:opacity-50 transition-all"
              >
                {actionLoading ? 'Publishing Quiz...' : 'Publish Practice Quiz'}
              </button>
            </form>
          </div>

          {/* Active Quizzes List Panel */}
          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-800/40">
              Active Daily Quizzes ({quizzesList.length})
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : quizzesList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10 font-medium">No practice quizzes found.</p>
              ) : (
                quizzesList.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="flex items-center justify-between gap-3 text-xs p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/30 dark:bg-darkbg-100/10 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all"
                  >
                    <div className="truncate w-3/4 space-y-1">
                      <h4 className="font-extrabold text-slate-700 dark:text-slate-300 truncate">{quiz.title}</h4>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 items-center text-[9px] text-slate-400 uppercase font-bold">
                        <span className="text-premium-500 font-extrabold">{quiz.subject}</span>
                        <span>•</span>
                        <span>{quiz.questions?.length || 0} MCQ Questions</span>
                        <span>•</span>
                        <span>+{quiz.pointsForCompletion || 50} Pts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all shrink-0"
                      title="Delete Quiz"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox popups for zooming receipts screenshot images */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 cursor-pointer"
        >
          <div className="relative max-w-lg max-h-[85vh] rounded-3xl bg-white border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden glass p-2 flex flex-col justify-between">
            <img
              src={lightboxImage.startsWith('http') || lightboxImage.startsWith('/uploads') ? (lightboxImage.startsWith('http') ? lightboxImage : `${SERVER_URL}${lightboxImage}`) : lightboxImage}
              alt="Zoomed Payment Screenshot Receipt Claim"
              className="rounded-2xl max-w-full max-h-[75vh] object-contain shadow-sm"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=400&auto=format&fit=crop";
              }}
            />
            <div className="text-center py-2 text-[10px] font-bold text-slate-400">
              Click anywhere outside image to close preview
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Reset Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-darkbg-200 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="h-4.5 w-4.5 text-premium-500" />
                Reset Password for {resettingUser.name}
              </h3>
              <button
                onClick={() => {
                  setResettingUser(null);
                  setNewPassword('');
                  setShowResetPassword(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (newPassword.length < 6) {
                  setErrorMsg('Password must be at least 6 characters long.');
                  clearMessages();
                  return;
                }
                setActionLoading(true);
                try {
                  const res = await axios.put(`${API_URL}/admin/users/${resettingUser._id}/reset-password`, {
                    password: newPassword,
                  });
                  if (res.data && res.data.success) {
                    setSuccessMsg(res.data.message);
                    setResettingUser(null);
                    setNewPassword('');
                    setShowResetPassword(false);
                    clearMessages();
                  }
                } catch (err) {
                  setErrorMsg(err.response?.data?.message || 'Failed to reset password.');
                  clearMessages();
                } finally {
                  setActionLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-4 pr-11 text-sm text-slate-800 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showResetPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResettingUser(null);
                    setNewPassword('');
                    setShowResetPassword(false);
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 rounded-2xl bg-premium-500 py-3 text-xs font-bold text-white shadow-lg shadow-premium-500/20 hover:bg-premium-600 disabled:opacity-50 transition-all"
                >
                  {actionLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

