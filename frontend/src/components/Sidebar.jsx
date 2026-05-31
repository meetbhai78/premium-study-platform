import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, CreditCard, ShieldAlert, Sparkles, Shield, LogOut, Smartphone } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isPremium, isAdmin } = useAuth();

  const menuItems = [
    {
      name: 'User Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Study Materials',
      path: '/materials',
      icon: BookOpen,
      show: true,
    },
    {
      name: 'Unlock Premium',
      path: '/payment',
      icon: CreditCard,
      show: !isPremium && !isAdmin, // Premium users or admins don't need to unlock
    },
    {
      name: 'Admin Panel',
      path: '/admin',
      icon: Shield,
      show: isAdmin,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar core drawer container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200/50 bg-white/90 dark:border-slate-800/50 dark:bg-darkbg-100/90 pt-16 transition-transform duration-300 lg:static lg:translate-x-0 glass ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between px-3 py-6">
          <div className="space-y-6">
            {/* Quick Profile Summary Card in Sidebar */}
            <div className="mx-2 rounded-2xl bg-gradient-to-tr from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-800/20 p-4 border border-slate-100 dark:border-slate-800/50">
              <p className="text-xs text-slate-400 dark:text-slate-500">Welcome,</p>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5 truncate">{user?.name}</h3>
              
              <div className="mt-3">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <ShieldAlert className="h-3 w-3" />
                    Administrator
                  </span>
                ) : isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/10 dark:bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-500 premium-glow">
                    <Sparkles className="h-3 w-3 fill-amber-400" />
                    Premium User
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Free Member
                  </span>
                )}
              </div>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1.5">
              {menuItems
                .filter((item) => item.show)
                .map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-premium-500 text-white shadow-lg shadow-premium-500/25'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
            </nav>
          </div>

          {/* Download APK Banner for Web visitors */}
          {!(window.Capacitor && window.Capacitor.isNativePlatform()) && (
            <div className="mx-2 mb-4 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-premium-500/10 p-3.5 border border-indigo-200/20 text-center space-y-2">
              <p className="text-[10px] font-bold text-premium-600 dark:text-premium-400 uppercase tracking-wider">EDUCATION07_ Mobile App</p>
              <h4 className="text-[11px] font-black text-slate-700 dark:text-slate-200">મોબાઈલ એપ ડાઉનલોડ કરો!</h4>
              <a
                href="https://apkbuild.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-tr from-premium-500 to-indigo-650 py-2 text-xs font-black text-white shadow-md shadow-premium-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Download Android APK
              </a>
            </div>
          )}

          {/* Sidebar Footer: Logout Button */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
