import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Heart,
  HeartHandshake,
  ListOrdered,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import AddFoodComponent from "./components/AddFoodComponent";
import RequestFoodComponent from "./components/RequestFoodComponent";
import LiveMatchesComponent from "./components/LiveMatchesComponent";
import VerificationComponent from "./components/VerificationComponent";
import AuthComponent from "./components/AuthComponent";
import LandingPageComponent from "./components/LandingPageComponent";
import ViewAllListingsComponent from "./components/ViewAllListingsComponent";
import { supabase } from "./supabaseClient";

const BackgroundArt = () => null; // Removed old neon background art to match Figma's clean aesthetic

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // signin or signup
  const [isLight, setIsLight] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState(null);

  useEffect(() => {
    // Light mode code stripped. The new Figma theme is natively universal.

    const fetchSessionAndStatus = async () => {
      try {
        const {
          data: { session: currentSession },
          error: authError,
        } = await supabase.auth.getSession();
        if (authError) throw authError;
        setSession(currentSession);

        if (currentSession) {
          const { data, error } = await supabase
            .from("verification_requests")
            .select("status")
            .eq("donor_id", currentSession.user.id)
            .order("created_at", { ascending: false })
            .limit(1);
          if (error) console.error("Verification check failed:", error);
          else if (data && data.length > 0) {
            setVerifiedStatus(data[0].status);
          }
        }
      } catch (err) {
        console.error("Session init failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        try {
          const { data, error } = await supabase
            .from("verification_requests")
            .select("status")
            .eq("donor_id", newSession.user.id)
            .order("created_at", { ascending: false })
            .limit(1);
          if (!error && data && data.length > 0)
            setVerifiedStatus(data[0].status);
        } catch (e) {
          console.error("Auth state update failed", e);
        }
      } else {
        setVerifiedStatus(null);
      }
    });

    // Fallback to guarantee the app ALWAYS unblocks the loading screen
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase sign out returned error:", error);
      }
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      // Force the local session to wipe immediately
      setSession(null);
      setVerifiedStatus(null);
      setShowAuth(false);
      setAuthMode("signin");

      // Failsafe to manually wipe local storage if Supabase failed to clear it
      for (let key in localStorage) {
        if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
          localStorage.removeItem(key);
        }
      }
      navigate("/");
    }
  };

  const toggleTheme = () => {
    setIsLight((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add("light-mode");
        localStorage.setItem("foodbridge-theme", "light");
      } else {
        document.body.classList.remove("light-mode");
        localStorage.setItem("foodbridge-theme", "dark");
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div
        className="app-container flex items-center justify-center text-muted"
        style={{ minHeight: "100vh" }}
      >
        Loading...
      </div>
    );
  }

  // Unauthenticated State (Hero or Auth)
  if (!session) {
    return (
      <div className="app-container">
        <BackgroundArt />
        {showAuth ? (
          <div
            style={{
              width: "100vw",
              display: "flex",
              flexDirection: "column",
              zIndex: 10,
            }}
          >
            <div
              className="flex justify-between items-center"
              style={{ padding: "2rem 4rem" }}
            >
              <div className="brand" style={{ marginBottom: 0 }}>
                <Heart fill="#D46A3D" color="#D46A3D" size={24} /> Need for Food
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: "auto", padding: "0.5rem 1rem" }}
                onClick={() => setShowAuth(false)}
              >
                Back to Home
              </button>
            </div>
            <AuthComponent initialMode={authMode} />
          </div>
        ) : (
          <div style={{ width: "100vw", zIndex: 10 }}>
            <LandingPageComponent
              onNavigateAuth={(mode) => {
                setAuthMode(mode || "signup");
                setShowAuth(true);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Authenticated State (Sidebar Layout)
  const userMeta = session.user.user_metadata || {};
  const isAcceptor = userMeta.user_role === "acceptor";

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <Link to="/" className="brand">
            <Heart fill="#D46A3D" color="#D46A3D" size={28} /> Need for Food
            {verifiedStatus === "approved" && (
              <ShieldCheck
                size={18}
                color="#10B981"
                style={{ marginLeft: "0.4rem" }}
                title="Verified Donor"
              />
            )}
          </Link>
          <div className="nav-links animate-fade-in stagger-1">
            {!isAcceptor && (
              <Link
                to="/"
                className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
              >
                <Home size={20} /> Add Food
              </Link>
            )}
            {isAcceptor && (
              <>
                <Link
                  to="/"
                  className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
                >
                  <HeartHandshake size={20} /> Request Food
                </Link>
                <Link
                  to="/listings"
                  className={`nav-link ${location.pathname === "/listings" ? "active" : ""}`}
                >
                  <ListOrdered size={20} /> View All Listings
                </Link>
              </>
            )}
            {session?.user?.user_metadata?.user_role === "donor" && (
              <Link
                to="/verify-donor"
                className={`nav-link ${location.pathname === "/verify-donor" ? "active" : ""}`}
              >
                <ShieldCheck size={20} /> Verify Account
              </Link>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "2rem",
          }}
        >
          <button
            onClick={handleSignOut}
            className="btn btn-secondary"
            style={{ justifyContent: "flex-start" }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className="main-content relative overflow-auto h-screen"
        style={{ height: "100vh", overflowY: "auto" }}
      >
        <Routes>
          {!isAcceptor && <Route path="/" element={<AddFoodComponent />} />}
          {isAcceptor && (
            <Route
              path="/"
              element={
                <RequestFoodComponent
                  onNavigateAuth={(mode) => {
                    setAuthMode(mode || "signin");
                    setShowAuth(true);
                  }}
                />
              }
            />
          )}
          {isAcceptor && (
            <Route
              path="/listings"
              element={
                <ViewAllListingsComponent
                  onNavigateAuth={(mode) => {
                    setAuthMode(mode || "signin");
                    setShowAuth(true);
                  }}
                />
              }
            />
          )}
          <Route path="/verify-donor" element={<VerificationComponent />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
