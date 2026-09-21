const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getDashboardStats,
  getAnalyticsData,
  updateAppointmentStatus,
  getAllVisitors,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// Apply protect and admin to all routes
router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalyticsData);
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/visitors', getAllVisitors);

module.exports = router;
