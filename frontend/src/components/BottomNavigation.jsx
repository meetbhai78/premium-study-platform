import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, CreditCard, Shield, User } from 'lucide-react';

export default function BottomNavigation({ onOpenProfile }) {
  const { user, isPremium, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-45 w-[92%] max-w-sm rounded-full border border-slate-200/50 bg-white/80 p-1.5 shadow-xl backdrop-blur-md dark:border-slate-800/50 dark:bg-darkbg-200/80 lg:hidden glass transition-all select-none">
      <nav className="grid grid-cols-4 items-center justify-center text-center">
        {/* 1. Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-2xl p-1.5 text-[9px] font-black transition-all ${
              isActive
                ? 'text-premium-500 scale-[1.03] bg-premium-50/50 dark:bg-premium-950/20'
                : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="h-4.5 w-4.5 mb-0.5" />
          Home
        </NavLink>

        {/* 2. Study Library */}
        <NavLink
          to="/materials"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-2xl p-1.5 text-[9px] font-black transition-all ${
              isActive
                ? 'text-premium-500 scale-[1.03] bg-premium-50/50 dark:bg-premium-950/20'
                : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`
          }
        >
          <BookOpen className="h-4.5 w-4.5 mb-0.5" />
          Study
        </NavLink>

        {/* 3. Dynamic Center Button: Premium or Admin Panel */}
        {isAdmin ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-2xl p-1.5 text-[9px] font-black transition-all ${
                isActive
                  ? 'text-premium-500 scale-[1.03] bg-premium-50/50 dark:bg-premium-950/20'
                  : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
              }`
            }
          >
            <Shield className="h-4.5 w-4.5 mb-0.5" />
            Admin
          </NavLink>
        ) : !isPremium ? (
          <NavLink
            to="/payment"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-2xl p-1.5 text-[9px] font-black transition-all ${
                isActive
                  ? 'text-amber-500 scale-[1.03] bg-amber-50/50 dark:bg-amber-950/25 premium-glow'
                  : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
              }`
            }
          >
            <CreditCard className="h-4.5 w-4.5 mb-0.5 text-amber-500 animate-pulse" />
            Premium
          </NavLink>
        ) : (
          <div className="flex flex-col items-center justify-center p-1.5 text-[9px] font-black text-amber-500 select-none scale-[1.03]">
            <CreditCard className="h-4.5 w-4.5 mb-0.5 text-amber-500" />
            Unlocked
          </div>
        )}

        {/* 4. Profile Modal Trigger */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center rounded-2xl p-1.5 text-[9px] font-black text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-all focus:outline-none"
        >
          <User className="h-4.5 w-4.5 mb-0.5" />
          Profile
        </button>
      </nav>
    </div>
  );
}
