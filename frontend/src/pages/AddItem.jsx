import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFoodItem } from "../services/foodService";
import Navbar from "../components/Navbar";
import "../styles/AddItem.css";

const AddItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    purchase_date: "",
    expiry_date: "",
    storage_location: ""
  });

  const categories = [
    "Vegetables", "Fruits", "Dairy", "Meat", "Grains",
    "Beverages", "Condiments", "Snacks", "Frozen", "Others"
  ];

  const units = ["kg", "g", "L", "ml", "pieces", "packets", "bottles", "boxes"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validation
    if (!formData.name || !formData.category || !formData.quantity || !formData.unit || !formData.expiry_date) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    if (parseFloat(formData.quantity) <= 0) {
      setMessage({ type: "error", text: "Quantity must be greater than 0" });
      return;
    }

    // Check if expiry date is in the past
    const expiryDate = new Date(formData.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expiryDate < today) {
      setMessage({ type: "error", text: "Expiry date cannot be in the past" });
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        purchase_date: formData.purchase_date || new Date().toISOString().split('T')[0]
      };
      
      await addFoodItem(dataToSend);
      setMessage({ type: "success", text: "Item added successfully!" });
      
      // Reset form
      setFormData({
        name: "",
        category: "",
        quantity: "",
        unit: "",
        purchase_date: "",
        expiry_date: "",
        storage_location: ""
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/inventory");
      }, 2000);
    } catch (error) {
      console.error("Error adding item:", error);
      setMessage({ type: "error", text: error.response?.data?.error || "Failed to add item" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-item-container">
      <Navbar />
      <main className="add-item-page">
        <div className="add-item-header">
          <h1>➕ Add New Food Item</h1>
          <p className="add-item-subtitle">Add items to track and reduce waste</p>
        </div>

        <div className="form-wrapper">
          {message.text && (
            <div className={`form-message message-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-item-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Food Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Fresh Tomatoes"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Category <span className="required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 2.5"
                  step="0.1"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Unit <span className="required">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Expiry Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Storage Location</label>
                <input
                  type="text"
                  name="storage_location"
                  value={formData.storage_location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Refrigerator, Pantry, Freezer"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Food Item"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/inventory")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="form-hints">
            <h3>💡 Tips:</h3>
            <ul>
              <li>Enter expiry dates accurately to get timely alerts</li>
              <li>Use proper storage locations to organize better</li>
              <li>Update quantities when you use partial amounts</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddItem;
