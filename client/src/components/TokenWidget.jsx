import React from 'react';
import { Users, Clock, Award, Star } from 'lucide-react';

const TokenWidget = ({ queue, appointment }) => {
  if (!appointment || !queue) return null;

  const { currentToken, userToken, peopleAhead } = queue;
  const isApproved = appointment.status === 'approved';
  const isInProgress = appointment.status === 'in-progress';
  const isCompleted = appointment.status === 'completed';

  // Calculate some simple progress percentage for the bar
  let progressPercentage = 0;
  if (isCompleted) {
    progressPercentage = 100;
  } else if (isInProgress) {
    progressPercentage = 90;
  } else if (isApproved && userToken > 0) {
    const totalBehind = Math.max(0, userToken - currentToken);
    if (totalBehind === 0) {
      progressPercentage = 80;
    } else {
      progressPercentage = Math.min(80, Math.max(10, Math.round((currentToken / userToken) * 100)));
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-indigo-500/5 pointer-events-none" />

      <div className="relative space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-base">Active Ticket</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              With {appointment.personToMeet} ({appointment.department})
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isInProgress
                ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30'
                : isCompleted
                ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-900/30'
                : isApproved
                ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
            }`}
          >
            {appointment.status}
          </span>
        </div>

        {/* Token Number stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/20 shadow-inner">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Current Session
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {currentToken > 0 ? `#${currentToken}` : '--'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 shadow-md">
            <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider block mb-1">
              Your Token
            </span>
            <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
              #{userToken || '--'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/20 shadow-inner">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">
              People Ahead
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {appointment.status === 'pending' ? '--' : peopleAhead}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {(isApproved || isInProgress || isCompleted) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>Queue Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Help Text */}
        <div className="flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-900/40">
          <Clock className="h-4.5 w-4.5 text-primary-500 shrink-0 mt-0.5 animate-pulse" />
          <p className="leading-relaxed">
            {isInProgress ? (
              <span className="font-semibold text-slate-800 dark:text-white">
                It's your turn! Please enter the cabin.
              </span>
            ) : isCompleted ? (
              <span>Your appointment is complete. Please share your rating feedback.</span>
            ) : isApproved ? (
              <span>
                Please wait in the lounge. You have{' '}
                <strong className="text-slate-800 dark:text-white">{peopleAhead} person(s)</strong> ahead
                of you in the queue.
              </span>
            ) : (
              <span>Your appointment is pending approval by the office coordinator.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenWidget;
