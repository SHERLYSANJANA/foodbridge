import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Award, CheckCircle } from 'lucide-react';

export default function VerificationComponent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('unverified'); 
  
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    food_type: '',
    description: ''
  });

  useEffect(() => {
    const fetchAuthAndStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        
        // Polling existing validation applications
        const { data: requests } = await supabase.from('verification_requests')
          .select('*')
          .eq('donor_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (requests && requests.length > 0) {
          setStatus(requests[0].status); 
        }
      }
    };
    fetchAuthAndStatus();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);
    setMsg('');

    const { error } = await supabase.from('verification_requests').insert([{
      donor_id: session.user.id,
      name: formData.name,
      organization: formData.organization,
      food_type: formData.food_type,
      description: formData.description,
      status: 'pending'
    }]);

    setLoading(false);
    if (error) {
      setMsg('Error submitting request: ' + error.message);
    } else {
      setStatus('pending');
      setMsg('Application submitted successfully!');
    }
  };

  return (
    <div className="animate-fade-in stagger-1">
      <h1 className="page-title">Donor Verification</h1>
      <p className="hero-subtitle stagger-2" style={{maxWidth: '800px', marginBottom: '2rem'}}>
        Become a verified donor to earn a badge of trust, ensuring NFTs and NGOs can safely prioritize your logistics and handle surplus food optimally.
      </p>
      
      <div className="card animate-fade-in stagger-3" style={{ maxWidth: '600px' }}>
        {status === 'approved' ? (
          <div className="text-center" style={{padding: '3rem 1rem'}}>
            <Award size={64} className="mb-4 animate-pulse" color="#10B981" style={{margin: '0 auto'}}/>
            <h2 className="text-xl mb-2 font-bold">You are a Verified Donor</h2>
            <p className="text-muted">Thank you for proving your commitment to fighting food waste. Your verification badge is live on the entire platform!</p>
          </div>
        ) : status === 'pending' ? (
          <div className="text-center" style={{padding: '3rem 1rem'}}>
             <CheckCircle size={64} className="mb-4" style={{margin: '0 auto', color: '#F59E0B'}}/>
             <h2 className="text-xl mb-2 font-bold">Application Pending Review</h2>
             <p className="text-muted">Your application has been received and is currently under review by our moderation team. Check back shortly!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-col gap-4">
            {msg && <div className="badge badge-outline" style={{width: '100%', marginBottom: '1rem'}}>{msg}</div>}
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input required type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
            </div>

            <div className="form-group">
              <label className="form-label">Organization Name (or Individual)</label>
              <input required type="text" name="organization" className="form-input" value={formData.organization} onChange={handleChange} placeholder="e.g. Big Star Cafe" />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Food Offering Types</label>
              <input required type="text" name="food_type" className="form-input" value={formData.food_type} onChange={handleChange} placeholder="e.g. Perishable Meals, Canned Goods" />
            </div>

            <div className="form-group">
              <label className="form-label">Verification Description</label>
              <textarea required name="description" className="form-input" value={formData.description} onChange={handleChange} placeholder="Please briefly explain your sourcing strictly to assist NGOs in trusting the quality." rows={4} />
            </div>

            <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
              {loading ? 'Submitting Application...' : 'Apply for Verified Status'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
