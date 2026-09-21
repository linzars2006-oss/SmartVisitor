import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  CalendarDays,
  ShieldCheck,
  Zap,
  Users2,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      title: 'Hassle-free Booking',
      description: 'Select your preferred official and schedule an appointment in under 2 minutes.',
      icon: CalendarDays,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      title: 'Live Token Tracking',
      description: 'Track your position in the queue, see active sessions, and know exactly when it is your turn.',
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Secure Accounts',
      description: 'Role-based accounts with JWT tokens and security to keep visitor profiles confidential.',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Administrative Panel',
      description: 'Comprehensive dashboard for coordinators to approve bookings and log visitor histories.',
      icon: Users2,
      color: 'text-rose-500 bg-rose-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden flex flex-col font-sans">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-500/10 blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-slate-800 dark:text-white tracking-tight text-lg">
            Smart Visitor
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="btn-primary flex items-center gap-1 py-2.5"
            >
              Go to Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-200/40 dark:hover:bg-slate-900/50 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary py-2.5 text-xs lg:text-sm"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col lg:flex-row items-center justify-center gap-12 py-12 lg:py-24">
        {/* Left Info Column */}
        <div className="flex-1 space-y-8 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Modern Reception Management
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white tracking-tight leading-[1.1]">
            Experience Smart & Seamless{' '}
            <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
              Office Visits
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Eliminate receptionist desk wait-times. Book digital appointments with officials, monitor queue positions in real-time, and track your active visit from any device.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/register'}
              className="btn-primary w-full sm:w-auto text-center px-8 py-4 flex items-center justify-center gap-2 group"
            >
              Get Started <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary w-full sm:w-auto text-center px-8 py-4"
            >
              Login to Account
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto lg:mx-0">
            <div>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none">2.5k+</h4>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 block">Visits Booked</span>
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none">12m</h4>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 block">Avg Wait Time</span>
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none">4.9★</h4>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 block">Visitor Rating</span>
            </div>
          </div>
        </div>

        {/* Right Feature Cards Column */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:translate-y-[-6px] hover:shadow-xl hover:shadow-primary-500/5 group border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-500 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded-full -mr-6 -mt-6" />
                <div className={`p-3 rounded-2xl ${feature.color} w-fit`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Landing;
