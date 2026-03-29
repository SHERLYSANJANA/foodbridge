import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function ViewAllListingsComponent({ onNavigateAuth }) {
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState("");
  const [orderMessage, setOrderMessage] = useState("");

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
          .order("created_at", { ascending: false });

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

      // Here we can persist order intent to requests (or orders) table if desired.
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

  return (
    <div className="animate-fade-in stagger-1">
      <h1 className="page-title">All Food Listings</h1>

      {orderMessage && (
        <div
          className="badge badge-ghost"
          style={{ padding: "1rem", marginBottom: "1rem" }}
        >
          {orderMessage}
        </div>
      )}

      {listingsError && (
        <p style={{ color: "#EF4444", textAlign: "center" }}>{listingsError}</p>
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {listings.map((item) => {
            const now = new Date();
            const exp = item.expiry_time ? new Date(item.expiry_time) : null;
            const expiresIn = exp
              ? Math.max(0, Math.floor((exp - now) / (1000 * 60)))
              : null;
            return (
              <div className="preview-card" key={item.id} style={{ margin: 0 }}>
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
    </div>
  );
}
