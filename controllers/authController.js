import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTP, generateOTP } from "../utils/emailService.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register user with OTP
export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      otp,
      otpExpires
    });

    // Send OTP email
    try {
      await sendOTP(email, otp);
      
      res.status(201).json({
        success: true,
        message: "Registration successful. OTP sent to your email.",
        userId: user._id,
        email: user.email
      });
    } catch (emailError) {
      console.error("OTP email failed:", emailError);
      res.status(201).json({
        success: true,
        message: "Registration successful but OTP email failed. Please try resending OTP.",
        userId: user._id,
        email: user.email
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Email and OTP are required" 
      });
    }

    const user = await User.findOne({ 
      email,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "OTP is invalid or has expired" 
      });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      // Increment OTP attempts
      user.otpAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.otpAttempts >= 5) {
        user.status = "suspended";
        await user.save();
        return res.status(400).json({ 
          success: false,
          message: "Too many failed attempts. Account suspended." 
        });
      }
      
      await user.save();
      
      return res.status(400).json({ 
        success: false,
        message: "Invalid OTP",
        attemptsLeft: 5 - user.otpAttempts
      });
    }

    // OTP is correct - verify user
    user.isEmailVerified = true;
    user.status = "active";
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully!",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during OTP verification" 
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false,
        message: "Email is already verified" 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0; // Reset attempts
    await user.save();

    // Send OTP email
    try {
      await sendOTP(email, otp);
      res.json({ 
        success: true,
        message: "New OTP sent successfully" 
      });
    } catch (emailError) {
      console.error("OTP email failed:", emailError);
      res.status(500).json({ 
        success: false,
        message: "Failed to send OTP email" 
      });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while resending OTP" 
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        success: false,
        message: "Please verify your email with OTP before logging in",
        needsVerification: true,
        userId: user._id,
        email: user.email
      });
    }
    
    if (user.status !== "active") {
      return res.status(401).json({ 
        success: false,
        message: "Your account is not active. Please contact support." 
      });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login" 
    });
  }
};