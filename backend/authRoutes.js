const express = require("express");
const router = express.Router();

const { sendOTP, verifyOTP, getMe } = require("./authController");
const authMiddleware = require("./authMiddleware");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Protected route — requires valid JWT
router.get("/me", authMiddleware, getMe);

module.exports = router;
