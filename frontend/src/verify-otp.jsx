import { useState, useEffect, useRef } from "react";
import { verifyOTP, sendOTP } from "./auth";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function VerifyOTP({ setPage }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef(null);

  const identifier = localStorage.getItem("identifier") || "";
  const mode = localStorage.getItem("identifierType") || "email"; // "email" | "phone"

  // Countdown timer for resend
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    const trimmed = otp.trim();
    if (trimmed.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await verifyOTP(identifier, trimmed, mode);

      if (res.success && res.token) {
        localStorage.setItem("token", res.token);
        setPage("dashboard");
      } else {
        setError(res.message || "Invalid OTP. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;

    setResendMsg("");
    setError("");
    setResendLoading(true);

    try {
      const res = await sendOTP(identifier, mode);
      if (res.success) {
        setResendMsg(`A new OTP has been sent to your ${mode === "email" ? "email" : "phone"}.`);
        setOtp("");
        resetTimer();
      } else {
        setError(res.message || "Failed to resend OTP.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(val);
    if (error) setError("");
  };

  // Mask the identifier for privacy
  const maskedIdentifier =
    mode === "email"
      ? identifier.replace(/(.{2}).+(@.+)/, "$1****$2")
      : identifier.replace(/(\+\d{2})\d+(\d{3})/, "$1****$2");

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon">{mode === "email" ? "📧" : "📱"}</div>
        <h1 className="auth-title">Verify OTP</h1>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to your {mode === "email" ? "email" : "phone"}{" "}
          <span className="identifier-highlight">{maskedIdentifier}</span>
        </p>

        <div className="form-group">
          <label htmlFor="otp" className="form-label">
            One-Time Password
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            className={`form-input otp-input ${error ? "input-error" : ""}`}
            placeholder="• • • • • •"
            value={otp}
            onChange={handleOtpChange}
            onKeyDown={handleKeyDown}
            maxLength={OTP_LENGTH}
            autoFocus
            autoComplete="one-time-code"
          />
          {error && <p className="error-text">{error}</p>}
          {resendMsg && <p className="success-text">{resendMsg}</p>}
        </div>

        <button
          className="btn-primary"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? <span className="btn-spinner" /> : "Verify OTP"}
        </button>

        <div className="resend-row">
          <button
            className="btn-link"
            onClick={handleResend}
            disabled={countdown > 0 || resendLoading}
          >
            {resendLoading
              ? "Sending…"
              : countdown > 0
              ? `Resend OTP in ${countdown}s`
              : "Resend OTP"}
          </button>
        </div>

        <button className="btn-secondary" onClick={() => setPage("login")}>
          ← Change {mode === "email" ? "email" : "phone number"}
        </button>
      </div>
    </div>
  );
}

export default VerifyOTP;
