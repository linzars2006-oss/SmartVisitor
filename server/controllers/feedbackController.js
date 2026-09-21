const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');

// @desc    Submit feedback for an appointment
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide appointment ID, rating and comment' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify it belongs to the user
    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit feedback for this appointment' });
    }

    // Verify appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for completed appointments' });
    }

    // Check if feedback already submitted
    const feedbackExists = await Feedback.findOne({ appointmentId });
    if (feedbackExists) {
      return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this appointment' });
    }

    const feedback = await Feedback.create({
      appointmentId,
      visitorId: req.user._id,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all feedback with appointment details
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedbackList = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('visitorId', 'name email phone')
      .populate({
        path: 'appointmentId',
        select: 'department personToMeet appointmentDate appointmentTime status',
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackList,
};
