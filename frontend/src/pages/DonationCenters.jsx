import { useState, useEffect } from 'react';
import {
  createDonationCenter,
  getDonationCenters,
  deleteDonationCenter,
} from '../services/donationService';
import '../styles/Donations.css';

function DonationCenters() {
  const [centers, setCenters] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    accepts_items: '',
    open_hours: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const data = await getDonationCenters();
      setCenters(data.donation_centers || []);
    } catch (err) {
      setError('Failed to load donation centers');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDonationCenter(formData);
      setFormData({
        name: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        accepts_items: '',
        open_hours: '',
      });
      fetchCenters();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add center');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this center?')) {
      try {
        await deleteDonationCenter(id);
        fetchCenters();
      } catch (err) {
        setError('Failed to delete center');
      }
    }
  };

  return (
    <div className="donations-container">
      <h2>🏛️ Donation Centers</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="donation-form">
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Center Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phone"
            placeholder="Contact Number"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="accepts_items"
            placeholder="Accepts Items (e.g., dry,canned,fresh)"
            value={formData.accepts_items}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="open_hours"
            placeholder="Working Hours (e.g., 9AM-5PM)"
            value={formData.open_hours}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Center'}
        </button>
      </form>

      <div className="centers-grid">
        {centers.length === 0 ? (
          <p>No donation centers yet.</p>
        ) : (
          centers.map((center) => (
            <div key={center.id} className="center-card">
              <h3>{center.name}</h3>
              <p><strong>City:</strong> {center.city || '—'}</p>
              <p><strong>Address:</strong> {center.address || '—'}</p>
              <p><strong>Phone:</strong> {center.phone || '—'}</p>
              <p><strong>Email:</strong> {center.email || '—'}</p>
              <p><strong>Accepts:</strong> {center.accepts_items || '—'}</p>
              <p><strong>Hours:</strong> {center.open_hours || '—'}</p>
              <button
                className="delete-btn"
                onClick={() => handleDelete(center.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DonationCenters;
