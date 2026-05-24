import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, Phone, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Register() {
  const { register, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, mobile, password } = formData;

    if (!name || !email || !mobile || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mobile.length < 10) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, mobile, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed, try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-darkbg-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-premium-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-slate-50 dark:bg-darkbg-100 transition-colors relative">
      {/* Back to Home */}
      <Link to="/" className="absolute top-5 left-5 flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-10">
        <span>←</span> Home
      </Link>

      <div className="relative w-full max-w-md">
        {/* Glow behind card */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-premium-500 to-indigo-600 blur-xl opacity-20 dark:opacity-30" />

        {/* Card */}
        <div className="relative rounded-3xl bg-white border border-slate-100 p-8 shadow-xl dark:border-slate-800 dark:bg-darkbg-200 transition-colors">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-premium-500 text-white shadow-lg shadow-premium-500/20 font-extrabold text-xs">
              SS
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Account</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Start your premium learning platform experience
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs leading-relaxed animate-scale-in">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-premium-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-darkbg-100/50 dark:text-slate-200 focus:dark:bg-darkbg-100 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-premium-500 py-3 text-sm font-bold text-white shadow-lg shadow-premium-500/25 hover:bg-premium-600 disabled:opacity-50 transition-all mt-4"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-premium-600 dark:text-premium-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
