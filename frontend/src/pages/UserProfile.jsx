import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../services/userService';
import { logout } from '../services/authService';
import '../styles/UserProfile.css';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await getUserProfile();
      setUser(data);
      setFormData({
        name: data.name,
        phone: data.phone || '',
      });
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(formData.name, formData.phone);
      fetchUserProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('This will permanently delete your account. Are you sure?')) {
      try {
        await deleteUserProfile();
        logout();
        navigate('/login');
      } catch (err) {
        setError('Failed to delete account');
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>👤 User Profile</h2>

      {error && <div className="error-message">{error}</div>}

      {user && (
        <div className="profile-card">
          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email (Cannot be changed)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-info">
                <div className="info-item">
                  <label>Name</label>
                  <p>{user.name}</p>
                </div>

                <div className="info-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>

                <div className="info-item">
                  <label>Phone</label>
                  <p>{user.phone || 'Not provided'}</p>
                </div>

                <div className="info-item">
                  <label>Member Since</label>
                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
                <button
                  className="logout-btn"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
                <button
                  className="delete-btn"
                  onClick={handleDelete}
                >
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default UserProfile;
