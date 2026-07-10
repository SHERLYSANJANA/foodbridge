import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Heart, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";


export default function AuthComponent({ initialMode = "signin", initialRole = null }) {
  const [isLogin, setIsLogin] = useState(initialMode !== "signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [signUpStep, setSignUpStep] = useState(initialRole ? 1 : 0); // 0: role selection, 1: basic, 2: details, 3: verify
  const [selectedRole, setSelectedRole] = useState(initialRole || "donor");
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

  const progressText = () => {
    if (isLogin) return null;
    const steps = [
      "Role Selection",
      "Basic Info",
      "Organization Details",
      "Verify",
    ];
    const step = Math.min(signUpStep + 1, steps.length);
    return `Step ${step} of ${steps.length} - ${steps[signUpStep]}`;
  };

  const resetForm = () => {
    setSignUpStep(initialRole ? 1 : 0);
    setSelectedRole(initialRole || "donor");
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
      const { error: signUpError } = await supabase.auth.signUp({
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
      return <Heart size={30} />;
    }
    return <UserPlus size={30} />;
  };

  const renderRoleSelection = () => (
    <>
      <h2
        className="page-title text-center"
        style={{ fontSize: "1.9rem", marginBottom: "1rem" }}
      >
        Join Need for Food
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
          placeholder="hello@needforfood.org"
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
                  placeholder="hello@needforfood.org"
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
              ? "Need an account? Join Need for Food"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
