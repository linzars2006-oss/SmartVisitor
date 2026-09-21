const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

// Helper to map month number to name
const getMonthName = (monthNum) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[monthNum - 1] || 'Unknown';
};

// @desc    Get all appointments (Admin) with search & filters
// @route   GET /api/admin/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
  try {
    const { search, status, department } = req.query;
    let query = {};

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by department if provided
    if (department && department !== 'all') {
      query.department = department;
    }

    // Search query by visitor name, email, or phone
    if (search) {
      query.$or = [
        { visitorName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { personToMeet: { $regex: search, $options: 'i' } },
      ];
    }

    const appointments = await Appointment.find(query).sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Dashboard Stats Cards
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'visitor' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingCount = await Appointment.countDocuments({ status: 'pending' });
    const approvedCount = await Appointment.countDocuments({ status: 'approved' });
    const rejectedCount = await Appointment.countDocuments({ status: 'rejected' });
    const completedCount = await Appointment.countDocuments({ status: 'completed' });

    // Calculate dynamic average waiting time in minutes (creation to completion)
    const completedAppts = await Appointment.find({ status: 'completed' });
    let totalWaitTime = 0;
    completedAppts.forEach((appt) => {
      const wait = (appt.updatedAt - appt.createdAt) / (1000 * 60);
      totalWaitTime += wait;
    });
    const avgWaitTime = completedAppts.length ? Math.round(totalWaitTime / completedAppts.length) : 15;

    // Calculate Average Feedback Rating
    const feedbacks = await Feedback.find();
    const avgRating = feedbacks.length
      ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAppointments,
        pendingCount,
        approvedCount,
        rejectedCount,
        completedCount,
        avgWaitTime,
        avgRating,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Analytics Charts Data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalyticsData = async (req, res) => {
  try {
    // 1. Monthly appointments
    const monthlyRaw = await Appointment.aggregate([
      {
        $group: {
          _id: { $month: '$appointmentDate' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyStats = monthlyRaw.map((item) => ({
      month: getMonthName(item._id),
      appointments: item.count,
    }));

    // 2. Department distribution
    const departmentRaw = await Appointment.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    const departmentStats = departmentRaw.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    // 3. Status distribution
    const statusRaw = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = statusRaw.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    // 4. Peak appointment hours (aggregate by appointmentTime slot)
    const peakHoursRaw = await Appointment.aggregate([
      {
        $group: {
          _id: '$appointmentTime',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const peakHoursStats = peakHoursRaw.map((item) => ({
      time: item._id,
      count: item.count,
    }));

    // Find most visited department
    let mostVisitedDept = 'N/A';
    if (departmentStats.length > 0) {
      const sortedDepts = [...departmentStats].sort((a, b) => b.value - a.value);
      mostVisitedDept = sortedDepts[0].name;
    }

    res.json({
      success: true,
      data: {
        monthlyStats,
        departmentStats,
        statusStats,
        peakHoursStats,
        mostVisitedDept,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/admin/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing status' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update status
    appointment.status = status;
    
    // If appointment is approved and token is not assigned yet, we can recalculate it
    if (status === 'approved' && !appointment.tokenNumber) {
      const start = new Date(appointment.appointmentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(appointment.appointmentDate);
      end.setHours(23, 59, 59, 999);

      const dailyCount = await Appointment.countDocuments({
        personToMeet: appointment.personToMeet,
        appointmentDate: { $gte: start, $lte: end },
        status: { $in: ['approved', 'in-progress', 'completed'] },
      });
      appointment.tokenNumber = dailyCount + 1;
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all visitors (users with role visitor) with their histories
// @route   GET /api/admin/visitors
// @access  Private/Admin
const getAllVisitors = async (req, res) => {
  try {
    const visitors = await User.find({ role: 'visitor' }).select('-password').sort({ createdAt: -1 });
    
    // Enrich with appointment counts
    const enrichedVisitors = await Promise.all(
      visitors.map(async (visitor) => {
        const totalBooked = await Appointment.countDocuments({ userId: visitor._id });
        const completed = await Appointment.countDocuments({ userId: visitor._id, status: 'completed' });
        const pending = await Appointment.countDocuments({ userId: visitor._id, status: 'pending' });
        
        // Find last visit
        const lastAppt = await Appointment.findOne({ userId: visitor._id }).sort({ appointmentDate: -1 });

        return {
          _id: visitor._id,
          name: visitor.name,
          email: visitor.email,
          phone: visitor.phone,
          createdAt: visitor.createdAt,
          totalAppointments: totalBooked,
          completedAppointments: completed,
          pendingAppointments: pending,
          lastVisitDate: lastAppt ? lastAppt.appointmentDate : null,
        };
      })
    );

    res.json({ success: true, count: enrichedVisitors.length, data: enrichedVisitors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllAppointments,
  getDashboardStats,
  getAnalyticsData,
  updateAppointmentStatus,
  getAllVisitors,
};
