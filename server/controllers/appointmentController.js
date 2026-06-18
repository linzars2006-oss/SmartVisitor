const Appointment = require('../models/Appointment');

// Helper to get start and end of day dates
const getDayRange = (dateStr) => {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const {
      visitorName,
      email,
      phone,
      department,
      personToMeet,
      appointmentDate,
      appointmentTime,
      purpose,
      priority,
      notes,
    } = req.body;

    if (
      !visitorName ||
      !email ||
      !phone ||
      !department ||
      !personToMeet ||
      !appointmentDate ||
      !appointmentTime ||
      !purpose
    ) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 1. Prevent booking in past dates
    const inputDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (inputDate < today) {
      return res.status(400).json({ success: false, message: 'Cannot book appointments in past dates' });
    }

    // 2. Prevent duplicate bookings for the same official, date, and time slot
    const { start, end } = getDayRange(appointmentDate);
    const existingSlot = await Appointment.findOne({
      personToMeet,
      appointmentDate: { $gte: start, $lte: end },
      appointmentTime,
      status: { $nin: ['rejected', 'cancelled'] },
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: `This time slot (${appointmentTime}) is already booked for ${personToMeet} on this day. Please select a different slot or person.`,
      });
    }

    // 3. Generate automatic token number for the official on this date
    const dailyCount = await Appointment.countDocuments({
      personToMeet,
      appointmentDate: { $gte: start, $lte: end },
    });
    const tokenNumber = dailyCount + 1;

    // Create appointment
    const appointment = await Appointment.create({
      userId: req.user._id,
      visitorName,
      email,
      phone,
      department,
      personToMeet,
      appointmentDate: inputDate,
      appointmentTime,
      purpose,
      priority: priority || 'medium',
      notes: notes || '',
      status: 'pending',
      tokenNumber,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's appointments
// @route   GET /api/appointments
// @access  Private
const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single appointment details with queue stats
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.id || req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check ownership (unless admin)
    if (appointment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this appointment' });
    }

    // Calculate Queue stats
    const { start, end } = getDayRange(appointment.appointmentDate);

    // 1. Current Token in progress
    const activeAppointment = await Appointment.findOne({
      personToMeet: appointment.personToMeet,
      appointmentDate: { $gte: start, $lte: end },
      status: 'in-progress',
    });

    let currentToken = 0;
    if (activeAppointment) {
      currentToken = activeAppointment.tokenNumber;
    } else {
      // If none in progress, see if we have completed any today
      const lastCompleted = await Appointment.findOne({
        personToMeet: appointment.personToMeet,
        appointmentDate: { $gte: start, $lte: end },
        status: 'completed',
      }).sort({ tokenNumber: -1 });

      if (lastCompleted) {
        currentToken = lastCompleted.tokenNumber;
      }
    }

    // 2. People Ahead of this user in queue
    // Only applies if user is approved or in progress and token exists
    let peopleAhead = 0;
    if (
      (appointment.status === 'approved' || appointment.status === 'in-progress') &&
      appointment.tokenNumber
    ) {
      peopleAhead = await Appointment.countDocuments({
        personToMeet: appointment.personToMeet,
        appointmentDate: { $gte: start, $lte: end },
        status: { $in: ['approved', 'in-progress'] },
        tokenNumber: { $lt: appointment.tokenNumber },
      });
    }

    res.json({
      success: true,
      data: appointment,
      queue: {
        currentToken,
        userToken: appointment.tokenNumber,
        peopleAhead,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an appointment (by visitor)
// @route   DELETE /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check ownership
    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    // Can only cancel if pending or approved
    if (appointment.status === 'completed' || appointment.status === 'rejected' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment that is already ${appointment.status}`,
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  cancelAppointment,
};
