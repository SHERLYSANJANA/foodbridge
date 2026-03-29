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
      const { data: matchesData } = await supabase.from('matches').select('*');
      const currentMatches = matchesData || [];
      
      const matchedDonationIds = new Set(currentMatches.map(m => m.donation_id));
      const matchedRequestIds = new Set(currentMatches.map(m => m.request_id));

      const { data: donData } = await supabase.from('donations').select('*');
      const { data: reqData } = await supabase.from('requests').select('*');
      
      const validDonations = (donData || []).filter(d => d.expiry_time && !isPast(parseISO(d.expiry_time)));
      const allRequests = reqData || [];

      const newMatches = [];
      const localMatchedDonationIds = new Set(matchedDonationIds);

      for (const req of allRequests) {
        if (!matchedRequestIds.has(req.id)) {
          let availableDons = validDonations.filter(d => 
            !localMatchedDonationIds.has(d.id) && 
            (req.food_name && d.food_name ? d.food_name.toLowerCase().includes(req.food_name.toLowerCase()) : true) && 
            (req.location && d.location ? (d.location.toLowerCase().includes(req.location.toLowerCase()) || req.location.toLowerCase().includes(d.location.toLowerCase())) : true) && 
            d.quantity >= ((req.quantity || 0) * 0.8)
          );

          if (availableDons.length > 0) {
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
    
    const donSub = supabase.channel('donations_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchData).subscribe();
    const reqSub = supabase.channel('requests_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchData).subscribe();
    const matchSub = supabase.channel('matches_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(donSub);
      supabase.removeChannel(reqSub);
      supabase.removeChannel(matchSub);
    }
  }, []);

  const matchedDonations = new Set(matches.map(m => m.donation_id));
  const matchedRequests = new Set(matches.map(m => m.request_id));

  return (
    <div className="animate-fade-in stagger-1">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Live Matches Dashboard</h1>
        <button className="btn btn-secondary" onClick={fetchData} style={{ width: 'auto', padding: '0.75rem 1.5rem' }} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      <div className="list-grid">
        {/* Unmatched Requests */}
        <div className="card animate-fade-in stagger-2">
          <h2 className="section-title"><span className="badge badge-outline">{requests.filter(r => !matchedRequests.has(r.id)).length}</span> Open Requests</h2>
          <div className="flex-col gap-4 mt-4">
            {requests.filter(r => !matchedRequests.has(r.id)).map((req, idx) => (
              <div key={req.id} className={`list-item animate-fade-in stagger-${(idx % 5) + 1}`}>
                <div className="flex justify-between items-center">
                  <strong>{req.quantity} x {req.food_name}</strong>
                  <span className={`badge badge-urgency-${req.urgency}`}>{req.urgency}</span>
                </div>
                <div className="text-muted text-sm">{req.location || 'Location not specified'}</div>
              </div>
            ))}
            {requests.filter(r => !matchedRequests.has(r.id)).length === 0 && <p className="text-muted text-sm" style={{padding: '1rem 0'}}>No open requests.</p>}
          </div>
        </div>

        {/* Unmatched Donations */}
        <div className="card animate-fade-in stagger-3">
          <h2 className="section-title"><span className="badge badge-solid">{donations.filter(d => !matchedDonations.has(d.id)).length}</span> Available Donations</h2>
          <div className="flex-col gap-4 mt-4">
             {donations.filter(d => !matchedDonations.has(d.id)).map((don, idx) => (
              <div key={don.id} className={`list-item animate-fade-in stagger-${(idx % 5) + 1}`}>
                 <div className="flex justify-between items-center">
                  <strong>{don.food_name} ({don.quantity})</strong>
                  <span className={don.food_type === 'veg' ? 'badge badge-veg' : 'badge badge-nonveg'}>{don.food_type}</span>
                 </div>
                 <div className="text-muted text-sm">{don.location} • Expires: {don.expiry_time ? format(parseISO(don.expiry_time), 'PPp') : 'N/A'}</div>
              </div>
             ))}
             {donations.filter(d => !matchedDonations.has(d.id)).length === 0 && <p className="text-muted text-sm" style={{padding: '1rem 0'}}>No available donations.</p>}
          </div>
        </div>

        {/* Successful Matches */}
        <div className="card animate-fade-in stagger-4" style={{borderColor: 'rgba(255,255,255,0.2)'}}>
          <h2 className="section-title text-white"><span className="badge badge-solid">{matches.length}</span> Active Matches</h2>
          <div className="flex-col gap-4 mt-4">
             {matches.map((m, idx) => {
               const don = donations.find(d => d.id === m.donation_id);
               const req = requests.find(r => r.id === m.request_id);
               if (!don || !req) return null;
               
               return (
                 <div key={m.id} className={`list-item animate-fade-in stagger-${(idx % 5) + 1}`} style={{borderColor: 'rgba(255,255,255,0.2)'}}>
                   <div className="flex items-center gap-2 mb-2 text-white">
                     <CheckCircle2 size={16} /> <strong style={{fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Match Secured</strong>
                   </div>
                   <div className="text-sm flex flex-col gap-1">
                      <span><span className="text-muted">Donation:</span> {don.food_name} ({don.quantity})</span> 
                      <span><span className="text-muted">Request:</span> Req ({req.quantity} - {req.food_name || 'Food'})</span>
                   </div>
                   <div className="text-muted text-sm mt-2 pt-2" style={{borderTop: '1px solid #222'}}>Location Transfer: {don.location}</div>
                 </div>
               )
             })}
             {matches.length === 0 && <p className="text-muted text-sm" style={{padding: '1rem 0'}}>No matches yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
