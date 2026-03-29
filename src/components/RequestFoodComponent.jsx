import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function RequestFoodComponent({ onNavigateAuth }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [formData, setFormData] = useState({
    food_name: "",
    quantity: "",
    urgency: "medium",
    location: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    let active = true;

    const fetchListings = async () => {
      setLoadingListings(true);
      setListingsError("");
      try {
        const { data, error } = await supabase
          .from("donations")
          .select(
            "id, food_name, quantity, location, expiry_time, food_type, updated_at, image_url",
          )
          .order("updated_at", { ascending: false })
          .limit(20);

        if (!active) return;

        if (error) {
          setListingsError(error.message || "Failed to load listings.");
          setListings([]);
        } else {
          setListings(data || []);
        }
      } catch (err) {
        if (!active) return;
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

  const handleOrderNow = async (donation) => {
    setOrderMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        onNavigateAuth?.("signin");
        return;
      }

      // Here we can persis order intent to requests (or orders) table if desired.
      const { error: orderError } = await supabase.from("orders").insert([
        {
          acceptor_id: session.user.id,
          donation_id: donation.id,
          quantity: donation.quantity || 1,
          status: "placed",
        },
      ]);

      if (orderError) throw orderError;

      setOrderMessage(`Order placed for ${donation.food_name}.`);
    } catch (err) {
      if (err.message.includes("users")) {
        onNavigateAuth?.("signin");
        return;
      }
      setOrderMessage(`Failed to place order: ${err.message}`);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { error: insertError } = await supabase.from("requests").insert([
        {
          acceptor_id: session?.user?.id,
          food_name: formData.food_name.trim(),
          quantity: parseInt(formData.quantity) || 0,
          urgency: formData.urgency,
          location: formData.location.trim(),
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      setSuccess("Request broadcasted successfully!");
      setFormData({
        food_name: "",
        quantity: "",
        urgency: "high",
        location: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to submit request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in stagger-1">
      <h1 className="page-title">Request Surplus Food</h1>
      <div
        className="card animate-fade-in stagger-2"
        style={{ maxWidth: "600px" }}
      >
        {success && (
          <div
            className="badge badge-ghost"
            style={{
              padding: "1.25rem",
              width: "100%",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "10px",
            }}
          >
            <CheckCircle size={18} /> {success}
          </div>
        )}
        {error && (
          <div
            className="badge badge-outline"
            style={{
              padding: "1.25rem",
              width: "100%",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "10px",
            }}
          >
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group animate-fade-in stagger-1">
            <label className="form-label">Food Request Description</label>
            <input
              required
              type="text"
              name="food_name"
              className="form-input"
              placeholder="e.g. Bread, Pasta, etc."
              value={formData.food_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group animate-fade-in stagger-2">
            <label className="form-label">Target Quantity</label>
            <input
              required
              type="number"
              min="1"
              name="quantity"
              className="form-input"
              placeholder="e.g. 50 (meals)"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group animate-fade-in stagger-3">
            <label className="form-label">Location Identifier</label>
            <input
              required
              type="text"
              name="location"
              className="form-input"
              placeholder="e.g. ZIP code or City"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group animate-fade-in stagger-4">
            <label className="form-label">Urgency Level & Timeframe</label>
            <select
              name="urgency"
              className="form-select"
              value={formData.urgency}
              onChange={handleChange}
            >
              <option value="low">Low (Needed within 24 hours)</option>
              <option value="medium">Medium (Needed within 12 hours)</option>
              <option value="high">High (Immediate, &lt; 2 hours)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-secondary mt-4"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      <section
        className="listings-preview-container animate-fade-in stagger-4"
        style={{ marginTop: "2rem" }}
      >
        <h2 className="how-it-works-title">View All Listings</h2>
        {orderMessage && (
          <div
            className="badge badge-ghost"
            style={{ padding: "1rem", marginBottom: "1rem" }}
          >
            {orderMessage}
          </div>
        )}
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
            No food listings available.
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
                    <img src={item.image_url} alt={item.food_name} className="preview-card-image-placeholder" style={{ objectFit: "cover", width: "100%", height: "200px" }} />
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
                      onClick={() => handleOrderNow(item)}
                    >
                      Order Food
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
