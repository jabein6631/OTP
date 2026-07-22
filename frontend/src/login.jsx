import { useState } from "react";
import { sendOTP } from "./auth";

function Login({ setPage }) {
  const [mode, setMode] = useState("email"); // "email" | "phone"
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const val = value.trim();
    if (!val) return `Please enter your ${mode === "email" ? "email address" : "phone number"}.`;

    if (mode === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return "Enter a valid email address.";
    } else {
      const phoneRegex = /^\+[1-9]\d{6,14}$/;
      if (!phoneRegex.test(val))
        return "Enter phone with country code (e.g. +91xxxxxxxxxx).";
    }
    return "";
  };

  const handleSendOTP = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await sendOTP(value.trim(), mode);

      if (res.success) {
        localStorage.setItem("identifier", value.trim());
        localStorage.setItem("identifierType", mode);
        setPage("verify");
      } else {
        setError(res.message || "Failed to send OTP. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendOTP();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setValue("");
    setError("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon">🔐</div>
        <h1 className="auth-title">Secure Login</h1>
        <p className="auth-subtitle">
          Receive a one-time password via your preferred method.
        </p>

        {/* Toggle: Email / Phone */}
        <div className="toggle-group">
          <button
            className={`toggle-btn ${mode === "email" ? "active" : ""}`}
            onClick={() => switchMode("email")}
          >
            📧 Email
          </button>
          <button
            className={`toggle-btn ${mode === "phone" ? "active" : ""}`}
            onClick={() => switchMode("phone")}
          >
            📱 Phone
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="identifier" className="form-label">
            {mode === "email" ? "Email Address" : "Phone Number"}
          </label>
          <input
            id="identifier"
            type={mode === "email" ? "email" : "tel"}
            className={`form-input ${error ? "input-error" : ""}`}
            placeholder={
              mode === "email" ? "you@example.com" : "+91xxxxxxxxxx"
            }
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete={mode === "email" ? "email" : "tel"}
          />
          {mode === "phone" && (
            <p className="hint-text">Include country code — e.g. +91 for India, +1 for USA</p>
          )}
          {error && <p className="error-text">{error}</p>}
        </div>

        <button
          className="btn-primary"
          onClick={handleSendOTP}
          disabled={loading}
        >
          {loading ? <span className="btn-spinner" /> : `Send OTP via ${mode === "email" ? "Email" : "SMS"}`}
        </button>
      </div>
    </div>
  );
}

export default Login;
