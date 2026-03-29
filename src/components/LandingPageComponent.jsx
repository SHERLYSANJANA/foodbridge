import { Heart, MapPin } from "lucide-react";

export default function LandingPageComponent({ onNavigateAuth }) {
  return (
    <>
      {/* Top Navigation Overlay */}
      <nav className="top-nav animate-fade-in stagger-1">
        <a href="/" className="brand">
          <Heart fill="#D46A3D" color="#D46A3D" size={28} /> Need for Food
        </a>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => onNavigateAuth('signin')}
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
            onClick={() => onNavigateAuth('signup')}
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
          <button className="btn btn-primary" onClick={() => onNavigateAuth('signup')}>
            I Want to Donate Food
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigateAuth('signup')}>
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

      {/* Mock Listings Preview Carousel */}
      <div className="listings-preview-container animate-fade-in stagger-4">
        <div className="horizontal-scroll-wrapper">
          <div className="preview-card">
            <div className="preview-card-image-placeholder"></div>
            <div className="preview-card-content">
              <h3 className="preview-card-title">Fresh Biryani Portions</h3>
              <p className="preview-card-meta">College Mess - IIT Delhi</p>
              <div className="preview-card-stats">
                <span>50 portions</span>
                <span className="preview-card-urgency">Expires in 2h 15m</span>
              </div>
              <div className="preview-tags">
                <span className="preview-tag">Non-Veg</span>
                <span className="preview-tag">Halal</span>
              </div>
            </div>
          </div>

          <div className="preview-card">
            <div className="preview-card-image-placeholder"></div>
            <div className="preview-card-content">
              <h3 className="preview-card-title">Packaged Bread & Butter</h3>
              <p className="preview-card-meta">City Bakery</p>
              <div className="preview-card-stats">
                <span>30 packets</span>
                <span
                  className="preview-card-urgency"
                  style={{ color: "#D46A3D" }}
                >
                  Expires in 5h 30m
                </span>
              </div>
              <div className="preview-tags">
                <span className="preview-tag">Veg</span>
              </div>
            </div>
          </div>

          <div className="preview-card">
            <div className="preview-card-image-placeholder"></div>
            <div className="preview-card-content">
              <h3 className="preview-card-title">Fruit Salad Bowls</h3>
              <p className="preview-card-meta">Event Caterers</p>
              <div className="preview-card-stats">
                <span>25 bowls</span>
                <span
                  className="preview-card-urgency"
                  style={{ color: "#D46A3D" }}
                >
                  Expires in 1h 45m
                </span>
              </div>
              <div className="preview-tags">
                <span className="preview-tag">Vegan</span>
                <span className="preview-tag">Gluten-Free</span>
              </div>
            </div>
          </div>

          <div className="preview-card">
            <div className="preview-card-image-placeholder"></div>
            <div className="preview-card-content">
              <h3 className="preview-card-title">Cookie Platter</h3>
              <p className="preview-card-meta">Community Bake Sale</p>
              <div className="preview-card-stats">
                <span>40 portions</span>
                <span
                  className="preview-card-urgency"
                  style={{ color: "#D46A3D" }}
                >
                  Expires in 10h
                </span>
              </div>
              <div className="preview-tags">
                <span className="preview-tag">Veg</span>
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn btn-amber"
          onClick={onNavigateAuth}
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
              <button className="footer-link" onClick={() => onNavigateAuth('signup')}>
                Sign Up
              </button>
              <button className="footer-link" onClick={() => onNavigateAuth('signin')}>
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
