import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus } from 'lucide-react';

export default function AuthComponent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('donor');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, mobile: mobile, user_role: role }
          }
        });
        if (signUpError) throw signUpError;
        if (data?.user && data.user.identities && data.user.identities.length === 0) {
            setMsg("This email is already registered. Please sign in.");
        } else {
            setMsg("Check your email for the confirmation link! (If email confirmations are enabled)");
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="card stagger-1" style={{ maxWidth: '450px', width: '100%', border: '1px solid #333' }}>
        <h2 className="page-title text-center" style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>
          {isLogin ? 'Welcome Back' : 'Join FoodBridge'}
        </h2>
        
        {error && <div className="badge badge-outline" style={{ padding: '1rem', width: '100%', marginBottom: '1.5rem', display: 'block', textAlign: 'center' }}>{error}</div>}
        {msg && <div className="badge badge-ghost" style={{ padding: '1rem', width: '100%', marginBottom: '1.5rem', display: 'block', textAlign: 'center' }}>{msg}</div>}

        <form onSubmit={handleAuth} className="flex-col gap-2">
          {!isLogin && (
             <div className="animate-fade-in stagger-2">
               <div className="form-group mb-4">
                 <label className="form-label">I am a...</label>
                 <div className="flex gap-4" style={{ marginBottom: '0.5rem' }}>
                   <label className="flex items-center gap-2" style={{cursor: 'pointer'}}>
                     <input type="radio" value="donor" checked={role === 'donor'} onChange={(e) => setRole(e.target.value)} /> Donor
                   </label>
                   <label className="flex items-center gap-2" style={{cursor: 'pointer'}}>
                     <input type="radio" value="acceptor" checked={role === 'acceptor'} onChange={(e) => setRole(e.target.value)} /> NGO
                   </label>
                 </div>
               </div>
               <div className="form-group mb-4">
                 <label className="form-label">Full Name / Organization</label>
                 <input required type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
               </div>
               <div className="form-group mb-4">
                 <label className="form-label">Mobile (Optional)</label>
                 <input type="tel" className="form-input" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. +1 234 567 890" />
               </div>
             </div>
          )}

          <div className="form-group mb-4 animate-fade-in stagger-3">
            <label className="form-label">Email</label>
            <input required type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@example.com" />
          </div>

          <div className="form-group mb-4 animate-fade-in stagger-4">
            <label className="form-label">Password</label>
            <input required type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" />
          </div>

          <div className="animate-fade-in stagger-5" style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? <><LogIn size={18}/> Sign In</> : <><UserPlus size={18}/> Create Account</>)}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center animate-fade-in stagger-5">
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); setMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.target.style.color = '#fff'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
