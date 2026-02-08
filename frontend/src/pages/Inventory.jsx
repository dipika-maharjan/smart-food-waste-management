import { useEffect, useState } from "react";
import { getInventory, updateFoodStatus, deleteFoodItem } from "../services/foodService";
import "../styles/Inventory.css";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [wasteReason, setWasteReason] = useState({});
  const [showReasonModal, setShowReasonModal] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
      setFilteredInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    let filtered = inventory;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredInventory(filtered);
  }, [searchTerm, statusFilter, inventory]);

  const handleStatusUpdate = async (id, status) => {
    // If status is WASTED, show modal to get reason
    if (status === "WASTED" && !wasteReason[id]) {
      setShowReasonModal(id);
      return;
    }

    try {
      const reason = status === "WASTED" ? wasteReason[id] : null;
      await updateFoodStatus(id, status, reason);
      await fetchInventory();
      setWasteReason(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setShowReasonModal(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await deleteFoodItem(id);
      await fetchInventory();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  const getExpiryBadge = (expiryState, daysLeft) => {
    if (!expiryState) return null;
    
    const badges = {
      "FRESH": { class: "badge-fresh", icon: "✅", text: `Fresh (${daysLeft}d)` },
      "NEAR_EXPIRY": { class: "badge-warning", icon: "⚠️", text: `${daysLeft}d left` },
      "EXPIRED": { class: "badge-expired", icon: "❌", text: "Expired" }
    };

    const badge = badges[expiryState];
    return badge ? (
      <span className={`badge ${badge.class}`}>
        {badge.icon} {badge.text}
      </span>
    ) : null;
  };

  const getStatusBadge = (status) => {
    const badges = {
      "AVAILABLE": { class: "badge-available", text: "Available" },
      "USED": { class: "badge-used", text: "Used" },
      "DONATED": { class: "badge-donated", text: "Donated" },
      "WASTED": { class: "badge-wasted", text: "Wasted" }
    };

    const badge = badges[status] || { class: "", text: status };
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const statusCounts = {
    ALL: inventory.length,
    AVAILABLE: inventory.filter(i => i.status === "AVAILABLE").length,
    USED: inventory.filter(i => i.status === "USED").length,
    DONATED: inventory.filter(i => i.status === "DONATED").length,
    WASTED: inventory.filter(i => i.status === "WASTED").length
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>📋 Food Inventory</h1>
        <p className="inventory-subtitle">Manage and track all your food items</p>
      </div>

      {/* Search and Filters */}
      <div className="inventory-controls">
        <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            {Object.keys(statusCounts).map(status => (
              <button
                key={status}
                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(status)}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="empty-state">
            <p>No items found. Add some food items to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Expiry Status</th>
                  <th>Storage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id}>
                    <td className="item-name">{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>{item.expiry_date}</td>
                    <td>{getExpiryBadge(item.expiry_state, item.days_left)}</td>
                    <td>{item.storage_location || "—"}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      {item.status === "AVAILABLE" ? (
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusUpdate(item.id, "USED")}
                            title="Mark as Used"
                          >
                            ✓ Use
                          </button>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleStatusUpdate(item.id, "DONATED")}
                            title="Mark as Donated"
                          >
                            ❤️ Donate
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusUpdate(item.id, "WASTED")}
                            title="Mark as Wasted"
                          >
                            🗑️ Waste
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Waste Reason Modal */}
        {showReasonModal && (
          <div className="modal-overlay" onClick={() => setShowReasonModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Reason for Waste</h3>
              <p>Please provide a reason for wasting this item:</p>
              <select
                className="form-input"
                value={wasteReason[showReasonModal] || ""}
                onChange={(e) => setWasteReason(prev => ({
                  ...prev,
                  [showReasonModal]: e.target.value
                }))}
              >
                <option value="">Select reason...</option>
                <option value="Expired">Expired</option>
                <option value="Spoiled">Spoiled</option>
                <option value="Overcooked">Overcooked</option>
                <option value="Leftovers discarded">Leftovers discarded</option>
                <option value="Moldy">Moldy</option>
                <option value="Other">Other</option>
              </select>
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleStatusUpdate(showReasonModal, "WASTED")}
                  disabled={!wasteReason[showReasonModal]}
                >
                  Confirm
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() =>{
                    setShowReasonModal(null);
                    setWasteReason(prev => {
                      const updated = { ...prev };
                      delete updated[showReasonModal];
                      return updated;
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Inventory;
