const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbackList } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, submitFeedback);
router.get('/', protect, admin, getFeedbackList);

module.exports = router;
