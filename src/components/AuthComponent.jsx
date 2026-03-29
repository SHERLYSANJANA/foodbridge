import { useState } from "react";
import { supabase } from "../supabaseClient";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

export default function AuthComponent({ initialMode = "signin" }) {
  const [isLogin, setIsLogin] = useState(initialMode !== "signup");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [signUpStep, setSignUpStep] = useState(0); // 0: role selection, 1: basic, 2: details, 3: verify
  const [selectedRole, setSelectedRole] = useState("donor");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [verified, setVerified] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [donorOrg, setDonorOrg] = useState("");
  const [donorType, setDonorType] = useState("College Mess");
  const [donorCity, setDonorCity] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [donorPhone, setDonorPhone] = useState("");

  const [acceptorOrg, setAcceptorOrg] = useState("");
  const [acceptorReason, setAcceptorReason] = useState("NGO");
  const [acceptorCity, setAcceptorCity] = useState("");
  const [acceptorPhone, setAcceptorPhone] = useState("");

  const [verificationDoc, setVerificationDoc] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const progressText = () => {
    if (isLogin) return null;
    const steps = [
      "Role Selection",
      "Basic Info",
      "Organization Details",
      "Verify",
    ];
    const step = Math.min(signUpStep + 1, steps.length);
    return `Step ${step} of ${steps.length} — ${steps[signUpStep]}`;
  };

  const resetForm = () => {
    setSignUpStep(0);
    setSelectedRole("donor");
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDonorOrg("");
    setDonorType("College Mess");
    setDonorCity("");
    setDonorAddress("");
    setDonorPhone("");
    setAcceptorOrg("");
    setAcceptorReason("NGO");
    setAcceptorCity("");
    setAcceptorPhone("");
    setVerificationDoc(null);
    setProfilePhoto(null);
    setAgreed(false);
    setMsg("");
    setError("");
    setVerified(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError(err.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const validateBasicInfo = () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill all required fields.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;
    if (!strongPassword.test(password)) {
      setError(
        "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      );
      return false;
    }
    return true;
  };

  const validateDetails = () => {
    if (selectedRole === "donor") {
      if (
        !donorOrg.trim() ||
        !donorCity.trim() ||
        !donorAddress.trim()
      ) {
        setError("Please fill all donor details.");
        return false;
      }
    } else {
      if (acceptorReason === "NGO" && !acceptorOrg.trim()) {
        setError("Please provide your organization name for NGO.");
        return false;
      }
      if (
        !acceptorReason.trim() ||
        !acceptorCity.trim()
      ) {
        setError("Please fill all acceptor details.");
        return false;
      }
    }
    return true;
  };

  const handleFinalSignUp = async (e) => {
    e.preventDefault();

    if (!["donor", "acceptor"].includes(selectedRole)) {
      setError("Please select Donor or Acceptor role before continuing.");
      setSignUpStep(0);
      return;
    }

    if (!agreed) {
      setError("You must agree to terms to create an account.");
      return;
    }

    setLoading(true);
    setError("");
    setMsg("");

    const metadata = {
      full_name: fullName,
      user_role: selectedRole,
      ...(selectedRole === "donor"
        ? {
            organization_name: donorOrg,
            organization_type: donorType,
            city: donorCity,
            address: donorAddress,
            phone: donorPhone,
          }
        : {
            organization_name: acceptorOrg,
            joining_reason: acceptorReason,
            city: acceptorCity,
            phone: acceptorPhone,
          }),
    };

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (signUpError) throw signUpError;

      setVerified(true);
      setMsg("You're in! Let's feed the world.");
      setTimeout(() => setVerified(false), 5000);
      setTimeout(() => setIsLogin(true), 4000);
    } catch (err) {
      setError(err.message || "An error occurred creating account.");
    } finally {
      setLoading(false);
    }
  };

  const roleIcon = (mode) => {
    if (mode === "donor") {
      return "🥣";
    }
    return "🤝";
  };

  const renderRoleSelection = () => (
    <>
      <h2
        className="page-title text-center"
        style={{ fontSize: "1.9rem", marginBottom: "1rem" }}
      >
        Join FeedForward
      </h2>
      <p className="text-center text-muted mb-4">
        Choose your role to start impact.
      </p>
      <div className="flex gap-4" style={{ marginBottom: "1.2rem" }}>
        {["donor", "acceptor"].map((r) => (
          <button
            key={r}
            type="button"
            className={`role-card ${selectedRole === r ? "selected" : ""}`}
            onClick={() => setSelectedRole(r)}
          >
            <div className="role-illustration">{roleIcon(r)}</div>
            <h3>{r === "donor" ? "I'm a Donor" : "I'm an Acceptor"}</h3>
            <p>
              {r === "donor"
                ? "Food provider for people in need."
                : "Food receiver or community partner."}
            </p>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          setError("");
          setMsg("");
          setSignUpStep(1);
        }}
      >
        Continue
      </button>
    </>
  );

  const renderBasicInfo = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        if (validateBasicInfo()) setSignUpStep(2);
      }}
    >
      <div className="progress-container mb-4">
        <div className="progress-label">{progressText()}</div>
        <div className="progress-bar">
          <div style={{ width: "33%" }} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          className="form-input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Priya K"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@feedforward.com"
          required
        />
      </div>
      <div className="form-group" style={{ position: "relative" }}>
        <label className="form-label">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          required
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword((v) => !v)}
          aria-label="Toggle password visibility"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"}
          className="form-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-type password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Processing..." : "Continue"}
      </button>
      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setIsLogin(true);
            setSignUpStep(0);
            setError("");
            setMsg("");
          }}
        >
          Sign In
        </button>
      </p>
    </form>
  );

  const renderDetails = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        if (validateDetails()) setSignUpStep(3);
      }}
    >
      <div className="progress-container mb-4">
        <div className="progress-label">{progressText()}</div>
        <div className="progress-bar">
          <div style={{ width: "66%" }} />
        </div>
      </div>

      {selectedRole === "donor" ? (
        <>
          <div className="form-group">
            <label className="form-label">Organization/Individual Name</label>
            <input
              className="form-input"
              value={donorOrg}
              onChange={(e) => setDonorOrg(e.target.value)}
              placeholder="e.g. Hillside College Mess"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={donorType}
              onChange={(e) => setDonorType(e.target.value)}
            >
              <option>College Mess</option>
              <option>Restaurant</option>
              <option>Party/Event</option>
              <option>NGO</option>
              <option>Individual</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              className="form-input"
              value={donorCity}
              onChange={(e) => setDonorCity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              className="form-input"
              value={donorAddress}
              onChange={(e) => setDonorAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label">Organization Name (if NGO)</label>
            <input
              className="form-input"
              value={acceptorOrg}
              onChange={(e) => setAcceptorOrg(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reason for joining</label>
            <select
              className="form-select"
              value={acceptorReason}
              onChange={(e) => setAcceptorReason(e.target.value)}
            >
              <option>NGO</option>
              <option>Personal Need</option>
              <option>Community Kitchen</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              className="form-input"
              value={acceptorCity}
              onChange={(e) => setAcceptorCity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              value={acceptorPhone}
              onChange={(e) => setAcceptorPhone(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </>
      )}

      <div className="button-row">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setSignUpStep(1)}
        >
          Back
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Processing..." : "Continue"}
        </button>
      </div>
    </form>
  );

  const renderVerify = () => (
    <form onSubmit={handleFinalSignUp}>
      <div className="progress-container mb-4">
        <div className="progress-label">{progressText()}</div>
        <div className="progress-bar">
          <div style={{ width: "100%" }} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Upload verification document</label>
        <label className="dropzone">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setVerificationDoc(e.target.files?.[0] || null)}
            hidden
          />
          <span>
            {verificationDoc
              ? verificationDoc.name
              : "Drag & drop or click to upload NGO certificate, college ID, etc."}
          </span>
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">Profile photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
        />
      </div>

      <div className="form-group">
        <label className="form-label checkbox-label">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          I agree to terms
        </label>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!agreed || loading}
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginTop: "0.75rem" }}
        onClick={() => setSignUpStep(2)}
      >
        Back
      </button>
    </form>
  );

  const renderCreateAccountSuccess = () => (
    <div className="success-state">
      <div className="confetti-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="confetti-piece" />
        ))}
      </div>
      <h3>You're in! Let's feed the world.</h3>
      <p className="text-muted">
        Account created successfully. Please verify via email if required, then
        sign in.
      </p>
      <button
        onClick={() => {
          resetForm();
          setIsLogin(true);
        }}
        className="btn btn-primary"
      >
        Go to Sign In
      </button>
    </div>
  );

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "80vh" }}
    >
      <div
        className="card stagger-1"
        style={{ maxWidth: "520px", width: "100%" }}
      >
        {error && (
          <div
            className="badge badge-outline"
            style={{
              padding: "1rem",
              width: "100%",
              marginBottom: "1rem",
              display: "block",
              textAlign: "center",
              borderColor: "#EF4444",
              color: "#EF4444",
            }}
          >
            {error}
          </div>
        )}
        {msg && (
          <div
            className="badge badge-ghost"
            style={{
              padding: "1rem",
              width: "100%",
              marginBottom: "1rem",
              display: "block",
              textAlign: "center",
            }}
          >
            {msg}
          </div>
        )}

        {isLogin ? (
          <>
            <h2
              className="page-title text-center"
              style={{ fontSize: "1.9rem", marginBottom: "1.5rem" }}
            >
              Welcome Back
            </h2>
            <form onSubmit={handleLogin} className="flex-col gap-2">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  required
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@feedforward.com"
                />
              </div>
              <div className="form-group" style={{ position: "relative" }}>
                <label className="form-label">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {" "}
                {loading ? (
                  "Signing In..."
                ) : (
                  <>
                    <LogIn size={18} /> Sign In
                  </>
                )}{" "}
              </button>
            </form>
            <p className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsLogin(false);
                  resetForm();
                }}
              >
                Sign Up
              </button>
            </p>
          </>
        ) : (
          <>
            {verified
              ? renderCreateAccountSuccess()
              : signUpStep === 0
                ? renderRoleSelection()
                : signUpStep === 1
                  ? renderBasicInfo()
                  : signUpStep === 2
                    ? renderDetails()
                    : renderVerify()}
          </>
        )}

        <div className="text-center mt-5">
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMsg("");
              if (isLogin) resetForm();
            }}
          >
            {isLogin
              ? "Need an account? Join FeedForward"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
