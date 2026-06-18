import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import TokenWidget from '../components/TokenWidget';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';

const UserDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeQueueAppt, setActiveQueueAppt] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError('');
      const res = await api.get('/appointments');
      if (res.data.success) {
        const data = res.data.data;
        setAppointments(data);

        // Find the latest active (pending, approved, in-progress) appointment to show in the token queue widget
        const active = data.find((appt) =>
          ['pending', 'approved', 'in-progress'].includes(appt.status)
        );

        if (active) {
          // Fetch real-time queue details for this active appointment
          const queueRes = await api.get(`/appointments/${active._id}`);
          if (queueRes.data.success) {
            setActiveQueueAppt(queueRes.data.data);
            setQueueData(queueRes.data.queue);
          }
        } else {
          setActiveQueueAppt(null);
          setQueueData(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for queue updates every 15 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Calculate Stats
  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const approved = appointments.filter((a) => a.status === 'approved' || a.status === 'in-progress').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  const recentAppointments = appointments.slice(0, 3);

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Visits"
          value={total}
          icon={CalendarDays}
          colorClass="text-blue-500 bg-blue-500"
          gradientClass="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Pending Request"
          value={pending}
          icon={Clock}
          colorClass="text-amber-500 bg-amber-500"
          gradientClass="from-amber-500 to-orange-500"
        />
        <StatsCard
          title="Active Session"
          value={approved}
          icon={CalendarCheck}
          colorClass="text-indigo-500 bg-indigo-500"
          gradientClass="from-indigo-500 to-purple-500"
        />
        <StatsCard
          title="Completed"
          value={completed}
          icon={CheckCircle2}
          colorClass="text-emerald-500 bg-emerald-500"
          gradientClass="from-emerald-500 to-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Ticket Status Widget (takes 1 col on desktop) */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Queue Status</h3>
          {activeQueueAppt ? (
            <TokenWidget queue={queueData} appointment={activeQueueAppt} />
          ) : (
            <div className="glass-card p-6 rounded-3xl text-center space-y-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full w-fit mx-auto text-slate-400 dark:text-slate-500">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Active Booking</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                  You don't have any pending or active appointments scheduled today.
                </p>
              </div>
              <Link
                to="/book-appointment"
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <Plus className="h-4 w-4" /> Book Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Recent Bookings (takes 2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Recent Appointments</h3>
            <Link
              to="/my-appointments"
              className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-0.5 transition-colors"
            >
              See All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="glass-card p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-200/50 dark:border-slate-800/50 hover:translate-x-1 transition-transform"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white text-sm">
                        Meeting with {appt.personToMeet}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 uppercase">
                        {appt.department}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>Date: {new Date(appt.appointmentDate).toLocaleDateString()}</span>
                      <span>TimeSlot: {appt.appointmentTime}</span>
                      {appt.tokenNumber && (
                        <span className="font-semibold text-primary-500">Token: #{appt.tokenNumber}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        appt.status === 'in-progress'
                          ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                          : appt.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                          : appt.status === 'approved'
                          ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                          : appt.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                          : appt.status === 'cancelled'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          : 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {appt.status}
                    </span>

                    <Link
                      to={`/my-appointments`}
                      className="p-2 border border-slate-200/50 dark:border-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-8 rounded-3xl text-center text-slate-400 dark:text-slate-500 text-xs">
                No appointment history yet. Click "Book Appointment" above to create one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
