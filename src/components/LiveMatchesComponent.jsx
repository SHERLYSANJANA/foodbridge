import { useEffect, useState } from "react";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";
import { AlertCircle, Clock, MapPin, RefreshCw, Utensils } from "lucide-react";
import { supabase } from "../supabaseClient";

const rowKey = (item, fallback) =>
  `${item.created_at || "row"}-${item.food_name || "food"}-${fallback}`;

const expiryLabel = (value) => {
  if (!value) return "No expiry set";
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return "Expiry date unavailable";
  return isPast(parsed)
    ? "Expired"
    : `Expires ${formatDistanceToNow(parsed, { addSuffix: true })}`;
};

export default function LiveMatchesComponent() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [donationsResult, requestsResult] = await Promise.all([
        supabase
          .from("donations")
          .select(
            "food_name, quantity, location, expiry_time, food_type, image_url, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("requests")
          .select("food_name, quantity, urgency, location, created_at")
          .order("created_at", { ascending: false }),
      ]);

      if (donationsResult.error) throw donationsResult.error;
      if (requestsResult.error) throw requestsResult.error;

      setDonations(donationsResult.data || []);
      setRequests(requestsResult.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data.");
      setDonations([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const donationsChannel = supabase
      .channel("dashboard-donations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        fetchData,
      )
      .subscribe();

    const requestsChannel = supabase
      .channel("dashboard-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        fetchData,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(donationsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, []);

  return (
    <div className="animate-fade-in stagger-1">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Community Dashboard
        </h1>
        <button
          className="btn btn-secondary"
          onClick={fetchData}
          style={{ width: "auto", padding: "0.75rem 1.5rem" }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          className="badge badge-outline"
          style={{ padding: "1rem", marginBottom: "1.5rem" }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading community activity...</p>
      ) : (
        <div className="list-grid">
          <div className="card animate-fade-in stagger-2">
            <h2 className="section-title">
              <span className="badge badge-solid">{donations.length}</span>
              Available Donations
            </h2>
            <div className="flex-col gap-4 mt-4">
              {donations.map((donation, index) => (
                <div key={rowKey(donation, index)} className="list-item">
                  <strong>{donation.food_name || "Unnamed food"}</strong>
                  <div className="text-muted text-sm flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <Utensils size={14} />
                      {donation.quantity || "Unknown"} portions
                      {donation.food_type ? ` - ${donation.food_type}` : ""}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={14} />
                      {donation.location || "Location unavailable"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={14} />
                      {expiryLabel(donation.expiry_time)}
                    </span>
                  </div>
                </div>
              ))}
              {donations.length === 0 && (
                <p className="text-muted text-sm">No donations have been posted yet.</p>
              )}
            </div>
          </div>

          <div className="card animate-fade-in stagger-3">
            <h2 className="section-title">
              <span className="badge badge-solid">{requests.length}</span>
              Acceptor Food Requests
            </h2>
            <div className="flex-col gap-4 mt-4">
              {requests.map((request, index) => (
                <div key={rowKey(request, index)} className="list-item">
                  <strong>{request.food_name || "Food request"}</strong>
                  <div className="text-muted text-sm flex-col gap-2">
                    <span>{request.quantity || "Unknown"} portions needed</span>
                    <span className="flex items-center gap-2">
                      <MapPin size={14} />
                      {request.location || "Location unavailable"}
                    </span>
                    <span className="badge badge-outline" style={{ width: "fit-content" }}>
                      {request.urgency || "medium"} urgency
                    </span>
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-muted text-sm">No acceptor requests have been posted yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
