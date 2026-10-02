// backend/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const subscriptionController = require('../../controllers/auth/subscriptionController');

// Get user subscription details
router.get('/my-subscription', auth, subscriptionController.getSubscriptionDetails);

// Get plan features by plan ID
router.get('/plan-features/:planId', auth, subscriptionController.getPlanFeatures);

module.exports = router;