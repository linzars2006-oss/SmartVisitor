const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visitorName: {
      type: String,
      required: [true, 'Please add visitor name'],
    },
    email: {
      type: String,
      required: [true, 'Please add email'],
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
    },
    department: {
      type: String,
      required: [true, 'Please select department'],
    },
    personToMeet: {
      type: String,
      required: [true, 'Please select person to meet'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Please select appointment date'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Please select appointment time'],
    },
    purpose: {
      type: String,
      required: [true, 'Please state purpose of visit'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    tokenNumber: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Keep compound index to help prevent duplicate bookings for the same slot
appointmentSchema.index({ personToMeet: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: false });

module.exports = mongoose.model('Appointment', appointmentSchema);
