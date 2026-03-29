import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { format, isPast, parseISO, formatDistanceToNow } from 'date-fns';
import { RefreshCw, CheckCircle2, Clock, MapPin, PackageOpen, HandHeart, XCircle } from 'lucide-react';

export default function LiveMatchesComponent() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState('donor');
  const [donations, setDonations] = useState([]);
  const [matches, setMatches] = useState([]); 
  const [requests, setRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const userRole = session?.user?.user_metadata?.user_role || 'donor';
      setRole(userRole);

      const { data: donData } = await supabase.from('donations').select('*');
      const { data: reqData } = await supabase.from('requests').select('*');
      const { data: matchData } = await supabase.from('matches').select('*');
      
      const validDonations = (donData || []).filter(d => d.expiry_time && !isPast(parseISO(d.expiry_time)));
      setDonations(validDonations);
      setRequests(reqData || []);
      setMatches(matchData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const donSub = supabase.channel('dons').on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchData).subscribe();
    const matchSub = supabase.channel('mats').on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchData).subscribe();
    return () => {
      supabase.removeChannel(donSub);
      supabase.removeChannel(matchSub);
    }
  }, []);

  const handleRequestFood = async (donationId) => {
    setActionLoading(donationId);
    try {
      const { data: req, error: reqErr } = await supabase.from('requests').insert([{
        food_name: 'Direct Donation Request',
        quantity: 1,
        urgency: 'high',
        location: 'NGO Facility'
      }]).select().single();
      
      if (!reqErr && req) {
        await supabase.from('matches').insert([{
          donation_id: donationId,
          request_id: req.id,
          status: 'pending'
        }]);
      }
      fetchData();
    } catch (e) { console.error(e) }
    setActionLoading(null);
  };

  const handleUpdateMatch = async (matchId, newStatus) => {
    setActionLoading(matchId);
    await supabase.from('matches').update({ status: newStatus }).eq('id', matchId);
    fetchData();
    setActionLoading(null);
  };
  
  return (
    <div className="animate-fade-in stagger-1">
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Logistics Dashboard</h1>
        <button className="btn btn-secondary" onClick={fetchData} style={{ width: 'auto', padding: '0.75rem 1.5rem' }} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="list-grid">
        <div className="card animate-fade-in stagger-2">
          <h2 className="section-title"><span className="badge badge-solid">{donations.length}</span> Available Donations</h2>
          <div className="flex-col gap-4 mt-4">
             {donations.map((don) => {
                 const isRequested = matches.some(m => m.donation_id === don.id && m.status !== 'rejected');
                 const isAccepted = matches.some(m => m.donation_id === don.id && m.status === 'accepted');
                 
                 return (
                   <div key={don.id} className="list-item" style={{opacity: isAccepted ? 0.3 : 1}}>
                     <div className="flex justify-between items-center mb-2">
                       <strong>{don.food_name} <span className="text-muted">({don.quantity} pkgs)</span></strong>
                       {isAccepted ? (
                         <span className="badge"><CheckCircle2 size={12}/> Claimed</span>
                       ) : isRequested ? (
                         <span className="badge badge-outline"><Clock size={12}/> Pending Approval</span>
                       ) : role === 'acceptor' && (
                         <button 
                           className="btn btn-primary" 
                           style={{padding: '0.4rem 0.8rem', width: 'auto', fontSize: '0.85rem'}}
                           onClick={() => handleRequestFood(don.id)}
                           disabled={actionLoading === don.id}
                         >
                           <HandHeart size={14}/> Request
                         </button>
                       )}
                     </div>
                     <div className="text-muted text-sm flex gap-3 mt-2">
                       <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><MapPin size={12}/> {don.location}</span>
                       <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Clock size={12}/> {don.expiry_time ? formatDistanceToNow(parseISO(don.expiry_time), {addSuffix:true}) : 'No expiry'}</span>
                     </div>
                   </div>
                 )
               })}
               {donations.length === 0 && <p className="text-muted text-sm">No available donations posted today.</p>}
            </div>
          </div>
        {role === 'donor' && (
          <div className="card animate-fade-in stagger-3">
            <h2 className="section-title"><span className="badge badge-solid">{matches.filter(m => m.status === 'pending').length}</span> Incoming Requests</h2>
            <div className="flex-col gap-4 mt-4">
              {matches.filter(m => m.status === 'pending').map((m) => {
                const don = donations.find(d => d.id === m.donation_id);
                if (!don) return null;
                return (
                  <div key={m.id} className="list-item" style={{borderColor: 'var(--text-main)'}}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong>NGO Request for {don.food_name}</strong>
                        <div className="text-muted text-sm mt-1 mb-3">Location Context: {don.location}</div>
                        <span className="badge badge-outline" style={{borderColor: '#F59E0B', color: '#F59E0B'}}>Awaiting Your Review</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="btn" style={{backgroundColor: '#10B981', color: '#fff', width: 'auto', padding: '0.5rem 1rem'}} onClick={() => handleUpdateMatch(m.id, 'accepted')} disabled={actionLoading === m.id}>
                           Accept Delivery
                        </button>
                        <button className="btn" style={{backgroundColor: 'transparent', color: '#EF4444', border: '1px solid #EF4444', width: 'auto', padding: '0.5rem 1rem'}} onClick={() => handleUpdateMatch(m.id, 'rejected')} disabled={actionLoading === m.id}>
                           Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {matches.filter(m => m.status === 'pending').length === 0 && <p className="text-muted text-sm">No pending requests right now.</p>}
            </div>
          </div>
        )}

        <div className="card animate-fade-in stagger-4">
          <h2 className="section-title text-white"><span className="badge badge-solid">{matches.filter(m => m.status === 'accepted').length}</span> Active Transfers</h2>
          <div className="flex-col gap-4 mt-4">
             {matches.filter(m => m.status === 'accepted').map((m) => {
               const don = donations.find(d => d.id === m.donation_id);
               if (!don) return null;
               
               return (
                 <div key={m.id} className="list-item" style={{borderColor: 'rgba(255,255,255,0.2)'}}>
                   <div className="flex items-center gap-3 justify-between mb-3">
                     <span className="flex items-center gap-2 text-white">
                       <CheckCircle2 size={16} color="#10B981" /> <strong>ACCEPTED TRANSFER</strong>
                     </span>
                     <span className="badge" style={{background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid #10B981'}}>In Progress</span>
                   </div>
                   <div className="text-sm border-l-2 pl-3" style={{borderColor: '#333'}}>
                      <span className="text-muted uppercase text-xs tracking-wider">Payload</span><br/>
                      {don.quantity}x {don.food_name}
                   </div>
                   <div className="text-muted text-sm mt-4 pt-4 flex justify-between items-center" style={{borderTop: '1px solid #222'}}>
                     <span className="flex items-center gap-1"><MapPin size={12}/> Route: {don.location} → Verified NGO</span>
                     <span className="badge badge-ghost">Est {Math.floor(Math.random() * 8) + 2} km away</span>
                   </div>
                 </div>
               )
             })}
             {matches.filter(m => m.status === 'accepted').length === 0 && <p className="text-muted text-sm" style={{padding: '1rem 0'}}>No active accepted transfers yet.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
