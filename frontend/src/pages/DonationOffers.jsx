import { useState, useEffect } from 'react';
import {
  createDonationOffer,
  getDonationOffers,
  updateDonationOfferStatus,
  deleteDonationOffer,
} from '../services/donationService';
import { getDonationCenters } from '../services/donationService';
import { getInventory } from '../services/foodService';
import '../styles/Donations.css';

function DonationOffers() {
  const [offers, setOffers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    donation_center_id: '',
    remarks: '',
    items: [{ food_id: '', quantity: '' }],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const hasInventory = inventory.length > 0;

  useEffect(() => {
    fetchOffers();
    fetchCenters();
    fetchInventory();
  }, []);

  const fetchOffers = async () => {
    try {
      const data = await getDonationOffers();
      setOffers(data.donation_offers || []);
    } catch (err) {
      setError('Failed to load donation offers');
    }
  };

  const fetchCenters = async () => {
    try {
      const data = await getDonationCenters();
      setCenters(data.donation_centers || []);
    } catch (err) {
      console.error('Failed to load centers');
    }
  };

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data || []);
    } catch (err) {
      console.error('Failed to load inventory');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      );
      return { ...prev, items: updatedItems };
    });
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { food_id: '', quantity: '' }],
    }));
  };

  const removeItemRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const items = formData.items
        .map((item) => ({
          food_id: Number(item.food_id),
          quantity: Number(item.quantity),
        }))
        .filter((item) => item.food_id && item.quantity > 0);

      if (items.length === 0) {
        setError('Please add at least one item with quantity');
        return;
      }

      const payload = {
        items,
        remarks: formData.remarks?.trim() || undefined,
      };

      if (formData.donation_center_id) {
        payload.donation_center_id = Number(formData.donation_center_id);
      }

      await createDonationOffer(payload);
      setFormData({
        donation_center_id: '',
        remarks: '',
        items: [{ food_id: '', quantity: '' }],
      });
      fetchOffers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDonationOfferStatus(id, newStatus);
      fetchOffers();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this offer?')) {
      try {
        await deleteDonationOffer(id);
        fetchOffers();
      } catch (err) {
        setError('Failed to delete offer');
      }
    }
  };

  return (
    <div className="donations-container">
      <h2>🤝 Donation Offers</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="donation-form">
        <div className="form-group">
          <select
            name="donation_center_id"
            value={formData.donation_center_id}
            onChange={handleChange}
          >
            <option value="">Select Donation Center (optional)</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <textarea
            name="remarks"
            placeholder="Remarks (pickup details, notes)"
            value={formData.remarks}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <h4>Items</h4>
          {!hasInventory && <p>No available inventory items to donate.</p>}
          {formData.items.map((item, index) => (
            <div key={`${item.food_id}-${index}`} className="donation-item-row">
              <select
                value={item.food_id}
                onChange={(e) => handleItemChange(index, 'food_id', e.target.value)}
                required
                disabled={!hasInventory}
              >
                <option value="">Select Food Item</option>
                {inventory.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.quantity} {food.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                required
                disabled={!hasInventory}
              />
              {formData.items.length > 1 && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => removeItemRow(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItemRow} disabled={!hasInventory}>
            Add Another Item
          </button>
        </div>

        <button type="submit" disabled={loading || !hasInventory}>
          {loading ? 'Creating...' : 'Create Offer'}
        </button>
      </form>

      <div className="offers-grid">
        {offers.length === 0 ? (
          <p>No donation offers yet.</p>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <h3>Offer #{offer.id}</h3>
              <p><strong>Center:</strong> {offer.donation_center_name || '—'}</p>
              <p><strong>Remarks:</strong> {offer.remarks || '—'}</p>
              <p><strong>Status:</strong> {offer.status}</p>
              <p><strong>Created:</strong> {new Date(offer.created_at).toLocaleDateString()}</p>
              <div>
                <strong>Items:</strong>
                {offer.items?.length ? (
                  <ul>
                    {offer.items.map((item) => (
                      <li key={item.id}>
                        {item.food_name || 'Item'} - {item.quantity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items</p>
                )}
              </div>
              
              <div className="offer-actions">
                <select
                  value={offer.status}
                  onChange={(e) => handleStatusChange(offer.id, e.target.value)}
                  className="status-select"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PICKED_UP">Picked Up</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(offer.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DonationOffers;
