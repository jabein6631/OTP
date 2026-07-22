require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const connectDB = require("./db");
const authRoutes = require("./authRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// ── Middleware ──────────────────────────────────
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? false // same origin in production — no CORS needed
      : process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Rate limiter: max 10 OTP requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limit only to OTP sending
app.use("/api/auth/send-otp", otpLimiter);

// ── Routes ──────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Serve Frontend (React build) ─────────────────
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// All non-API routes serve the React app
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ── 404 Handler ─────────────────────────────────
// (kept above the catch-all, only reached for unmatched API routes)


// ── Global Error Handler ─────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start Server ─────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
