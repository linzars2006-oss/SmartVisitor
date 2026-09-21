import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TokenWidget from '../components/TokenWidget';
import {
  Search,
  Filter,
  AlertCircle,
  XCircle,
  Star,
  CheckCircle,
  Clock,
  Navigation,
  Loader2,
  Calendar,
  AlertTriangle,
  User,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [trackingAppt, setTrackingAppt] = useState(null);
  const [trackingQueue, setTrackingQueue] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [feedbackAppt, setFeedbackAppt] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  // Fetch appointments list
  const fetchAppointments = async () => {
    try {
      setError('');
      const res = await api.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = appointments;

    // Filter by tab
    if (activeTab === 'active') {
      result = appointments.filter((appt) => ['pending', 'approved', 'in-progress'].includes(appt.status));
    } else if (activeTab === 'completed') {
      result = appointments.filter((appt) => appt.status === 'completed');
    } else if (activeTab === 'cancelled') {
      result = appointments.filter((appt) => ['cancelled', 'rejected'].includes(appt.status));
    }

    // Search by official or department
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (appt) =>
          appt.personToMeet.toLowerCase().includes(q) ||
          appt.department.toLowerCase().includes(q) ||
          appt.purpose.toLowerCase().includes(q)
      );
    }

    setFilteredAppointments(result);
  }, [appointments, activeTab, searchQuery]);

  // Cancel handler
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.delete(`/appointments/${id}/cancel`);
      if (res.data.success) {
        alert('Appointment cancelled successfully');
        fetchAppointments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  // Open Queue tracking modal
  const handleOpenTracking = async (appt) => {
    setTrackingAppt(appt);
    setTrackingLoading(true);
    try {
      const res = await api.get(`/appointments/${appt._id}`);
      if (res.data.success) {
        setTrackingQueue(res.data.queue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Open feedback modal
  const handleOpenFeedback = (appt) => {
    setFeedbackAppt(appt);
    setFeedbackRating(5);
    setFeedbackComment('');
    setFeedbackError('');
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) {
      setFeedbackError('Please add a comment');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');

    try {
      const res = await api.post('/feedback', {
        appointmentId: feedbackAppt._id,
        rating: feedbackRating,
        comment: feedbackComment,
      });

      if (res.data.success) {
        alert('Feedback submitted successfully. Thank you!');
        setFeedbackAppt(null);
        fetchAppointments(); // Refresh to hide feedback action button
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by official, department, or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 w-fit">
          {['all', 'active', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appt) => (
            <div
              key={appt._id}
              className="glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                      {appt.department}
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">
                      {appt.personToMeet}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      appt.status === 'in-progress'
                        ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/20 dark:border-amber-900/30'
                        : appt.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/20 dark:border-green-900/30'
                        : appt.status === 'approved'
                        ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/20 dark:border-indigo-900/30'
                        : appt.status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/20 dark:border-red-900/30'
                        : appt.status === 'cancelled'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/20 dark:border-slate-700/50'
                        : 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200/20 dark:border-blue-900/30'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 border-t border-b border-slate-100 dark:border-slate-800/40 py-3.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Date: {new Date(appt.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Time: {appt.appointmentTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Priority: <span className="capitalize font-bold text-slate-700 dark:text-slate-300">{appt.priority}</span></span>
                  </div>
                  <div className="pt-1.5 flex items-start gap-2 text-slate-400 dark:text-slate-500 text-[11px] leading-relaxed">
                    <span className="font-bold uppercase text-[9px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded mr-1">Purpose</span>
                    <span className="line-clamp-2">{appt.purpose}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {/* Track Button */}
                {['pending', 'approved', 'in-progress'].includes(appt.status) && (
                  <button
                    onClick={() => handleOpenTracking(appt)}
                    className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Live Track
                  </button>
                )}

                {/* Cancel Button */}
                {['pending', 'approved'].includes(appt.status) && (
                  <button
                    onClick={() => handleCancelAppointment(appt._id)}
                    className="p-2.5 rounded-xl border border-red-200/50 dark:border-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors"
                    title="Cancel Booking"
                  >
                    <XCircle className="h-4.5 w-4.5" />
                  </button>
                )}

                {/* Feedback Button */}
                {appt.status === 'completed' && (
                  <button
                    onClick={() => handleOpenFeedback(appt)}
                    className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Rate Visit
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full glass-card p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No appointments found matching this tab filter or query.
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {trackingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setTrackingAppt(null)} />
          <div className="glass-card relative max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6 z-10">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-base">Appointment Tracking</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">ID: {trackingAppt._id}</p>
              </div>
              <button
                onClick={() => setTrackingAppt(null)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Close
              </button>
            </div>

            {trackingLoading ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Real-time Token Widget */}
                {trackingQueue && <TokenWidget queue={trackingQueue} appointment={trackingAppt} />}

                {/* Timeline Visualizer */}
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                  {/* Step 1: Pending */}
                  <div className="relative">
                    <span
                      className={`absolute -left-[31px] top-0.5 p-1 rounded-full border-2 ${
                        ['pending', 'approved', 'in-progress', 'completed'].includes(trackingAppt.status)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                    </span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Pending Approval</h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Your booking has been received and is waiting coordinator validation.
                    </p>
                  </div>

                  {/* Step 2: Approved */}
                  <div className="relative">
                    <span
                      className={`absolute -left-[31px] top-0.5 p-1 rounded-full border-2 ${
                        ['approved', 'in-progress', 'completed'].includes(trackingAppt.status)
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Approved</h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      The official accepted the appointment and assigned Token #{trackingAppt.tokenNumber}.
                    </p>
                  </div>

                  {/* Step 3: In Progress */}
                  <div className="relative">
                    <span
                      className={`absolute -left-[31px] top-0.5 p-1 rounded-full border-2 ${
                        ['in-progress', 'completed'].includes(trackingAppt.status)
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                    </span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">In Progress</h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Your meeting is active. Please enter the official's cabin.
                    </p>
                  </div>

                  {/* Step 4: Completed */}
                  <div className="relative">
                    <span
                      className={`absolute -left-[31px] top-0.5 p-1 rounded-full border-2 ${
                        trackingAppt.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Completed</h5>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Visit is marked complete. Feedback can now be submitted.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Rating Modal */}
      {feedbackAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setFeedbackAppt(null)} />
          <div className="glass-card relative max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6 z-10">
            <div className="text-center space-y-2">
              <div className="p-3 bg-primary-500/10 rounded-full w-fit mx-auto text-primary-500">
                <Star className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-base">Rate your Visit</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                With {feedbackAppt.personToMeet} ({feedbackAppt.department})
              </p>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {feedbackError && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <span>{feedbackError}</span>
                </div>
              )}

              {/* Stars Selection */}
              <div className="flex items-center justify-center gap-2.5 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    onMouseEnter={() => setFeedbackHover(star)}
                    onMouseLeave={() => setFeedbackHover(0)}
                    className="p-1 text-slate-300 dark:text-slate-800 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (feedbackHover || feedbackRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Comments & Feedback *
                </label>
                <textarea
                  required
                  rows="3"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="input-field py-2.5"
                  placeholder="Share details about your waiting experience and meeting details..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackAppt(null)}
                  className="flex-1 btn-secondary py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="flex-1 btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  {feedbackLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
