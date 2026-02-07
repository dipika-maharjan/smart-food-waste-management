import { useEffect, useState } from "react";
import { getAnalytics } from "../services/foodService";
import Navbar from "../components/Navbar";
import "../styles/Analytics.css";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-container">
        <Navbar />
        <main className="analytics-page">
          <div className="loading">Loading analytics...</div>
        </main>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <Navbar />
        <main className="analytics-page">
          <div className="empty-state">
            <p>Failed to load analytics data</p>
          </div>
        </main>
      </div>
    );
  }

  const { summary, expiry_status, waste_by_category, waste_by_reason } = analytics;

  // Calculate percentages
  const wastePercentage = summary.total_items > 0 
    ? ((summary.wasted / summary.total_items) * 100).toFixed(1)
    : 0;
  
  const usageRate = summary.total_items > 0
    ? ((summary.used / summary.total_items) * 100).toFixed(1)
    : 0;

  const donationRate = summary.total_items > 0
    ? ((summary.donated / summary.total_items) * 100).toFixed(1)
    : 0;

  return (
    <div className="analytics-container">
      <Navbar />
      <main className="analytics-page">
        <div className="analytics-header">
          <h1>📈 Waste Analytics</h1>
          <p className="analytics-subtitle">Track and analyze your food consumption patterns</p>
        </div>

        {/* Summary Cards */}
        <div className="analytics-section">
          <h2>Overview</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <h3>Total Items</h3>
                <p className="card-value">{summary.total_items}</p>
              </div>
            </div>

            <div className="summary-card available">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <h3>Available</h3>
                <p className="card-value">{summary.available}</p>
              </div>
            </div>

            <div className="summary-card success">
              <div className="card-icon">✓</div>
              <div className="card-content">
                <h3>Used</h3>
                <p className="card-value">{summary.used}</p>
                <p className="card-percentage">{usageRate}% of total</p>
              </div>
            </div>

            <div className="summary-card info">
              <div className="card-icon">❤️</div>
              <div className="card-content">
                <h3>Donated</h3>
                <p className="card-value">{summary.donated}</p>
                <p className="card-percentage">{donationRate}% of total</p>
              </div>
            </div>

            <div className="summary-card danger">
              <div className="card-icon">🗑️</div>
              <div className="card-content">
                <h3>Wasted</h3>
                <p className="card-value">{summary.wasted}</p>
                <p className="card-percentage">{wastePercentage}% of total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Status */}
        <div className="analytics-section">
          <h2>Current Inventory Health</h2>
          <div className="expiry-cards">
            <div className="expiry-card fresh">
              <h3>✅ Fresh Items</h3>
              <p className="expiry-value">{expiry_status.fresh}</p>
              <p className="expiry-desc">Items in good condition</p>
            </div>
            <div className="expiry-card warning">
              <h3>⚠️ Near Expiry</h3>
              <p className="expiry-value">{expiry_status.near_expiry}</p>
              <p className="expiry-desc">Items expiring in 1-3 days</p>
            </div>
            <div className="expiry-card danger">
              <h3>❌ Expired</h3>
              <p className="expiry-value">{expiry_status.expired}</p>
              <p className="expiry-desc">Items past expiry date</p>
            </div>
          </div>
        </div>

        {/* Waste by Category */}
        {Object.keys(waste_by_category).length > 0 && (
          <div className="analytics-section">
            <h2>Waste by Category</h2>
            <div className="category-list">
              {Object.entries(waste_by_category)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category}</span>
                      <span className="category-count">{count} items wasted</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-bar-fill"
                        style={{ 
                          width: `${(count / Math.max(...Object.values(waste_by_category))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Waste by Reason */}
        {Object.keys(waste_by_reason).length > 0 && (
          <div className="analytics-section">
            <h2>Waste by Reason</h2>
            <div className="reason-list">
              {Object.entries(waste_by_reason)
                .sort((a, b) => b[1] - a[1])
                .map(([reason, count]) => (
                  <div key={reason} className="reason-item">
                    <div className="reason-info">
                      <span className="reason-name">{reason}</span>
                      <span className="reason-count">{count} items</span>
                    </div>
                    <div className="reason-bar">
                      <div 
                        className="reason-bar-fill"
                        style={{ 
                          width: `${(count / Math.max(...Object.values(waste_by_reason))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="analytics-section">
          <h2>💡 Insights & Recommendations</h2>
          <div className="insights-list">
            {wastePercentage > 20 && (
              <div className="insight-card danger">
                <h4>⚠️ High Waste Rate</h4>
                <p>Your waste rate is {wastePercentage}%. Consider meal planning and proper storage to reduce waste.</p>
              </div>
            )}
            
            {wastePercentage <= 10 && (
              <div className="insight-card success">
                <h4>✅ Great Job!</h4>
                <p>Your waste rate is only {wastePercentage}%. Keep up the excellent work!</p>
              </div>
            )}

            {expiry_status.near_expiry > 0 && (
              <div className="insight-card warning">
                <h4>⚠️ Items Need Attention</h4>
                <p>You have {expiry_status.near_expiry} items expiring soon. Check the Alerts page to take action.</p>
              </div>
            )}

            {donationRate > 0 && (
              <div className="insight-card info">
                <h4>❤️ Thank You for Donating!</h4>
                <p>You've donated {donationRate}% of items. Your contribution helps those in need!</p>
              </div>
            )}

            {summary.total_items === 0 && (
              <div className="insight-card info">
                <h4>📦 Getting Started</h4>
                <p>Add some food items to start tracking and reducing waste!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
