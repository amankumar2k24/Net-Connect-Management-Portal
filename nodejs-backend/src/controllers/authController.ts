import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendVerificationEmail, sendPasswordResetEmail, sendOtpEmail } from '../utils/emailService';

// Generate JWT token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(
    { id },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    } as SignOptions
  );
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      emailVerificationToken,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
    return;
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
    return;
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
    return;
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link.',
      });
    }

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, resetPasswordToken);

    res.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link.',
    });
    return;
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
    });
    return;
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
    return;
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
    });
    return;
  }
};

export const sendOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN!) || 600000); // 10 minutes

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otpCode);

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
    return;
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP generation',
    });
    return;
  }
};

export const verifyOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.isEmailVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
    return;
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
    });
    return;
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
    return;
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification',
    });
    return;
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
    return;
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
    return;
  }
};