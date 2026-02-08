import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getCurrentUser } from '../services/authService';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="logo">🍎 Food Waste Tracker</div>
      
      {authenticated ? (
        <>
          <div className="nav-container">
            <ul className="nav-links">
              <li><Link to="/dashboard">📊 Dashboard</Link></li>
              <li className="divider"></li>
              <li><Link to="/add-item">➕ Add Item</Link></li>
              <li><Link to="/inventory">📦 Inventory</Link></li>
              <li><Link to="/alerts">⚠️ Alerts</Link></li>
              <li className="divider"></li>
              <li><Link to="/donation-centers">🏛️ Centers</Link></li>
              <li><Link to="/donation-offers">🤝 Offers</Link></li>
              <li className="divider"></li>
              <li><Link to="/analytics">📈 Analytics</Link></li>
            </ul>
          </div>
          
          <div className="auth-section">
            <span className="user-name">👤 {user?.name}</span>
            <Link to="/profile" className="profile-link">Profile</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </>
      ) : (
        <ul className="nav-links">
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register">Register</Link></li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
