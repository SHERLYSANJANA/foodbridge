import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Utensils, HeartHandshake, ListOrdered, LogOut, Sun, Moon, Coffee, Leaf, Pizza, Apple, Carrot, Cherry, Cake, IceCream, Beef, ShieldCheck } from 'lucide-react';
import AddFoodComponent from './components/AddFoodComponent';
import RequestFoodComponent from './components/RequestFoodComponent';
import LiveMatchesComponent from './components/LiveMatchesComponent';
import VerificationComponent from './components/VerificationComponent';
import AuthComponent from './components/AuthComponent';
import LandingPageComponent from './components/LandingPageComponent';
import { supabase } from './supabaseClient';

const BackgroundArt = () => (
  <div className="global-bg-art">
    {/* Cluster Top Left */}
    <Utensils className="global-art-element" size={120} style={{ top: '5%', left: '3%', animationDelay: '0s', color: 'var(--art-color-1)' }} strokeWidth={1} />
    <Coffee className="global-art-element" size={70} style={{ top: '25%', left: '15%', animationDelay: '3s', color: 'var(--art-color-2)' }} strokeWidth={1} />
    <Cherry className="global-art-element" size={50} style={{ top: '8%', left: '20%', animationDelay: '1.5s', color: 'var(--art-color-4)' }} strokeWidth={1} />

    {/* Cluster Top Right */}
    <Pizza className="global-art-element" size={150} style={{ top: '5%', right: '5%', animationDelay: '1s', color: 'var(--art-color-3)' }} strokeWidth={1} />
    <Leaf className="global-art-element" size={80} style={{ top: '22%', right: '22%', animationDelay: '4.5s', color: 'var(--art-color-2)' }} strokeWidth={1} />

    {/* Cluster Mid Left */}
    <IceCream className="global-art-element" size={100} style={{ top: '45%', left: '8%', animationDelay: '2s', color: 'var(--art-color-4)' }} strokeWidth={1} />
    <Carrot className="global-art-element" size={130} style={{ top: '55%', left: '25%', animationDelay: '5s', color: 'var(--art-color-1)' }} strokeWidth={1} />

    {/* Cluster Mid Right */}
    <Apple className="global-art-element" size={90} style={{ top: '50%', right: '8%', animationDelay: '3.5s', color: 'var(--art-color-4)' }} strokeWidth={1} />
    <Utensils className="global-art-element" size={60} style={{ top: '40%', right: '22%', animationDelay: '0.5s', color: 'var(--art-color-3)' }} strokeWidth={1} />

    {/* Cluster Bottom Left */}
    <Cake className="global-art-element" size={140} style={{ bottom: '5%', left: '10%', animationDelay: '2.5s', color: 'var(--art-color-3)' }} strokeWidth={1} />
    <Leaf className="global-art-element" size={50} style={{ bottom: '25%', left: '28%', animationDelay: '6s', color: 'var(--art-color-2)' }} strokeWidth={1} />

    {/* Cluster Bottom Right */}
    <Coffee className="global-art-element" size={110} style={{ bottom: '10%', right: '12%', animationDelay: '1.8s', color: 'var(--art-color-1)' }} strokeWidth={1} />
    <Beef className="global-art-element" size={90} style={{ bottom: '25%', right: '28%', animationDelay: '0.8s', color: 'var(--art-color-2)' }} strokeWidth={1} />
    
    {/* Center Drift */}
    <Pizza className="global-art-element" size={180} style={{ top: '35%', left: '42%', animationDelay: '7s', color: 'var(--art-color-4)' }} strokeWidth={0.5} />
  </div>
);

