// backend/middleware/requireFeature.js
const { hasFeature } = require('../config/features');
const User = require('../models/auth/User');

module.exports = (featureKey) => async (req, res, next) => {
  try {
    const userId =
      req.user?.userId ||
      req.user?.id ||
      req.user?._id ||
      req.user?.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authenticated' });
    }

    if (!hasFeature(user, featureKey)) {
      return res.status(403).json({
        success: false,
        message: `Feature "${featureKey}" not available on your plan`,
      });
    }

    next();
  } catch (err) {
    console.error('requireFeature error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};