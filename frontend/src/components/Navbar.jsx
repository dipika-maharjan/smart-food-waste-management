import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">Smart Food Waste</div>
      <ul className="nav-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/add-item">Add Item</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
        <li><Link to="/alerts">Alerts</Link></li>
        <li><Link to="/donations">Donations</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
