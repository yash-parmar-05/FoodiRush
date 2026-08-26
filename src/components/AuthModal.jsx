import { useState, useEffect } from "react";
import { FaTimes, FaEnvelope, FaLock, FaUser, FaPhone, FaExclamationCircle } from "react-icons/fa";
import { authAPI } from "../services/api";
import "./AuthModal.css";

function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens or switches tabs to keep input fields blank
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setError("");
    }
  }, [isOpen, isLogin]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setError("");
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = isLogin
      ? { email: email.trim(), password }
      : { name: name.trim(), email: email.trim(), phone: phone.trim(), password };

    try {
      const response = isLogin
        ? await authAPI.login(payload)
        : await authAPI.register(payload);

      const data = response.data;

      // Save token and user details in localStorage
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user, data.token);
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error("Auth modal error:", err);
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => switchTab(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => switchTab(false)}
          >
            Create Account
          </button>
        </div>

        <div className="auth-header-animated" key={isLogin ? "head-login" : "head-register"}>
          <h2>{isLogin ? "Welcome Back!" : "Join FoodieRush"}</h2>
          <p>
            {isLogin
              ? "Log in to view your orders and place fresh food orders."
              : "Register for an account to track your orders easily."}
          </p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form
          className="auth-form-animated"
          key={isLogin ? "form-login" : "form-register"}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* Dummy hidden inputs to prevent browser autofill of admin credentials */}
          <input type="text" name="prevent_autofill_user" style={{ display: "none" }} tabIndex="-1" />
          <input type="password" name="prevent_autofill_pass" style={{ display: "none" }} tabIndex="-1" />

          {!isLogin && (
            <div className="auth-field field-slide-in">
              <label>Full Name</label>
              <div className="auth-input-wrap">
                <FaUser className="auth-icon" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <div className="auth-input-wrap">
              <FaEnvelope className="auth-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="auth-field field-slide-in">
              <label>Phone Number</label>
              <div className="auth-input-wrap">
                <FaPhone className="auth-icon" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <FaLock className="auth-icon" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading
              ? "Processing..."
              : isLogin
              ? "Sign In to FoodieRush"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
