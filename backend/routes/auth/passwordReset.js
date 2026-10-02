const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../../models/auth/User');
const PasswordReset = require('../../models/auth/PasswordReset');
const { sendPasswordResetEmail } = require('../../utils/emailService');

// ============================================================
// 📧 REQUEST PASSWORD RESET
// ============================================================

router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // ✅ Don't reveal if user exists or not (security)
      return res.json({ 
        message: 'If an account exists, a reset link has been sent' 
      });
    }

    // ✅ Delete old tokens
    await PasswordReset.deleteMany({ userId: user._id });

    // ✅ Generate token
    const token = crypto.randomBytes(32).toString('hex');
    
    // ✅ Save token (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordReset.create({
      userId: user._id,
      token,
      expiresAt,
      used: false,
    });

    // ✅ Send email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    
    try {
      await sendPasswordResetEmail(user, resetUrl);
      console.log(`✅ Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // ✅ Still return success to prevent email enumeration
    }

    res.json({ 
      success: true,
      message: 'If an account exists, a reset link has been sent' 
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      message: 'Failed to process request',
      error: error.message 
    });
  }
});

// ============================================================
// 🔍 VERIFY RESET TOKEN
// ============================================================

router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const reset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }

    res.json({ 
      success: true,
      message: 'Token is valid' 
    });

  } catch (error) {
    console.error('❌ Verify token error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify token' 
    });
  }
});

// ============================================================
// 🔄 RESET PASSWORD
// ============================================================

router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Token and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    const reset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!reset) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }

    // ✅ Update user password
    const user = await User.findById(reset.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // ✅ Hash and save new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // ✅ Mark token as used
    reset.used = true;
    await reset.save();

    // ✅ Delete all reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    console.log(`✅ Password reset successful for: ${user.email}`);

    res.json({ 
      success: true,
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reset password',
      error: error.message 
    });
  }
});

module.exports = router;