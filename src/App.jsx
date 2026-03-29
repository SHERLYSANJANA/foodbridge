import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Utensils, HeartHandshake, ListOrdered, LogOut } from 'lucide-react';
import AddFoodComponent from './components/AddFoodComponent';
import RequestFoodComponent from './components/RequestFoodComponent';
import LiveMatchesComponent from './components/LiveMatchesComponent';
import AuthComponent from './components/AuthComponent';
import LandingPageComponent from './components/LandingPageComponent';
import { supabase } from './supabaseClient';

function App() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="app-container flex items-center justify-center text-muted" style={{minHeight: '100vh'}}>Loading...</div>;
  }

  // Unauthenticated State (Hero or Auth)
  if (!session) {
    return (
      <div className="app-container">
        {showAuth ? (
          <div style={{ width: '100vw', display: 'flex', flexDirection: 'column' }}>
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
          <div style={{ width: '100vw' }}>
            <div className="flex justify-between items-center" style={{ padding: '2rem 8vw', position: 'absolute', top: 0, width: '100%', zIndex: 50 }}>
              <div className="brand" style={{ marginBottom: 0 }}>
                <Utensils size={28} />
                FoodBridge
              </div>
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1.5rem', borderRadius: '99px' }} onClick={() => setShowAuth(true)}>
                Sign In
              </button>
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
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <Link to="/" className="brand">
            <Utensils size={28} />
            FoodBridge
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
              <ListOrdered size={20} /> Live Matches
            </Link>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }} className="animate-fade-in stagger-2">
           <button onClick={handleSignOut} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
             <LogOut size={18} /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content relative overflow-auto h-screen" style={{height: '100vh', overflowY: 'auto'}}>
        <Routes>
          {!isAcceptor && <Route path="/" element={<AddFoodComponent />} />}
          {isAcceptor && <Route path="/" element={<RequestFoodComponent />} />}
          <Route path="/matches" element={<LiveMatchesComponent />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