function App() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('foodbridge-theme');
    if (savedTheme === 'light') {
      setIsLight(true);
      document.body.classList.add('light-mode');
    }

    const fetchSessionAndStatus = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        const { data } = await supabase.from('verification_requests').select('status').eq('donor_id', currentSession.user.id).order('created_at', { ascending: false }).limit(1);
        if (data && data.length > 0) {
          setVerifiedStatus(data[0].status);
        }
      }
      setLoading(false);
    };

    fetchSessionAndStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const { data } = await supabase.from('verification_requests').select('status').eq('donor_id', newSession.user.id).order('created_at', { ascending: false }).limit(1);
        if (data && data.length > 0) setVerifiedStatus(data[0].status);
      } else {
        setVerifiedStatus(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleTheme = () => {
    setIsLight(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('light-mode');
        localStorage.setItem('foodbridge-theme', 'light');
      } else {
        document.body.classList.remove('light-mode');
        localStorage.setItem('foodbridge-theme', 'dark');
      }
      return next;
    });
  };

  if (loading) {
    return <div className="app-container flex items-center justify-center text-muted" style={{ minHeight: '100vh' }}>Loading...</div>;
  }

  // Unauthenticated State (Hero or Auth)
  if (!session) {
    return (
      <div className="app-container">
        <BackgroundArt />
        {showAuth ? (
          <div style={{ width: '100vw', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
            <div className="flex justify-between items-center" style={{ padding: '2rem 4rem' }}>
              <div className="brand" style={{ marginBottom: 0 }}>
                <Utensils size={24} />
                FoodBridge
              </div>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => setShowAuth(false)}>
                Back to Home
              </button>
            </div>
            <AuthComponent />
          </div>
        ) : (
          <div style={{ width: '100vw', zIndex: 10 }}>
            <div className="flex justify-between items-center" style={{ padding: '2rem 8vw', position: 'absolute', top: 0, width: '100%', zIndex: 50 }}>
              <div className="brand" style={{ marginBottom: 0 }}>
                <Utensils size={28} />
                FoodBridge
              </div>
              <div className="flex gap-4 items-center">
                <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.65rem', borderRadius: '50%' }} onClick={toggleTheme}>
                  {isLight ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1.5rem', borderRadius: '99px' }} onClick={() => setShowAuth(true)}>
                  Sign In
                </button>
              </div>
            </div>
            <LandingPageComponent onNavigateAuth={() => setShowAuth(true)} />
          </div>
        )}
      </div>
    );
  }

  // Authenticated State (Sidebar Layout)
  const userMeta = session.user.user_metadata || {};
  const isAcceptor = userMeta.user_role === 'acceptor';

  return (
    <div className="app-container">
      <BackgroundArt />
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <Link to="/" className="brand">
            <Utensils size={24} /> FoodBridge
            {verifiedStatus === 'approved' && <ShieldCheck size={18} color="#10B981" style={{marginLeft: '0.4rem'}} title="Verified Donor" />}
          </Link>
          <div className="nav-links animate-fade-in stagger-1">
            {!isAcceptor && (
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                <Home size={20} /> Add Food
              </Link>
            )}
            {isAcceptor && (
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                <HeartHandshake size={20} /> Request Food
              </Link>
            )}
            <Link to="/matches" className={`nav-link ${location.pathname === '/matches' ? 'active' : ''}`}>
              <HeartHandshake size={20} /> Match Dashboard
            </Link>
            {session?.user?.user_metadata?.user_role === 'donor' && (
              <Link to="/verify-donor" className={`nav-link ${location.pathname === '/verify-donor' ? 'active' : ''}`}>
                <ShieldCheck size={20} /> Verify Account
              </Link>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }} className="animate-fade-in stagger-2 flex-col gap-2">
          <button onClick={toggleTheme} className="btn btn-secondary mb-2" style={{ justifyContent: 'flex-start' }}>
            {isLight ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
          </button>
          <button onClick={handleSignOut} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content relative overflow-auto h-screen" style={{ height: '100vh', overflowY: 'auto' }}>
        <Routes>
          {!isAcceptor && <Route path="/" element={<AddFoodComponent />} />}
          {isAcceptor && <Route path="/" element={<RequestFoodComponent />} />}
          <Route path="/matches" element={<LiveMatchesComponent />} />
          <Route path="/verify-donor" element={<VerificationComponent />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
