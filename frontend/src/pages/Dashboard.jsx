import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInventory } from "../services/foodService";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    fresh: 0,
    nearExpiry: 0,
    expired: 0,
    used: 0,
    donated: 0,
    wasted: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
      
      // Calculate stats
      const total = data.length;
      const available = data.filter(item => item.status === "AVAILABLE").length;
      const fresh = data.filter(item => item.status === "AVAILABLE" && item.expiry_state === "FRESH").length;
      const nearExpiry = data.filter(item => item.status === "AVAILABLE" && item.expiry_state === "NEAR_EXPIRY").length;
      const expired = data.filter(item => item.status === "AVAILABLE" && item.expiry_state === "EXPIRED").length;
      const used = data.filter(item => item.status === "USED").length;
      const donated = data.filter(item => item.status === "DONATED").length;
      const wasted = data.filter(item => item.status === "WASTED").length;
      
      setStats({
        total,
        available,
        fresh,
        nearExpiry,
        expired,
        used,
        donated,
        wasted
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <Navbar />
      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>📊 Dashboard</h1>
            <p className="dashboard-subtitle">Overview of your food inventory</p>
          </div>
          <Link to="/add-item">
            <button className="btn btn-primary">➕ Add New Item</button>
          </Link>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>Total Items</h3>
                  <p className="stat-value">{stats.total}</p>
                </div>
              </div>
              
              <div className="stat-card available">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Available</h3>
                  <p className="stat-value">{stats.available}</p>
                </div>
              </div>
              
              <div className="stat-card warning">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <h3>Near Expiry</h3>
                  <p className="stat-value">{stats.nearExpiry}</p>
                </div>
              </div>
              
              <div className="stat-card danger">
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                  <h3>Expired</h3>
                  <p className="stat-value">{stats.expired}</p>
                </div>
              </div>
            </div>

            {/* Alert Banner */}
            {(stats.nearExpiry > 0 || stats.expired > 0) && (
              <div className="alert-banner">
                <div className="alert-content">
                  <span className="alert-icon">🚨</span>
                  <div>
                    <h3>Action Required!</h3>
                    <p>
                      You have {stats.nearExpiry} item(s) expiring soon and {stats.expired} expired item(s).
                    </p>
                  </div>
                  <Link to="/alerts">
                    <button className="btn btn-warning">View Alerts</button>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="quick-links">
              <h2>Quick Actions</h2>
              <div className="links-grid">
                <Link to="/inventory" className="quick-link-card">
                  <div className="link-icon">📋</div>
                  <div>
                    <h3>Manage Inventory</h3>
                    <p>View and update all food items</p>
                  </div>
                </Link>
                
                <Link to="/alerts" className="quick-link-card">
                  <div className="link-icon">🔔</div>
                  <div>
                    <h3>Expiry Alerts</h3>
                    <p>Check items requiring attention</p>
                  </div>
                </Link>
                
                <Link to="/analytics" className="quick-link-card">
                  <div className="link-icon">📈</div>
                  <div>
                    <h3>View Analytics</h3>
                    <p>Track usage and waste patterns</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Summary Section */}
            <div className="summary-section">
              <h2>Usage Summary</h2>
              <div className="summary-grid">
                <div className="summary-item success">
                  <span className="summary-icon">✓</span>
                  <span className="summary-label">Used</span>
                  <span className="summary-value">{stats.used}</span>
                </div>
                <div className="summary-item info">
                  <span className="summary-icon">❤️</span>
                  <span className="summary-label">Donated</span>
                  <span className="summary-value">{stats.donated}</span>
                </div>
                <div className="summary-item danger">
                  <span className="summary-icon">🗑️</span>
                  <span className="summary-label">Wasted</span>
                  <span className="summary-value">{stats.wasted}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
