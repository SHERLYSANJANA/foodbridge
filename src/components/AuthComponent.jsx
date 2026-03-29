import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

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

        // Attempt to insert the profile data into a public 'users' table 
        // in case you are expecting the Table Editor to show it.
        if (data?.user) {
          try {
            await supabase.from('users').insert([
              { id: data.user.id, email: email, full_name: name, mobile: mobile, role: role }
            ]);
          } catch (e) {
            console.error("Optional insert to users table failed", e);
          }
        }

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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Error with Google Sign-In.');
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
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="radio" value="donor" checked={role === 'donor'} onChange={(e) => setRole(e.target.value)} /> Donor
                  </label>
                  <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
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

          <div className="animate-fade-in stagger-5" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Create Account</>)}
            </button>
            <button type="button" onClick={() => onGuestLogin(role)} className="btn btn-secondary" style={{ borderStyle: 'dashed' }}>
              Bypass Login (Dev Mode)
            </button>
          </div>
        </form>

        <div className="animate-fade-in stagger-5" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
        </div>

        <div className="animate-fade-in stagger-5" style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-secondary"
            style={{ width: '100%', backgroundColor: '#fff', color: '#000', borderColor: '#ddd' }}
            disabled={loading}
          >
            <GoogleIcon /> {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>
        </div>

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
