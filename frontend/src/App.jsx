import { useState, useEffect } from "react";
import Login from "./login";
import VerifyOTP from "./verify-otp";
import Dashboard from "./dashboard";
import { getMe } from "./auth";

function App() {
  // "login" | "verify" | "dashboard"
  const [page, setPage] = useState("login");
  const [loading, setLoading] = useState(true);

  // On mount, check if a valid token already exists → skip to dashboard
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const data = await getMe();
        if (data?.success) {
          setPage("dashboard");
        } else {
          // Token invalid or expired — clear it
          localStorage.removeItem("token");
          localStorage.removeItem("identifier");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      {page === "login" && <Login setPage={setPage} />}
      {page === "verify" && <VerifyOTP setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
    </>
  );
}

export default App;
