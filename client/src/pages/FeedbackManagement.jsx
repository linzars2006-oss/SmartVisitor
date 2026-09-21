import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Star, MessageSquare, AlertCircle, Loader2, Calendar, User, UserCheck } from 'lucide-react';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  const fetchFeedbacks = async () => {
    try {
      setError('');
      const res = await api.get('/feedback');
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load user feedback.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Filter feedbacks based on stars selected
  useEffect(() => {
    if (ratingFilter === 'all') {
      setFilteredFeedbacks(feedbacks);
    } else {
      const stars = parseInt(ratingFilter);
      setFilteredFeedbacks(feedbacks.filter((f) => f.rating === stars));
    }
  }, [feedbacks, ratingFilter]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  // Calculate local feedback ratings metrics
  const totalReviews = feedbacks.length;
  const avgRating = totalReviews
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const starsSplit = [5, 4, 3, 2, 1].map((star) => {
    const count = feedbacks.filter((f) => f.rating === star).length;
    const percentage = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Stars Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            Average Rating
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800 dark:text-white leading-none">
              {avgRating}
            </span>
            <span className="text-slate-400 text-sm">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${s <= Math.round(avgRating) ? 'fill-current' : 'opacity-30'}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Based on {totalReviews} reviews</span>
        </div>

        {/* Rating Breakdown Bar Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 md:col-span-2 space-y-2 text-xs">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">
            Reviews Breakdown
          </span>
          <div className="space-y-2">
            {starsSplit.map((row) => (
              <div key={row.star} className="flex items-center gap-3.5 font-semibold">
                <span className="w-10 text-right text-slate-500 dark:text-slate-400 shrink-0">
                  {row.star} Star
                </span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-400 dark:text-slate-500 shrink-0">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Grid Header */}
      <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
        <h4 className="font-bold text-slate-800 dark:text-white text-base">Visitor Comments</h4>
        
        {/* Rating Filter Dropdown */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="input-field max-w-[160px] py-2 px-3 appearance-none cursor-pointer"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars only</option>
          <option value="4">4 Stars only</option>
          <option value="3">3 Stars only</option>
          <option value="2">2 Stars only</option>
          <option value="1">1 Star only</option>
        </select>
      </div>

      {/* Comments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((fb) => (
            <div
              key={fb._id}
              className="glass-card rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Star rating and date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4.5 w-4.5 ${star <= fb.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-800'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Text comment */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium pl-1 border-l-2 border-primary-500">
                "{fb.comment}"
              </p>

              {/* Author and Official details */}
              <div className="flex items-center justify-between bg-slate-100/40 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-900/60 text-[10px] font-bold">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-slate-800 dark:text-slate-200 leading-none">{fb.visitorId?.name}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-normal leading-none">{fb.visitorId?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-right">
                  <div className="flex flex-col">
                    <span className="text-slate-700 dark:text-slate-300 leading-none">Met: {fb.appointmentId?.personToMeet}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-normal leading-none uppercase">{fb.appointmentId?.department}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full glass-card p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No feedback entries matches criteria filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
