import { useState, useEffect } from "react";
import { Heart, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function LandingPageComponent({ onNavigateAuth }) {
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchListings = async () => {
      setLoadingListings(true);
      setListingsError("");
      try {
        const { data, error } = await supabase
          .from("donations")
          .select(
            "id, food_name, quantity, location, expiry_time, food_type, image_url, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(8);

        if (!active) return;

        if (error) {
          setListingsError(error.message || "Failed to load listings.");
          setListings([]);
        } else if (!data || data.length === 0) {
          setListings([]);
          setListingsError("No food listings available right now.");
        } else {
          setListings(data);
        }
      } catch (err) {
        if (!active) return;
        console.error("Listings fetch failed:", err);
        setListingsError(err.message || "Failed to load listings.");
        setListings([]);
      } finally {
        if (!active) return;
        setLoadingListings(false);
      }
    };

    fetchListings();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {/* Top Navigation Overlay */}
      <nav className="top-nav animate-fade-in stagger-1">
        <a href="/" className="brand">
          <Heart fill="#D46A3D" color="#D46A3D" size={28} /> Need for Food
        </a>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => onNavigateAuth("signin")}
            style={{
              background: "transparent",
              border: "none",
              fontWeight: 600,
              color: "var(--text-main)",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Sign In
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onNavigateAuth("signup")}
            style={{ padding: "0.6rem 1.5rem", width: "auto" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Primary Hero Section */}
      <div className="hero-container animate-fade-in stagger-2">
        <h1 className="hero-title">
          Connecting{" "}
          <span className="hero-title-highlight highlight-orange">
            Abundance
          </span>
          <br />
          to <span className="hero-title-highlight highlight-green">Need.</span>
        </h1>
        <p className="hero-subtitle">
          Join the community connecting food donors with those who need it most.
          Zero waste, maximum impact.
        </p>
        <div className="hero-buttons">
          <button
            className="btn btn-primary"
            onClick={() => onNavigateAuth("signup")}
          >
            I Want to Donate Food
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigateAuth("signup")}
          >
            I Need Food
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-container animate-fade-in stagger-3">
        <h2 className="how-it-works-title">How It Works</h2>

        <div className="how-it-works-grid">
          {/* Donors Path */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-icon step-icon-donor">
                <Heart size={24} />
              </div>
              For Donors
            </div>

            <div className="step-list">
              <div className="step-item">
                <div className="step-number step-number-donor">1</div>
                <div className="step-text">
                  <h4>List Your Food</h4>
                  <p>
                    Post details about excess food with photos and pickup times
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number step-number-donor">2</div>
                <div className="step-text">
                  <h4>Get Requests</h4>
                  <p>
                    Acceptors express interest and you choose who receives it
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number step-number-donor">3</div>
                <div className="step-text">
                  <h4>Coordinate Pickup</h4>
                  <p>Set the time and location for seamless handoff</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acceptors Path */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-icon step-icon-ngo">
                <MapPin size={24} />
              </div>
              For Acceptors
            </div>

            <div className="step-list">
              <div className="step-item">
                <div className="step-number step-number-ngo">1</div>
                <div className="step-text">
                  <h4>Browse Listings</h4>
                  <p>Explore available food near you with filters and search</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number step-number-ngo">2</div>
                <div className="step-text">
                  <h4>Claim Food</h4>
                  <p>Send a request or claim listings directly</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number step-number-ngo">3</div>
                <div className="step-text">
                  <h4>Pick It Up</h4>
                  <p>Coordinate with donors and collect the food</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Listings Preview Carousel */}
      <div className="listings-preview-container animate-fade-in stagger-4">
        <h2 className="how-it-works-title">Recent Food Listings</h2>

        {listingsError && (
          <p style={{ color: "#EF4444", textAlign: "center" }}>
            {listingsError}
          </p>
        )}
        {loadingListings ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            Loading listings...
          </p>
        ) : listings.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            No food listings available right now. Please check again soon.
          </p>
        ) : (
          <div className="horizontal-scroll-wrapper">
            {listings.map((item) => {
              const now = new Date();
              const exp = item.expiry_time ? new Date(item.expiry_time) : null;
              const expiresIn = exp
                ? Math.max(0, Math.floor((exp - now) / (1000 * 60)))
                : null;
              return (
                <div className="preview-card" key={item.id}>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.food_name}
                      className="preview-card-image"
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px 8px 0 0",
                      }}
                    />
                  ) : (
                    <div className="preview-card-image-placeholder" />
                  )}
                  <div className="preview-card-content">
                    <h3 className="preview-card-title">{item.food_name}</h3>
                    <p className="preview-card-meta">
                      {item.location || "Unknown location"} •{" "}
                      {item.food_type?.toUpperCase()}
                    </p>
                    <div className="preview-card-stats">
                      <span>
                        {item.quantity
                          ? `${item.quantity} portions`
                          : "Quantity unknown"}
                      </span>
                      <span className="preview-card-urgency">
                        {exp
                          ? exp < now
                            ? "Expired"
                            : `Expires in ${Math.floor(expiresIn / 60)}h ${expiresIn % 60}m`
                          : "No expiry set"}
                      </span>
                    </div>
                    <div className="preview-tags">
                      <span className="preview-tag">
                        {item.food_type === "non-veg" ? "Non-Veg" : "Veg"}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: "100%", marginTop: "0.75rem" }}
                      onClick={() => {
                        if (typeof onNavigateAuth === "function") {
                          onNavigateAuth("signin");
                        }
                      }}
                    >
                      Order Food
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          className="btn btn-amber"
          onClick={() => onNavigateAuth("signup")}
          style={{ marginTop: "3rem", padding: "1rem 2.5rem", fontWeight: 700 }}
        >
          View All Listings &rarr;
        </button>
      </div>

      {/* Footer */}
      <footer className="app-footer animate-fade-in stagger-5">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <Heart fill="#fff" size={24} color="#fff" /> Need for Food
            </div>
            <p style={{ color: "#A39B93", lineHeight: 1.6 }}>
              Connecting communities through food redistribution. Zero waste,
              maximum impact.
            </p>
          </div>

          <div>
            <h4 className="footer-column-title">Platform</h4>
            <div className="footer-links">
              <button className="footer-link">How It Works</button>
              <button className="footer-link">For Donors</button>
              <button className="footer-link">For Acceptors</button>
            </div>
          </div>

          <div>
            <h4 className="footer-column-title">Company</h4>
            <div className="footer-links">
              <button className="footer-link">About Us</button>
              <button className="footer-link">Contact</button>
              <button className="footer-link">Privacy</button>
            </div>
          </div>

          <div>
            <h4 className="footer-column-title">Get Started</h4>
            <div className="footer-links">
              <button
                className="footer-link"
                onClick={() => onNavigateAuth("signup")}
              >
                Sign Up
              </button>
              <button
                className="footer-link"
                onClick={() => onNavigateAuth("signin")}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Need for Food. All rights reserved.
        </div>
      </footer>
    </>
  );
}
