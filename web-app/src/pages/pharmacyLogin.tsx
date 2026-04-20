import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/pharmacy-auth.module.css";
import { getAuthErrorMessage } from "../utils/authErrors";
import { useAuth } from "../contexts/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  loginPharmacy,
  resetPharmacyPassword,
} from "../services/pharmacyLoginService";

export default function PharmacyLoginPage() {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
  if (!authLoading && user) {
    navigate("/pharmacyDashboard");
  }
}, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await loginPharmacy(email, password, rememberMe);
      setMessage("Login successful.");
      navigate("/");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email first to reset your password.");
      return;
    }

    try {
      await resetPharmacyPassword(email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch {
      setError("Could not send reset email. Please verify the email address.");
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authCardBanner}>
          <div className={styles.bannerContent}>
            <h1>Sign In</h1>
            <p>Pharmacy Portal</p>
          </div>
        </div>

        <div className={styles.authCardBody}>
          <form className={styles.authForm} onSubmit={handleLogin}>
            <div className={styles.authField}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your pharmacy email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

    <div className={styles.authField}>
  <label htmlFor="password">Password</label>

  <div className={styles.passwordWrapper}>
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete="current-password"
      required
    />

    <button
      type="button"
      className={styles.passwordToggle}
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FiEyeOff /> : <FiEye />}
    </button>
  </div>
</div>

            <div className={styles.authRow}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className={styles.linkButton}
              >
                Forgot password?
              </button>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}
            {message && <p className={styles.successText}>{message}</p>}

            <button
              type="submit"
              className={styles.authButton}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className={styles.authFooterText}>
            Don’t have an account?{" "}
            <Link to="/signup" className={styles.authLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}