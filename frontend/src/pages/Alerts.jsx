import { useEffect, useState } from "react";
import { getInventory, updateFoodStatus } from "../services/foodService";
import "../styles/Alerts.css";
import Navbar from "../components/Navbar";
import AlertCard from "../components/AlertCard";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getInventory();

      // Filter items that are near expiry or expired
      const filtered = data.filter((item) => {
        if (item.status !== "Available") return false;
        
        const today = new Date();
        const expiry = new Date(item.expiry_date);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        return diffDays <= 3; // near expiry (1-3) or expired (0 or negative)
      });

      setAlerts(filtered);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateFoodStatus(id, status);
      fetchAlerts(); // refresh after action
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="alerts-container">
      <Navbar />
      <main className="alerts-page">
        <div className="alerts-header">
          <div>
            <h1>🔔 Expiry Alerts</h1>
            <p className="alerts-subtitle">Items that need your attention</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h2>Great! No alerts</h2>
            <p>All your food items are fresh. Keep monitoring them!</p>
          </div>
        ) : (
          <div className="alerts-container-content">
            <div className="alerts-stats">
              <div className="stat-item">
                <span className="stat-number">{alerts.length}</span>
                <span className="stat-label">Items needing action</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{alerts.filter(a => {
                  const today = new Date();
                  const expiry = new Date(a.expiry_date);
                  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                  return diffDays < 0;
                }).length}</span>
                <span className="stat-label">Expired items</span>
              </div>
            </div>

            <div className="alerts-list">
              {alerts.map((item) => (
                <AlertCard 
                  key={item.id} 
                  item={item} 
                  onAction={handleStatusUpdate}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Alerts;
