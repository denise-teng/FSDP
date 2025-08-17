import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { redis } from '../lib/redis.js';
import { sendVerificationEmail } from '../lib/sendEmail.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../lib/sendPasswordResetEmail.js';
import passport from 'passport';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ✅ STEP 1: Signup — Send verification email
export const initiateSignup = async (req, res) => {
  const { name, email, password } = req.body;

  const userExist = await User.findOne({ email });


  const hashedPassword = await bcrypt.hash(password, 10);
  const payload = { name, email, password: hashedPassword }; // ❌ No status field
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');

  const verifyUrl = `http://localhost:5173/verify-email?data=${encoded}`;

  try {
    await sendVerificationEmail({
      to: email,
      token: encoded,
      name,
    });

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Email sending failed:', error.response?.body || error.message);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
};


export const completeSignup = async (req, res) => {
  try {
    const { data } = req.query;
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString());

    const { name, email, password } = decoded;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    

    const newUser = new User({
      name,
      email,
      password
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);
    await storeRefreshToken(newUser._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({ message: 'Account verified and created' });
  } catch (err) {
    console.error('Complete Signup Error:', err.message);
 
  }
};



// ✅ Login (unchanged)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.log('Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Logout
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.log('Logout error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (storedToken !== refreshToken) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.log('Refresh error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get current user profile
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Forgot Password - Send Email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token in Redis (expires in 15 mins)
    await redis.set(`reset_token:${resetTokenHash}`, user._id.toString(), 'EX', 15 * 60);

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`; // adjust for prod

    await sendPasswordResetEmail({
      to: user.email,
      resetLink
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
};

// ✅ Reset Password - Verify token and update password
export const resetPassword = async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await redis.get(`reset_token:${tokenHash}`);

    if (!userId) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    await redis.del(`reset_token:${tokenHash}`);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: err.message || 'Failed to reset password' });
  }
};

// ✅ Get user by email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Get user by email error:', err.message);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};


// Add this to your auth controller or a separate user controller
export const getUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find(); // Assuming you're using Mongoose to interact with MongoDB
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
};
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET, 
  process.env.GOOGLE_CALLBACK_URL  
);

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        isVerified: true,
        isGoogleAuth: true,
        googleId,
        role: 'customer'
      });
    } else if (!user.isGoogleAuth) {
      user.isGoogleAuth = true;
      user.googleId = googleId;
      await user.save();
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect to frontend
  res.redirect(user.role === 'admin'
  ? `http://localhost:5173/admin-home`
  : `http://localhost:5173/user-home`
);

  } catch (error) {
    console.error('Google callback failed:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

