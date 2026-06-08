import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Bell, User, Star, Menu, X, Shield, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isPremium, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notices, setNotices] = useState([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveNotices = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/notices`);
        if (res.data && res.data.success) {
          setNotices(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load notices for navbar:', err.message);
      }
    };
    fetchActiveNotices();
  }, [token, user?.premium]);

  useEffect(() => {
    const handleOpenProfile = () => setShowProfileModal(true);
    window.addEventListener('open-profile-modal', handleOpenProfile);
    return () => window.removeEventListener('open-profile-modal', handleOpenProfile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-darkbg-100/80 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-premium-500 to-indigo-600 text-white font-extrabold text-sm shadow-md hover:scale-105 transition-all focus:outline-none ring-2 ring-premium-500/20"
              title="View Profile Details"
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>
          )}

          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 hidden lg:block"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-premium-500 to-indigo-600 shadow-md text-white font-extrabold text-xs hidden sm:flex">
              ED
            </div>
            <span className="font-sans font-bold text-base sm:text-lg bg-gradient-to-r from-premium-600 to-indigo-600 dark:from-premium-400 dark:to-indigo-400 bg-clip-text text-transparent">
              EDUCATION07_
            </span>
          </Link>
        </div>

        {/* Right Section: Interactions & Authenticated user indicators */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Download Mobile App Button */}
          {!(window.Capacitor && window.Capacitor.isNativePlatform()) && (
            <a
              href="https://github.com/meetbhai78/premium-study-platform/releases/latest/download/app-debug.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/20 px-3.5 py-2 text-xs font-black text-premium-600 dark:text-premium-400 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
              title="Download Android App APK"
            >
              <Smartphone className="h-4 w-4" />
              Download App
            </a>
          )}

          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Toggle light/dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {user && (
            <>
              {/* Notification / Notices Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowBellDropdown(!showBellDropdown)}
                  className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors relative"
                  title="Announcements"
                >
                  <Bell className="h-5 w-5" />
                  {notices.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500" />
                  )}
                </button>

                {/* Notices Dropdown */}
                {showBellDropdown && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xl dark:border-slate-800/60 dark:bg-darkbg-200 glass transition-all duration-300 animate-scale-in">
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Announcements</span>
                      <span className="rounded-full bg-premium-100 dark:bg-premium-900/40 px-2 py-0.5 text-xs text-premium-600 dark:text-premium-300">
                        {notices.length} Active
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {notices.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                          No recent announcements.
                        </p>
                      ) : (
                        notices.map((notice) => (
                          <div
                            key={notice._id}
                            className="rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                              {notice.title}
                            </h4>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              {notice.content}
                            </p>
                            <span className="mt-2 block text-[9px] text-slate-400">
                              {new Date(notice.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Premium Status Badge */}
              {isPremium ? (
                <div className="hidden sm:flex items-center gap-1 rounded-full bg-amber-400/10 dark:bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-500 premium-glow">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  Premium
                </div>
              ) : (
                <Link
                  to="/payment"
                  className="hidden sm:flex items-center gap-1 rounded-full bg-premium-500 px-3 py-1 text-xs font-bold text-white hover:bg-premium-600 transition-all shadow-md shadow-premium-500/20"
                >
                  Go Premium
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Premium Profile Details Modal */}
      {showProfileModal && (
        <div
          onClick={() => setShowProfileModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-scale-in"
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-darkbg-200 shadow-2xl overflow-hidden glass animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Upper colorful header */}
            <div className="bg-gradient-to-r from-premium-500 via-purple-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute -top-12 -left-12 h-32 w-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
              
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 rounded-xl p-1.5 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/25 border-2 border-white text-white font-black text-2xl shadow-inner mb-3">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="font-extrabold text-lg truncate">{user.name}</h3>
              <p className="text-xs text-purple-100/90 mt-0.5 truncate">{user.email}</p>

              <div className="mt-3 inline-block">
                {user.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    <Shield className="h-3 w-3" /> System Admin
                  </span>
                ) : isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-slate-900 shadow-md premium-glow animate-pulse">
                    <Star className="h-3 w-3 fill-slate-900" /> Premium Vault Pass
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white">
                    Free Tier Account
                  </span>
                )}
              </div>
            </div>

            {/* Profile body details */}
            <div className="p-6 space-y-5 text-xs">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mobile Number</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{user.mobile || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Role Identity</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 capitalize">{user.role || 'User'}</span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Subscription Status</span>
                  {isPremium ? (
                    <span className="font-bold text-amber-500">Lifetime Active (Ad-Free)</span>
                  ) : user.paymentStatus === 'pending' ? (
                    <span className="font-bold text-orange-500">Verification Pending</span>
                  ) : user.paymentStatus === 'rejected' ? (
                    <span className="font-bold text-rose-500">Rejected (Needs re-upload)</span>
                  ) : (
                    <span className="font-bold text-slate-500">Free Tier</span>
                  )}
                </div>
              </div>

              {/* Help & Support Contact Section */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/60 space-y-3">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  મદદ અને સજેશન (Help & Suggestions)
                </h4>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="tel:9727353339"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-darkbg-100/50 p-2.5 border border-slate-200/60 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white text-[10px]">📞</span>
                    Admin: 9727353339
                  </a>
                  
                  <a
                    href="mailto:meetberani78@gmail.com"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-darkbg-100/50 p-2.5 border border-slate-200/60 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white text-[10px]">✉️</span>
                    App Feedback
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                {!isPremium && user.role !== 'admin' && (
                  <Link
                    to="/payment"
                    onClick={() => setShowProfileModal(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 py-3 text-center text-xs font-black text-white shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all"
                  >
                    <Star className="h-4 w-4 fill-white" /> Upgrade to Lifetime Premium (₹50)
                  </Link>
                )}

                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-250 bg-rose-50/50 py-3 text-center text-xs font-extrabold text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400 hover:bg-rose-105 dark:hover:bg-rose-950/30 transition-all"
                >
                  <LogOut className="h-4 w-4" /> Sign Out from EDUCATION07_
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
