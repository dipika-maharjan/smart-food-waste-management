import { useEffect, useState } from "react";
import { getInventory, updateFoodStatus } from "../services/foodService";
import Navbar from "../components/Navbar";
import "../styles/Alerts.css";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    expired: 0,
    nearExpiry: 0
  });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      
      // Filter only AVAILABLE items that are near expiry or expired
      const alertItems = data.filter(item => 
        item.status === "AVAILABLE" && 
        (item.expiry_state === "NEAR_EXPIRY" || item.expiry_state === "EXPIRED")
      );

      // Sort by days left (most urgent first)
      alertItems.sort((a, b) => (a.days_left || 0) - (b.days_left || 0));

      setAlerts(alertItems);
      setStats({
        total: alertItems.length,
        expired: alertItems.filter(i => i.expiry_state === "EXPIRED").length,
        nearExpiry: alertItems.filter(i => i.expiry_state === "NEAR_EXPIRY").length
      });
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAction = async (id, action) => {
    let reason = null;
    if (action === "WASTED") {
      reason = prompt("Please provide a reason for waste:");
      if (!reason) return;
    }

    try {
      await updateFoodStatus(id, action, reason);
      await fetchAlerts();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getUrgencyBadge = (expiryState, daysLeft) => {
    if (expiryState === "EXPIRED") {
      return <span className="urgency-badge expired">🔴 EXPIRED</span>;
    }
    if (daysLeft === 0) {
      return <span className="urgency-badge today">🔴 Expires Today</span>;
    }
    if (daysLeft === 1) {
      return <span className="urgency-badge tomorrow">🟠 Expires Tomorrow</span>;
    }
    return <span className="urgency-badge soon">🟡 {daysLeft} days left</span>;
  };

  return (
    <div className="alerts-container">
      <Navbar />
      <main className="alerts-page">
        <div className="alerts-header">
          <h1>🔔 Expiry Alerts</h1>
          <p className="alerts-subtitle">Items requiring immediate attention</p>
        </div>

        {/* Stats */}
        <div className="alerts-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Alerts</span>
          </div>
          <div className="stat-item expired">
            <span className="stat-number">{stats.expired}</span>
            <span className="stat-label">Expired</span>
          </div>
          <div className="stat-item warning">
            <span className="stat-number">{stats.nearExpiry}</span>
            <span className="stat-label">Near Expiry</span>
          </div>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h2>All Clear!</h2>
            <p>No items requiring immediate attention</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map(item => (
              <div key={item.id} className="alert-card">
                <div className="alert-header">
                  <div>
                    <h3>{item.name}</h3>
                    {getUrgencyBadge(item.expiry_state, item.days_left)}
                  </div>
                  <div className="alert-quantity">
                    {item.quantity} {item.unit}
                  </div>
                </div>

                <div className="alert-details">
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{item.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expiry Date:</span>
                    <span className="detail-value">{item.expiry_date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Storage:</span>
                    <span className="detail-value">{item.storage_location || "—"}</span>
                  </div>
                </div>

                <div className="alert-actions">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleAction(item.id, "USED")}
                  >
                    ✓ Mark as Used
                  </button>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleAction(item.id, "DONATED")}
                  >
                    ❤️ Donate
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleAction(item.id, "WASTED")}
                  >
                    🗑️ Mark as Wasted
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Alerts;
