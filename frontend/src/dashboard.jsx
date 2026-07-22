import { useEffect, useState } from "react";
import { getMe, logout } from "./auth";

function Dashboard({ setPage }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getMe();
      if (data?.success) {
        setUser(data.user);
      } else {
        // Token invalid — force back to login
        handleLogout();
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    setPage("login");
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  const displayName = user?.email || user?.phone || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const loginTime = new Date().toLocaleString();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2 className="dashboard-brand">🔐 OTP Auth</h2>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="profile-card">
          <div className="avatar">{initials}</div>
          <h1 className="welcome-text">Welcome back!</h1>
          <p className="user-identifier">{displayName}</p>
          <div className="info-badge">✅ Verified via OTP</div>
          <p className="login-time">Session started: {loginTime}</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Secure Session</h3>
            <p>Your session is protected with a signed JWT token.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⏰</span>
            <h3>Auto Expiry</h3>
            <p>OTPs expire in 10 minutes and are hashed for security.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚀</span>
            <h3>Coming Soon</h3>
            <p>Google OAuth, user profiles, and role-based access control.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
