const BASE = import.meta.env.VITE_API_URL || "/api/auth";

// mode: "email" | "phone"
export const sendOTP = async (identifier, mode = "email") => {
  const body = mode === "email"
    ? { email: identifier }
    : { phone: identifier };

  const response = await fetch(`${BASE}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.json();
};

export const verifyOTP = async (identifier, otp, mode = "email") => {
  const body = mode === "email"
    ? { email: identifier, otp }
    : { phone: identifier, otp };

  const response = await fetch(`${BASE}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.json();
};

export const getMe = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const response = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return response.json();
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("identifier");
  localStorage.removeItem("identifierType");
};
