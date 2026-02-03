import { useEffect, useState } from "react";
import { getInventory, updateFoodStatus } from "../services/foodService";
import "../styles/Donations.css";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Card from "../components/Card";

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState(null);

  const NGOs = [
    {
      id: 1,
      name: "Food For All",
      description: "Providing meals to underprivileged communities",
      contact: "+1 (555) 123-4567",
      icon: "🏥"
    },
    {
      id: 2,
      name: "Hunger Relief Foundation",
      description: "Fighting food insecurity across the nation",
      contact: "+1 (555) 234-5678",
      icon: "❤️"
    },
    {
      id: 3,
      name: "Community Kitchen",
      description: "Supporting local food banks and soup kitchens",
      contact: "+1 (555) 345-6789",
      icon: "🍽️"
    },
    {
      id: 4,
      name: "Charity Meals",
      description: "Serving hot meals to homeless individuals",
      contact: "+1 (555) 456-7890",
      icon: "🤝"
    }
  ];

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await getInventory();

      const eligible = data.filter(item => {
        const today = new Date();
        const expiry = new Date(item.expiry_date);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        return diffDays > 0 && diffDays <= 7 && item.status === "Available";
      });

      setDonations(eligible);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDonate = async (id) => {
    try {
      await updateFoodStatus(id, "Donated");
      fetchDonations();
    } catch (error) {
      console.error("Error donating item:", error);
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="donations-container">
      <Navbar />
      <main className="donations-page">
        <div className="donations-header">
          <div>
            <h1>🤝 Donation Suggestions</h1>
            <p className="donations-subtitle">Share food with those in need</p>
          </div>
        </div>

        <section className="ngo-section">
          <h2>Partner NGOs</h2>
          <div className="ngo-grid">
            {NGOs.map(ngo => (
              <div 
                key={ngo.id} 
                className={`ngo-card ${selectedNGO?.id === ngo.id ? 'selected' : ''}`}
                onClick={() => setSelectedNGO(selectedNGO?.id === ngo.id ? null : ngo)}
              >
                <div className="ngo-icon">{ngo.icon}</div>
                <h3>{ngo.name}</h3>
                <p className="ngo-description">{ngo.description}</p>
                <p className="ngo-contact">📞 {ngo.contact}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="items-section">
          <div className="section-header">
            <h2>Items Available for Donation</h2>
            {donations.length > 0 && (
              <span className="item-count">{donations.length} items</span>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner">Loading donation items...</div>
          ) : donations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No items available for donation</h3>
              <p>Items expiring within 7 days are eligible for donation</p>
            </div>
          ) : (
            <div className="donations-grid">
              {donations.map(item => {
                const daysLeft = getDaysUntilExpiry(item.expiry_date);
                return (
                  <div key={item.id} className="donation-card">
                    <div className="donation-header">
                      <h3>{item.name}</h3>
                      <span className={`urgency-badge urgency-${daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : 'soon'}`}>
                        {daysLeft === 0 ? '🔴 Today' : daysLeft === 1 ? '🟠 Tomorrow' : `🟡 ${daysLeft} days`}
                      </span>
                    </div>
                    
                    <div className="donation-details">
                      <div className="detail">
                        <span className="label">Category</span>
                        <span className="value">{item.category}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Quantity</span>
                        <span className="value">{item.quantity} {item.unit}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Storage</span>
                        <span className="value">{item.storage_location}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Expiry</span>
                        <span className="value">{new Date(item.expiry_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Button 
                      variant="success" 
                      size="md"
                      fullWidth={true}
                      icon="💝"
                      onClick={() => handleDonate(item.id)}
                    >
                      Donate This Item
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="impact-section">
          <Card 
            title="Your Impact"
            icon="🌍"
            variant="success"
          >
            <div className="impact-content">
              <p>By donating food, you help:</p>
              <ul>
                <li>✓ Reduce food waste</li>
                <li>✓ Support local communities</li>
                <li>✓ Combat hunger</li>
                <li>✓ Save money while helping others</li>
              </ul>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Donations;
