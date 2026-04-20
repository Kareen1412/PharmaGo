import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/pharmacy-auth.module.css";
import { signUpPharmacy } from "../services/pharmacyAuthService";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function PharmacySignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const isPasswordValid = (value: string) => {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    return hasMinLength && hasUppercase && hasLowercase && hasNumber;
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid(password)) {
      setError(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signUpPharmacy(email, password);
      setShowSuccessPopup(true);
    } catch (err: any) {
      console.error("Pharmacy signup failed:", err);
      setError(err?.message || "Failed to create pharmacy account.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setShowSuccessPopup(false);
    navigate("/");
  };

  return (
    <>
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authCardBanner}>
            <div className={styles.bannerContent}>
              <h1>Sign Up</h1>
              <p>Create your pharmacy account</p>
            </div>
          </div>

          <div className={styles.authCardBody}>
            <form className={styles.authForm} onSubmit={handleSignup}>
              <div className={styles.authField}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your pharmacy email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.authField}>
                <label htmlFor="password">Password</label>

                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff/> : <FiEye/>}
                  </button>
                </div>

              
                
              </div>

              <div className={styles.authField}>
                <label htmlFor="confirmPassword">Confirm Password</label>

                <div className={styles.passwordWrapper}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? <FiEyeOff/> : <FiEye/>}
                  </button>
                </div>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button
                type="submit"
                className={styles.authButton}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create pharmacy account"}
              </button>

              <p className={styles.authFooterText}>
                Already have an account?{" "}
                <Link to="/login" className={styles.authLink}>
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {showSuccessPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2 className={styles.popupTitle}>Account Created</h2>
            <p className={styles.popupText}>
              Your pharmacy account was created successfully.
            </p>
            <button
              type="button"
              className={styles.authButton}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}