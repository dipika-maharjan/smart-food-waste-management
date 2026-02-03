import { useEffect, useState } from "react";
import { getInventory, updateFoodStatus } from "../services/foodService";
import "../styles/Inventory.css";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);

  // Fetch inventory from backend
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
      filterAndSearch(data, searchTerm, filterStatus);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearch = (data, search, status) => {
    let filtered = data;

    if (status !== "All") {
      filtered = filtered.filter(item => item.status === status);
    }

    if (search.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredInventory(filtered);
  };

  const handleSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    filterAndSearch(inventory, search, filterStatus);
  };

  const handleFilterStatus = (status) => {
    setFilterStatus(status);
    filterAndSearch(inventory, searchTerm, status);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Update status (Used / Wasted / Donated)
  const handleStatusUpdate = async (id, status) => {
    try {
      await updateFoodStatus(id, status);
      fetchInventory(); // refresh inventory after update
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Expired", class: "expired", icon: "❌" };
    if (diffDays === 0) return { label: "Today", class: "expires-today", icon: "🔴" };
    if (diffDays === 1) return { label: "Tomorrow", class: "expires-tomorrow", icon: "🟠" };
    if (diffDays <= 3) return { label: `${diffDays}d left`, class: "near-expiry", icon: "🟡" };
    return { label: "Fresh", class: "fresh", icon: "✅" };
  };

  return (
    <div className="inventory-container">
      <Navbar />
      <main className="inventory-page">
        <div className="inventory-header">
          <div>
            <h1>📋 Food Inventory</h1>
            <p className="inventory-subtitle">Manage your food items and track their status</p>
          </div>
        </div>

        <div className="inventory-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search by food name or category..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <span className="filter-label">Filter:</span>
            <Button
              variant={filterStatus === "All" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleFilterStatus("All")}
            >
              All ({inventory.length})
            </Button>
            <Button
              variant={filterStatus === "Available" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleFilterStatus("Available")}
            >
              Available ({inventory.filter(i => i.status === "Available").length})
            </Button>
            <Button
              variant={filterStatus === "Used" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleFilterStatus("Used")}
            >
              Used ({inventory.filter(i => i.status === "Used").length})
            </Button>
            <Button
              variant={filterStatus === "Donated" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleFilterStatus("Donated")}
            >
              Donated ({inventory.filter(i => i.status === "Donated").length})
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading inventory...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="empty-state">
            <p>📦 No items found</p>
            <p className="empty-text">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Food Name</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Purchase</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Storage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const expiryStatus = getExpiryStatus(item.expiry_date);
                  return (
                    <tr key={item.id} className={`status-${item.status.toLowerCase()}`}>
                      <td className="cell-name">
                        <span className="item-name">{item.name}</span>
                      </td>
                      <td>{item.category}</td>
                      <td className="cell-qty">{item.quantity} {item.unit}</td>
                      <td className="cell-date">{new Date(item.purchase_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`expiry-badge badge-${expiryStatus.class}`}>
                          {expiryStatus.icon} {expiryStatus.label}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.storage_location}</td>
                      <td className="cell-actions">
                        {item.status === "Available" && (
                          <div className="action-buttons">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, "Used")}
                              icon="✓"
                            >
                              Use
                            </Button>
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, "Donated")}
                              icon="🤝"
                            >
                              Donate
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, "Wasted")}
                              icon="🗑️"
                            >
                              Waste
                            </Button>
                          </div>
                        )}
                        {item.status !== "Available" && (
                          <span className="status-done">✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;
