import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Users,
  BarChart3,
  MessageSquare,
  Sparkles,
  CalendarCheck2,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visitorLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Book Appointment', path: '/book-appointment', icon: CalendarPlus },
    { name: 'My Appointments', path: '/my-appointments', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Bookings', path: '/admin/appointments', icon: CalendarCheck2 },
    { name: 'Visitors Log', path: '/admin/visitors', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'User Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const links = user?.role === 'admin' ? adminLinks : visitorLinks;

  const getPageTitle = () => {
    const activeLink = links.find((link) => link.path === location.pathname);
    return activeLink ? activeLink.name : 'System';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass border-r border-slate-200/50 dark:border-slate-800/50 m-4 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/5 dark:shadow-black/20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white shadow-md shadow-primary-500/20">
            <Sparkles className="h-5 w-5 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-white leading-none tracking-tight text-sm">Smart Visitor</h1>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">Appointment Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/10 to-indigo-600/10 text-primary-600 dark:text-primary-400 shadow-sm border-l-4 border-primary-500'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-105' : ''}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="relative flex flex-col w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full p-6 shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-slide-in">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-500 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h1 className="font-bold text-slate-800 dark:text-white text-sm">Smart Visitor</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 lg:py-6 bg-transparent">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl lg:hidden border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 shadow-sm"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Greeting */}
            <div className="hidden sm:flex items-center gap-3 border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm pl-4 pr-3.5 py-1.5 rounded-2xl shadow-sm">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{user?.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-primary-500/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
