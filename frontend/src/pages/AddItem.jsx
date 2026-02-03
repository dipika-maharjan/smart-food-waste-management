import { useState } from "react";
import { addFoodItem } from "../services/foodService";
import "../styles/AddItem.css";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    purchase_date: "",
    expiry_date: "",
    storage_location: "Fridge",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.quantity || !formData.unit || 
        !formData.purchase_date || !formData.expiry_date) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    const expiry = new Date(formData.expiry_date);
    const today = new Date();
    if (expiry < today) {
      setMessage({ type: "error", text: "Expiry date cannot be in the past." });
      return;
    }

    try {
      setLoading(true);
      await addFoodItem(formData);
      setMessage({ type: "success", text: "✅ Food item added successfully!" });
      
      // Reset form
      setTimeout(() => {
        setFormData({
          name: "",
          category: "",
          quantity: "",
          unit: "",
          purchase_date: "",
          expiry_date: "",
          storage_location: "Fridge",
        });
        setMessage({ type: "", text: "" });
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "❌ Failed to add food item. Please try again." });
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
          <p className="add-item-subtitle">Track your food inventory and expiry dates</p>
        </div>

        <div className="form-wrapper">
          <form onSubmit={handleSubmit} className="add-item-form">
            {message.text && (
              <div className={`form-message message-${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="name" className="form-label">
                  Food Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g., Tomatoes, Milk, Cheese"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Vegetables">🥬 Vegetables</option>
                  <option value="Fruits">🍎 Fruits</option>
                  <option value="Dairy">🥛 Dairy</option>
                  <option value="Meat">🍗 Meat</option>
                  <option value="Grains">🌾 Grains</option>
                  <option value="Beverages">🥤 Beverages</option>
                  <option value="Condiments">🧂 Condiments</option>
                  <option value="Others">📦 Others</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity" className="form-label">
                  Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  placeholder="e.g., 5"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                  step="0.1"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit" className="form-label">
                  Unit <span className="required">*</span>
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="L">Liter (L)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="pieces">Pieces</option>
                  <option value="packets">Packets</option>
                  <option value="bottles">Bottles</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="purchase_date" className="form-label">
                  Purchase Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiry_date" className="form-label">
                  Expiry Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="storage_location" className="form-label">
                  Storage Location <span className="required">*</span>
                </label>
                <select
                  id="storage_location"
                  name="storage_location"
                  value={formData.storage_location}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Fridge">❄️ Fridge</option>
                  <option value="Freezer">🧊 Freezer</option>
                  <option value="Pantry">🗄️ Pantry</option>
                  <option value="Counter">🍽️ Counter</option>
                  <option value="Cupboard">🚪 Cupboard</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                fullWidth={true}
                icon="✓"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Item to Inventory"}
              </Button>
            </div>

            <div className="form-hint">
              <p>💡 Tip: Accurately tracking expiry dates helps reduce food waste and saves money!</p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddItem;
