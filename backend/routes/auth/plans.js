const express = require('express');
const router = express.Router();
const Plan = require('../../models/auth/Plan');
const auth = require('../../middleware/auth');

// Get all plans
router.get('/', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'active' }).sort({ planId: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
});

// Get plan by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ planId: req.params.id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ message: 'Failed to fetch plan' });
  }
});

module.exports = router;