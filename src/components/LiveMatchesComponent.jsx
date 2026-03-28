import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { format, isPast, parseISO } from 'date-fns';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function LiveMatchesComponent() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch current matches
      const { data: matchesData } = await supabase.from('matches').select('*');
      const currentMatches = matchesData || [];
      
      const matchedDonationIds = new Set(currentMatches.map(m => m.donation_id));
      const matchedRequestIds = new Set(currentMatches.map(m => m.request_id));

      // 2. Fetch donations & requests
      const { data: donData, error: donError } = await supabase.from('donations').select('*');
      const { data: reqData, error: reqError } = await supabase.from('requests').select('*');
      
      const validDonations = (donData || []).filter(d => d.expiry_time && !isPast(parseISO(d.expiry_time)));
      const allRequests = reqData || [];

      // 3. Perform Match Algorithm
      const newMatches = [];
      const localMatchedDonationIds = new Set(matchedDonationIds);

      for (const req of allRequests) {
        if (!matchedRequestIds.has(req.id)) {
          // Find matching donations (same general location, available volume)
          // Simple string includes or match logic. Here we use an exact or contains match.
          let availableDons = validDonations.filter(d => 
            !localMatchedDonationIds.has(d.id) && 
            (d.location.includes(req.location) || req.location.includes(d.location)) && 
            d.quantity >= (req.quantity_needed * 0.8) // close or more quantity
          );

          if (availableDons.length > 0) {
            // Sort by earliest expiry first
            availableDons.sort((a, b) => parseISO(a.expiry_time) - parseISO(b.expiry_time));
            const bestMatch = availableDons[0];
            
            newMatches.push({
              donation_id: bestMatch.id,
              request_id: req.id,
              status: 'matched'
            });
            localMatchedDonationIds.add(bestMatch.id);
          }
        }
      }

      if (newMatches.length > 0) {
        await supabase.from('matches').insert(newMatches);
        // refresh matches
        const { data: finalMatchesData } = await supabase.from('matches').select('*');
        setMatches(finalMatchesData || []);
      } else {
        setMatches(currentMatches);
      }

      setDonations(validDonations);
      setRequests(allRequests);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime changes
    const donSub = supabase.channel('donations_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchData).subscribe();
    const reqSub = supabase.channel('requests_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchData).subscribe();
    const matchSub = supabase.channel('matches_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(donSub);
      supabase.removeChannel(reqSub);
      supabase.removeChannel(matchSub);
    }
  }, []);

  // Helper to construct match display
  const matchedDonations = new Set(matches.map(m => m.donation_id));
  const matchedRequests = new Set(matches.map(m => m.request_id));

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Live Matches Dashboard</h1>
        <button className="btn btn-secondary" onClick={fetchData} style={{ width: 'auto' }} disabled={loading}>
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="list-grid mt-4">
        {/* Unmatched Requests */}
        <div className="card">
          <h2 className="text-secondary flex items-center gap-2 mb-2"><span className="badge" style={{backgroundColor: 'var(--secondary)', color: 'white'}}>{requests.filter(r => !matchedRequests.has(r.id)).length}</span> Open Requests</h2>
          <div className="flex-col gap-2">
            {requests.filter(r => !matchedRequests.has(r.id)).map(req => (
              <div key={req.id} className="list-item" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <div className="flex justify-between items-center">
                  <strong>{req.quantity_needed} meals</strong>
                  <span className={`badge badge-urgency-${req.urgency}`}>{req.urgency}</span>
                </div>
                <div className="text-muted text-sm">{req.location}</div>
              </div>
            ))}
            {requests.filter(r => !matchedRequests.has(r.id)).length === 0 && <p className="text-muted">No open requests.</p>}
          </div>
        </div>

        {/* Unmatched Donations */}
        <div className="card">
          <h2 className="text-primary flex items-center gap-2 mb-2"><span className="badge" style={{backgroundColor: 'var(--primary)', color: 'white'}}>{donations.filter(d => !matchedDonations.has(d.id)).length}</span> Available Donations</h2>
          <div className="flex-col gap-2">
             {donations.filter(d => !matchedDonations.has(d.id)).map(don => (
              <div key={don.id} className="list-item" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                 <div className="flex justify-between items-center">
                  <strong>{don.food_name} ({don.quantity})</strong>
                  <span className={don.food_type === 'veg' ? 'badge badge-veg' : 'badge badge-nonveg'}>{don.food_type}</span>
                 </div>
                 <div className="text-muted text-sm">{don.location} • Expires: {don.expiry_time ? format(parseISO(don.expiry_time), 'PPp') : 'N/A'}</div>
              </div>
             ))}
             {donations.filter(d => !matchedDonations.has(d.id)).length === 0 && <p className="text-muted">No available donations.</p>}
          </div>
        </div>

        {/* Successful Matches */}
        <div className="card">
          <h2 className="flex items-center gap-2 mb-2" style={{color: '#8B5CF6'}}><span className="badge" style={{backgroundColor: '#8B5CF6', color: 'white'}}>{matches.length}</span> Active Matches</h2>
          <div className="flex-col gap-2">
             {matches.map(m => {
               const don = donations.find(d => d.id === m.donation_id);
               const req = requests.find(r => r.id === m.request_id);
               if (!don || !req) return null;
               
               return (
                 <div key={m.id} className="list-item" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                   <div className="flex items-center gap-2" style={{ color: '#8B5CF6' }}>
                     <CheckCircle2 size={16} /> <strong>Match Found!</strong>
                   </div>
                   <div className="text-sm">
                      <span className="text-primary">{don.food_name} ({don.quantity})</span> 
                      {' -> '} 
                      <span className="text-secondary">Req ({req.quantity_needed})</span>
                   </div>
                   <div className="text-muted text-sm">Loc: {don.location}</div>
                 </div>
               )
             })}
             {matches.length === 0 && <p className="text-muted">No matches yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
