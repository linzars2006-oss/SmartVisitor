const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createAppointment)
  .get(protect, getUserAppointments);

router.route('/:id')
  .get(protect, getAppointmentById);

router.route('/:id/cancel')
  .delete(protect, cancelAppointment);

module.exports = router;
