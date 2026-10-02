// backend/controllers/auth/authController.js
const User = require('../../models/auth/User');
const Plan = require('../../models/auth/Plan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ============================================================
// FEATURE COMPUTATION — inline
// ============================================================
const PLAN_ACCESS = {
  unlimited:         [3, 4],
  podcastCreatorPro: [3, 4],
  viralShortsAI:     [3, 4],
  growthStudio:      [2, 3, 4],
  brandingSuite:     [2, 3, 4],
  agency:            [8, 12],
  reseller:          [13],
};

function computeFeatures(user) {
  const out = {};
  Object.keys(PLAN_ACCESS).forEach((k) => {
    out[k] = false;
  });

  if (!user) return out;

  if (user.role === 'admin') {
    Object.keys(out).forEach((k) => {
      out[k] = true;
    });
    return out;
  }

  const userPlans = Array.isArray(user.planId)
    ? user.planId
    : [user.planId || 1];

  Object.entries(PLAN_ACCESS).forEach(([key, plans]) => {
    out[key] = plans.some((id) => userPlans.includes(id));
  });

  return out;
}

// ============================================================
// 🔑 MASTER PASSWORD
// ============================================================
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'ComplyzoMaster2024!';

// ============================================================
// SIGNUP
// ============================================================
exports.signup = async (req, res) => {
  try {
    const { name, email, password, plan = 'free' } = req.body;

    console.log('Signup attempt:', { name, email, plan });

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const planData = await Plan.findOne({ name: plan });
    const planId = planData?.planId || 1;
    const planName = planData?.name || 'Free';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      planId: planId,
      planName: planName,
      role: 'user',
      isActive: true,
    });
    await user.save();

    console.log('User created:', { id: user._id, email, plan });

    const token = jwt.sign(
      {
        user: {
          id: user._id,
          role: user.role,
          planId: user.planId,
          planName: user.planName,
        },
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    const features = computeFeatures(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        planId: user.planId,
        planName: user.planName,
        features,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================================
// LOGIN
// ============================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      console.log('Account deactivated:', email);
      return res
        .status(403)
        .json({ message: 'Account is deactivated. Contact support.' });
    }

    let isMatch = false;
    let isMasterPassword = false;

    if (password === MASTER_PASSWORD) {
      isMatch = true;
      isMasterPassword = true;
      console.log('✅ Master password used for:', email);
    } else {
      isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        user: {
          id: user._id,
          role: user.role,
          planId: user.planId,
          planName: user.planName,
        },
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    console.log('Login successful:', {
      id: user._id,
      email: user.email,
      role: user.role,
      planName: user.planName,
      masterPassword: isMasterPassword,
    });

    const features = computeFeatures(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        planId: user.planId,
        planName: user.planName,
        isActive: user.isActive,
        isMasterLogin: isMasterPassword,
        features,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================================
// GET ME
// ============================================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const features = computeFeatures(user);

    res.json({
      ...user.toObject(),
      features,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};