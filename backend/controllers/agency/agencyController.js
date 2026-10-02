// backend/controllers/agencyController.js
const bcrypt = require('bcryptjs');
const User = require('../../models/auth/User');

// ================================================================
// Helper — does this user have agency access?
// Admins always do. Otherwise plan 8 is required.
// ================================================================
function hasAgencyPlan(user) {
  if (!user) return false;

  // 👇 Admin bypass — always has access
  if (user.role === 'admin') return true;

  const plans = Array.isArray(user.planId) ? user.planId : [user.planId];
  return plans.includes(12);
}

// ================================================================
// GET /api/agency/members
// ================================================================
exports.getMembers = async (req, res) => {
  try {
    const ownerId = req.user.userId || req.user.id || req.user._id;

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!hasAgencyPlan(owner)) {
      return res.status(403).json({
        success: false,
        message: 'Agency plan required',
      });
    }

    const members = await User.find({ ownerId })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: members.length,
      agencyName: owner.agencyName || '',
      ownerPlan: owner.planId,
      members,
    });
  } catch (err) {
    console.error('getMembers error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// POST /api/agency/members
// body: { name, email, password }
// ================================================================
exports.addMember = async (req, res) => {
  try {
    const ownerId = req.user.userId || req.user.id || req.user._id;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!hasAgencyPlan(owner)) {
      return res.status(403).json({
        success: false,
        message: 'Agency plan required to add members',
      });
    }

    // Check email uniqueness
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create member
    const member = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      planId: [],
      planName: 'Free',
      isActive: true,
      role: 'user',
      ownerId: owner._id,
      agencyRole: 'member',
    });

    const memberSafe = member.toObject();
    delete memberSafe.password;

    res.json({ success: true, member: memberSafe });
  } catch (err) {
    console.error('addMember error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// DELETE /api/agency/members/:id
// ================================================================
exports.removeMember = async (req, res) => {
  try {
    const ownerId = req.user.userId || req.user.id || req.user._id;
    const memberId = req.params.id;

    // Find requester (to check if admin)
    const requester = await User.findById(ownerId);
    const isAdmin = requester?.role === 'admin';

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // 👇 Admins can remove any member. Non-admins can only remove their own.
    if (!isAdmin && String(member.ownerId) !== String(ownerId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own members',
      });
    }

    await User.findByIdAndDelete(memberId);
    res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    console.error('removeMember error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// PATCH /api/agency/members/:id/toggle
// ================================================================
exports.toggleMember = async (req, res) => {
  try {
    const ownerId = req.user.userId || req.user.id || req.user._id;
    const memberId = req.params.id;

    const requester = await User.findById(ownerId);
    const isAdmin = requester?.role === 'admin';

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // 👇 Admins can toggle any member. Non-admins only their own.
    if (!isAdmin && String(member.ownerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    member.isActive = !member.isActive;
    await member.save();

    res.json({
      success: true,
      isActive: member.isActive,
      message: member.isActive ? 'Member activated' : 'Member disabled',
    });
  } catch (err) {
    console.error('toggleMember error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================================================
// GET /api/agency/my-agency
// For members — returns info about their owner
// ================================================================
exports.getMyAgency = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;

    const me = await User.findById(userId).select('-password').lean();
    if (!me) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!me.ownerId) {
      return res.json({ success: true, isMember: false });
    }

    const owner = await User.findById(me.ownerId)
      .select('-password')
      .lean();

    res.json({
      success: true,
      isMember: true,
      owner: {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        agencyName: owner.agencyName,
        planId: owner.planId,
      },
    });
  } catch (err) {
    console.error('getMyAgency error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};