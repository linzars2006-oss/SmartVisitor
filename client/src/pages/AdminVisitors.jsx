import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Search,
  Users,
  Calendar,
  Clock,
  Eye,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  User,
  CheckCircle2,
} from 'lucide-react';

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State for visitor details
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorHistory, setVisitorHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchVisitors = async () => {
    try {
      setError('');
      const res = await api.get('/admin/visitors');
      if (res.data.success) {
        setVisitors(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load visitors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Filter visitors by search query
  useEffect(() => {
    if (search) {
      const q = search.toLowerCase();
      setFilteredVisitors(
        visitors.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.email.toLowerCase().includes(q) ||
            v.phone.includes(q)
        )
      );
    } else {
      setFilteredVisitors(visitors);
    }
  }, [visitors, search]);

  // View history handler
  const handleViewHistory = async (visitor) => {
    setSelectedVisitor(visitor);
    setHistoryLoading(true);
    try {
      // Fetch appointments log searching by visitor email to get specific logs
      const res = await api.get('/admin/appointments', {
        params: { search: visitor.email },
      });
      if (res.data.success) {
        setVisitorHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search visitors by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 border-b border-slate-200/50 dark:border-slate-800/50 uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Visitor Profile</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4 text-center">Total Booked</th>
                  <th className="px-6 py-4 text-center">Completed Visits</th>
                  <th className="px-6 py-4">Last Visit Date</th>
                  <th className="px-6 py-4 text-center">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
                {filteredVisitors.length > 0 ? (
                  filteredVisitors.map((visitor) => (
                    <tr
                      key={visitor._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold text-sm shrink-0">
                            {visitor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{visitor.name}</p>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px]">{visitor.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">
                        {visitor.phone}
                      </td>

                      {/* Total booked */}
                      <td className="px-6 py-4 text-center text-slate-800 dark:text-white font-extrabold text-sm">
                        {visitor.totalAppointments}
                      </td>

                      {/* Completed */}
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 font-extrabold text-xs">
                          {visitor.completedAppointments} Completed
                        </span>
                      </td>

                      {/* Last Visit */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold">
                        {visitor.lastVisitDate ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(visitor.lastVisitDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No previous visits</span>
                        )}
                      </td>

                      {/* View Button */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewHistory(visitor)}
                          className="p-2 border border-slate-200/50 dark:border-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"
                          title="View History Details"
                        >
                          <Eye className="h-4 w-4 shrink-0" /> Log
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 dark:text-slate-500">
                      No visitors found matching search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visitor Details History Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedVisitor(null)} />
          <div className="glass-card relative max-w-2xl w-full rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6 z-10 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-black text-base">
                  {selectedVisitor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">Visitor History Log</h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                    Profile: {selectedVisitor.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5">
              {/* Profile Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Email Address</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" /> {selectedVisitor.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Phone Contact</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" /> {selectedVisitor.phone}
                  </p>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Appointment Records ({visitorHistory.length})
                </h5>

                {historyLoading ? (
                  <div className="h-24 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
                  </div>
                ) : visitorHistory.length > 0 ? (
                  <div className="space-y-3">
                    {visitorHistory.map((appt) => (
                      <div
                        key={appt._id}
                        className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900/60 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-white text-xs">
                              Meeting with {appt.personToMeet}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 uppercase">
                              {appt.department}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(appt.appointmentDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {appt.appointmentTime}</span>
                            {appt.tokenNumber && <span className="text-primary-500 font-bold">Token: #{appt.tokenNumber}</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal pt-1 pl-1 border-l border-slate-200 dark:border-slate-800">
                            <strong>Purpose: </strong> {appt.purpose}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center text-xs py-4">No appointment history logged.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisitors;
