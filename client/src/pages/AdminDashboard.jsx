import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Star,
  Hourglass,
  Loader2,
  AlertCircle,
  Building,
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/analytics'),
      ]);

      if (statsRes.data.success && analyticsRes.data.success) {
        setStats(statsRes.data.data);
        setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const {
    totalUsers,
    totalAppointments,
    pendingCount,
    approvedCount,
    rejectedCount,
    completedCount,
    avgWaitTime,
    avgRating,
  } = stats || {};

  const {
    monthlyStats,
    departmentStats,
    statusStats,
    peakHoursStats,
    mostVisitedDept,
  } = analytics || {};

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          colorClass="text-blue-500 bg-blue-500"
          gradientClass="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Total Appointments"
          value={totalAppointments}
          icon={CalendarDays}
          colorClass="text-indigo-500 bg-indigo-500"
          gradientClass="from-indigo-500 to-purple-500"
        />
        <StatsCard
          title="Average Wait Time"
          value={`${avgWaitTime} Min`}
          icon={Hourglass}
          colorClass="text-amber-500 bg-amber-500"
          gradientClass="from-amber-500 to-orange-500"
        />
        <StatsCard
          title="Average Rating"
          value={`${avgRating} ★`}
          icon={Star}
          colorClass="text-emerald-500 bg-emerald-500"
          gradientClass="from-emerald-500 to-teal-500"
        />
      </div>

      {/* Appointment Status Splits Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-100/50 dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/40">
        <div className="text-center space-y-1 py-2 border-r border-slate-200/50 dark:border-slate-800/50 last:border-none">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Pending</span>
          <span className="text-xl font-extrabold text-amber-500">{pendingCount}</span>
        </div>
        <div className="text-center space-y-1 py-2 border-r border-slate-200/50 dark:border-slate-800/50 last:border-none">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Approved</span>
          <span className="text-xl font-extrabold text-indigo-500">{approvedCount}</span>
        </div>
        <div className="text-center space-y-1 py-2 border-r border-slate-200/50 dark:border-slate-800/50 last:border-none">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Rejected</span>
          <span className="text-xl font-extrabold text-red-500">{rejectedCount}</span>
        </div>
        <div className="text-center space-y-1 py-2 last:border-none">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Completed</span>
          <span className="text-xl font-extrabold text-green-500">{completedCount}</span>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Booking Trend (Area/Bar Chart) - takes 2 cols */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 dark:text-white text-base">Monthly Appointments</h4>
            <span className="flex items-center gap-1.5 text-xs text-green-500 font-semibold">
              <TrendingUp className="h-4 w-4" /> Live Tracking
            </span>
          </div>
          <div className="h-80 w-full text-xs font-semibold">
            {monthlyStats && monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(30, 41, 59, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAppointments)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No monthly data logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Department Share (Pie/Doughnut Chart) */}
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-6">
          <h4 className="font-bold text-slate-800 dark:text-white text-base">Department Distribution</h4>
          <div className="h-64 w-full flex items-center justify-center text-xs">
            {departmentStats && departmentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(30, 41, 59, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-center">No department statistics logged yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Peak Hours Stats */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <h4 className="font-bold text-slate-800 dark:text-white text-base">Peak Booking Slots</h4>
          <div className="space-y-3">
            {peakHoursStats && peakHoursStats.length > 0 ? (
              peakHoursStats.map((slot, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-900 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-primary-500/10 text-primary-500 font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{slot.time}</span>
                  </div>
                  <span className="font-extrabold text-slate-500 dark:text-slate-400">{slot.count} Bookings</span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-center text-xs py-8">No slot trends found.</div>
            )}
          </div>
        </div>

        {/* Analytics Insights */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
          <h4 className="font-bold text-slate-800 dark:text-white text-base">Analytics Insights</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900/50 space-y-1.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                Top Department
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building className="h-4.5 w-4.5 text-primary-500 shrink-0" />
                {mostVisitedDept}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900/50 space-y-1.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                Total Feedback Reviews
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Star className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                {stats?.totalAppointments ? completedCount : 0} Reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
