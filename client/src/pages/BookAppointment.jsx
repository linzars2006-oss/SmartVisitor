import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, User, Mail, Phone, Building, Users, Clock, AlertTriangle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    visitorName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: '',
    personToMeet: '',
    appointmentDate: '',
    appointmentTime: '',
    purpose: '',
    priority: 'medium',
    notes: '',
  });

  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Define departments & officials mapping
  const departmentMapping = {
    'Principal Office': ['Dr. A. K. Smith (Principal)'],
    'Computer Science': ['Prof. John Doe (HOD CS)', 'Dr. Alan Turing (Sr. Professor)'],
    'Information Technology': ['Dr. Sarah Connor (HOD IT)', 'Mr. Bill Gates (Sr. Lecturer)'],
    'Administration': ['Mr. Robert Brown (Admin Head)', 'Mrs. Jane Doe (Admin Assistant)'],
    'Accounts': ['Mrs. Lisa Ray (Accounts Head)', 'Mr. Warren Buffet (Treasurer)'],
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
    '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
    '04:30 PM'
  ];

  // Update officials list when department changes
  useEffect(() => {
    if (formData.department) {
      setOfficials(departmentMapping[formData.department] || []);
      setFormData((prev) => ({ ...prev, personToMeet: departmentMapping[formData.department]?.[0] || '' }));
    } else {
      setOfficials([]);
      setFormData((prev) => ({ ...prev, personToMeet: '' }));
    }
  }, [formData.department]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { visitorName, email, phone, department, personToMeet, appointmentDate, appointmentTime, purpose } = formData;

    // Local validation
    if (!visitorName || !email || !phone || !department || !personToMeet || !appointmentDate || !appointmentTime || !purpose) {
      setError('Please fill in all required fields');
      return;
    }

    const inputDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (inputDate < today) {
      setError('Cannot book appointments in past dates');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/appointments', formData);
      if (res.data.success) {
        setSuccess('Appointment requested successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date string for input 'min' attribute
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Appointment Form</p>
        <h3 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white">Schedule an Office Visit</h3>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Section 1: Visitor details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/40 pb-2">
              1. Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Visitor Name *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    name="visitorName"
                    type="text"
                    required
                    value={formData.visitorName}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Email Address *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Phone Number *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    name="phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Meeting details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/40 pb-2">
              2. Appointment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Department *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="h-4 w-4" />
                  </div>
                  <select
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="input-field pl-10 appearance-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {Object.keys(departmentMapping).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Official to Meet *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <select
                    name="personToMeet"
                    required
                    disabled={!formData.department}
                    value={formData.personToMeet}
                    onChange={handleChange}
                    className="input-field pl-10 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Choose Official</option>
                    {officials.map((official) => (
                      <option key={official} value={official}>
                        {official}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Appointment Date *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    name="appointmentDate"
                    type="date"
                    required
                    min={todayStr}
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Time Slot *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <select
                    name="appointmentTime"
                    required
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    className="input-field pl-10 appearance-none cursor-pointer"
                  >
                    <option value="">Select Time Slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Priority Level
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="input-field pl-10 appearance-none cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Purpose */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/40 pb-2">
              3. Purpose & Notes
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Purpose of Visit *
                </label>
                <textarea
                  name="purpose"
                  required
                  rows="3"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="input-field py-3"
                  placeholder="Explain why you want to meet the official..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field py-3"
                  placeholder="Any other helpful details (e.g. references, documents, etc.)"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary py-3 px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary py-3 px-8 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
