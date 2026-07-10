const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/email');

// Helper to generate access tokens
const getAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'super_secret_flowwise_access_token_key_2026_jwt_token',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

// Helper to generate refresh tokens
const getRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'super_secret_flowwise_refresh_token_key_2026_jwt_token',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, designation, skills } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already registered with this email' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      designation,
      skills: skills || [],
      verificationToken,
      isVerified: false, // Default false until verified
    });

    // Send verification email (mock link log to console)
    const protocol = req.protocol;
    const host = req.get('host');
    const verifyUrl = `${protocol}://${host}/api/auth/verify/${verificationToken}`;
    const clientVerifyUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;

    const message = `Welcome to FlowWise AI. Please verify your email by clicking: \n\n ${clientVerifyUrl} (Client Route)\n\nOr backend API route: ${verifyUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'FlowWise AI - Verify Your Account',
        message: message,
        html: `<p>Thank you for registering at FlowWise AI. Please click the button below to verify your email.</p>
               <a href="${clientVerifyUrl}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account</a>
               <p>If the link above doesn't work, copy and paste this into your browser: <br>${clientVerifyUrl}</p>`
      });
    } catch (err) {
      console.error('Email error: ', err);
    }

    // Create Audit Log
    await AuditLog.create({
      user: user._id,
      action: 'USER_REGISTERED',
      details: `User registered with email ${email} and role ${user.role}`,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification email has been sent.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password').populate('department');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account active
    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is suspended or inactive. Contact administration.' });
    }

    // Check password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = getAccessToken(user);
    const refreshToken = getRefreshToken(user);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Create Audit Log
    await AuditLog.create({
      user: user._id,
      action: 'USER_LOGIN',
      details: `User logged in with role ${user.role}`,
    });

    res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        manager: user.manager,
        skills: user.skills,
        leaveBalance: user.leaveBalance,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & invalidate refresh token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }

    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: 'USER_LOGOUT',
      details: 'User logged out successfully',
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    // Check token exists in database
    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    // Verify refresh token
    jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'super_secret_flowwise_refresh_token_key_2026_jwt_token', (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      // Generate new access token
      const newAccessToken = getAccessToken(user);
      res.status(200).json({
        success: true,
        token: newAccessToken,
      });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    // Log action
    await AuditLog.create({
      user: user._id,
      action: 'USER_EMAIL_VERIFIED',
      details: `User email (${user.email}) verified`,
    });

    res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set hashed token and expiry in DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create client URL
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const message = `You requested a password reset at FlowWise AI. Please click: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'FlowWise AI - Password Reset Request',
        message: message,
        html: `<p>We received a request to reset your password. Click the button below to update your password (expires in 10 minutes).</p>
               <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
               <p>If the button doesn't work, copy-paste this link: <br>${resetUrl}</p>`
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Reset email could not be sent' });
    }

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log action
    await AuditLog.create({
      user: user._id,
      action: 'USER_PASSWORD_RESET',
      details: 'User password updated successfully via email link',
    });

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department')
      .populate({ path: 'manager', select: 'name email designation role' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};
