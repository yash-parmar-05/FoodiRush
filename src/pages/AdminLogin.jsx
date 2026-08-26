import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope, FaUtensils, FaExclamationCircle } from "react-icons/fa";
import { adminAPI } from "../services/api";
import "./AdminLogin.css";


function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await adminAPI.login({
        email,
        password,
      });

      const data = response.data;

      // Save JWT token
      localStorage.setItem("adminToken", data.token);

      // Save admin information
      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Go to admin dashboard
      navigate("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-logo-badge">
            <FaUtensils color="#ffffff" />
          </div>
          <h1 className="admin-login-title">FoodieRush Admin</h1>
          <p className="admin-login-subtitle">Enter your credentials to access management portal</p>
        </div>

        <form className="admin-login-form" onSubmit={handleLogin}>
          <div className="admin-login-field">
            <label>Email Address</label>
            <div className="admin-login-input-wrap">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@foodierush.com"
                required
              />
              <FaEnvelope className="admin-login-input-icon" />
            </div>
          </div>

          <div className="admin-login-field">
            <label>Password</label>
            <div className="admin-login-input-wrap">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
              <FaLock className="admin-login-input-icon" />
            </div>
          </div>

          {error && (
            <div className="admin-login-error-alert">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="admin-login-submit-btn"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>
            Customer Website? <Link to="/home">Go back to FoodieRush</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
