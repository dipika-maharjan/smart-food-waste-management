import { useEffect, useState } from "react";
import { getInventory } from "../services/foodService";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Button from "../components/Button";

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [nearExpiryCount, setNearExpiryCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [usedCount, setUsedCount] = useState(0);

  const fetchInventory = async () => {
    const data = await getInventory();
    setInventory(data);

    const today = new Date();
    let near = 0;
    let expired = 0;
    let used = 0;

    data.forEach(item => {
      if (item.status === "Used") {
        used++;
        return;
      }
      
      const expiry = new Date(item.expiry_date);
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) expired++;
      else if (diffDays <= 3) near++;
    });

    setNearExpiryCount(near);
    setExpiredCount(expired);
    setUsedCount(used);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const totalAvailable = inventory.filter(item => item.status === "Available").length;

  return (
    <div className="dashboard-container">
      <Navbar />
      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to Smart Food Waste Reduction System</p>
          </div>
          <Link to="/add-item">
            <Button variant="primary" size="lg" icon="➕">
              Add New Item
            </Button>
          </Link>
        </div>

        <section className="dashboard-stats">
          <Card 
            title="Total Items" 
            value={inventory.length}
            icon="📦"
            variant="info"
          />
          <Card 
            title="Available" 
            value={totalAvailable}
            icon="✅"
            variant="success"
            subtitle="Ready to use"
          />
          <Card 
            title="Near Expiry" 
            value={nearExpiryCount}
            icon="⏰"
            variant="warning"
            subtitle="Within 3 days"
          />
          <Card 
            title="Expired" 
            value={expiredCount}
            icon="❌"
            variant="danger"
            subtitle="Past expiry date"
          />
        </section>

        <section className="dashboard-quick-links">
          <h2>Quick Actions</h2>
          <div className="links-grid">
            <Link to="/inventory" className="quick-link">
              <div className="link-icon">📋</div>
              <div className="link-content">
                <h3>Inventory</h3>
                <p>View and manage all food items</p>
              </div>
            </Link>
            <Link to="/alerts" className="quick-link">
              <div className="link-icon">🔔</div>
              <div className="link-content">
                <h3>Alerts</h3>
                <p>Check items expiring soon</p>
              </div>
            </Link>
            <Link to="/donations" className="quick-link">
              <div className="link-icon">🤝</div>
              <div className="link-content">
                <h3>Donations</h3>
                <p>Donate items to those in need</p>
              </div>
            </Link>
          </div>
        </section>

        {nearExpiryCount > 0 && (
          <section className="dashboard-alert-banner">
            <div className="banner-content">
              <span className="banner-icon">⚠️</span>
              <div>
                <h3>Action Required!</h3>
                <p>You have <strong>{nearExpiryCount} item(s)</strong> expiring soon. Please take action now.</p>
              </div>
              <Link to="/alerts">
                <Button variant="warning" size="md" icon="→">
                  View Alerts
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
