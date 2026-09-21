import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Search,
  Building,
  Check,
  X,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  User,
  Filter,
} from 'lucide-react';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      setError('');
      const res = await api.get('/admin/appointments', {
        params: {
          search,
          status: statusFilter,
          department: deptFilter,
        },
      });

      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load appointments log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [search, statusFilter, deptFilter]);

  // Update status handler
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/admin/appointments/${id}/status`, { status });
      if (res.data.success) {
        // Refresh local items
        fetchAppointments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const departments = ['Principal Office', 'Computer Science', 'Information Technology', 'Administration', 'Accounts'];

  const statuses = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Pending Approval', value: 'pending' },
    { label: 'Approved (Queued)', value: 'approved' },
    { label: 'Active (In Progress)', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled by User', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by visitor name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Dept Filter */}
        <div className="relative">
          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input-field pl-10 appearance-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-10 appearance-none cursor-pointer"
          >
            {statuses.map((stat) => (
              <option key={stat.value} value={stat.value}>
                {stat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List */}
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
                  <th className="px-6 py-4">Visitor Contact</th>
                  <th className="px-6 py-4">Meeting Details</th>
                  <th className="px-6 py-4">Scheduled Slot</th>
                  <th className="px-6 py-4 text-center">Token</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
                {appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <tr
                      key={appt._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      {/* Visitor Name & Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{appt.visitorName}</p>
                          <p className="text-slate-400 dark:text-slate-500 text-[10px]">{appt.email}</p>
                          <p className="text-slate-400 dark:text-slate-500 text-[10px]">{appt.phone}</p>
                        </div>
                      </td>

                      {/* Official to Meet */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 dark:text-white text-xs">{appt.personToMeet}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">
                            {appt.department}
                          </span>
                        </div>
                      </td>

                      {/* Scheduled Slot */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-slate-500 dark:text-slate-400">
                          <p className="flex items-center gap-1.5 font-bold">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {new Date(appt.appointmentDate).toLocaleDateString()}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px]">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {appt.appointmentTime}
                          </p>
                        </div>
                      </td>

                      {/* Token */}
                      <td className="px-6 py-4 text-center">
                        {appt.tokenNumber ? (
                          <span className="px-2 py-1 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 font-extrabold text-sm">
                            #{appt.tokenNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                      </td>

                      {/* Admin Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {appt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(appt._id, 'approved')}
                                className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                                title="Approve Request"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appt._id, 'rejected')}
                                className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                                title="Reject Request"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {appt.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'in-progress')}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors text-[10px] font-bold flex items-center gap-1 shadow-sm uppercase tracking-wider"
                              title="Start Session"
                            >
                              <Play className="h-3 w-3 fill-current" /> Start Visit
                            </button>
                          )}

                          {appt.status === 'in-progress' && (
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'completed')}
                              className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors text-[10px] font-bold flex items-center gap-1 shadow-sm uppercase tracking-wider"
                              title="Mark Session Complete"
                            >
                              <CheckCircle className="h-3 w-3" /> Complete
                            </button>
                          )}

                          {['completed', 'rejected', 'cancelled'].includes(appt.status) && (
                            <span className="text-xs text-slate-400 italic">No Actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 dark:text-slate-500">
                      No appointments matching query filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
