const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const OTP = require("./OTP");
const User = require("./User");
const sendOTPEmail = require("./emailService");
const sendOTPSms = require("./smsService");

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ──────────────────────────────────────────────
//  POST /api/auth/send-otp
//  Body: { email } OR { phone }
// ──────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone number is required." });
    }

    // Basic email format check
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
      }
    }

    // Basic phone format check — must start with + and contain 7-15 digits
    if (phone) {
      const phoneRegex = /^\+[1-9]\d{6,14}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          message: "Enter a valid phone number with country code (e.g. +91xxxxxxxxxx).",
        });
      }
    }

    const identifier = email || phone;
    const field = email ? "email" : "phone";

    const otp = generateOTP();

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    // Delete previous OTP for this identifier (previous OTP becomes invalid)
    await OTP.deleteMany({ [field]: identifier });

    await OTP.create({
      [field]: identifier,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send via correct channel
    if (email) {
      await sendOTPEmail(email, otp);
    } else {
      await sendOTPSms(phone, otp);
    }

    res.json({
      success: true,
      message: `OTP sent successfully to your ${email ? "email" : "phone"}.`,
    });
  } catch (error) {
    console.error("sendOTP error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// ──────────────────────────────────────────────
//  POST /api/auth/verify-otp
//  Body: { email, otp } OR { phone, otp }
// ──────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required." });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone number is required." });
    }

    const identifier = email || phone;
    const field = email ? "email" : "phone";

    const record = await OTP.findOne({ [field]: identifier });

    if (!record) {
      return res.status(400).json({ message: "OTP not found. Please request a new one." });
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      await OTP.deleteMany({ [field]: identifier });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Compare against hashed OTP
    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Find or create user
    let user = await User.findOne({ [field]: identifier });
    if (!user) {
      user = await User.create({ [field]: identifier });
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Delete OTP after successful verification
    await OTP.deleteMany({ [field]: identifier });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email || null,
        phone: user.phone || null,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

// ──────────────────────────────────────────────
//  GET /api/auth/me  (protected)
// ──────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
