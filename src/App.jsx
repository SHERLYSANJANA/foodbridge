import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Utensils, HeartHandshake, ListOrdered } from 'lucide-react';
import AddFoodComponent from './components/AddFoodComponent';
import RequestFoodComponent from './components/RequestFoodComponent';
import LiveMatchesComponent from './components/LiveMatchesComponent';

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="brand">
          <Utensils size={28} />
          FoodBridge
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={20} /> Add Food
          </Link>
          <Link to="/request" className={`nav-link ${location.pathname === '/request' ? 'active' : ''}`}>
            <HeartHandshake size={20} /> Request Food
          </Link>
          <Link to="/matches" className={`nav-link ${location.pathname === '/matches' ? 'active' : ''}`}>
            <ListOrdered size={20} /> Live Matches
          </Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<AddFoodComponent />} />
          <Route path="/request" element={<RequestFoodComponent />} />
          <Route path="/matches" element={<LiveMatchesComponent />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
