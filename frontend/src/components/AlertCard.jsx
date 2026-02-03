import "./AlertCard.css";
import Button from "./Button";

const AlertCard = ({ 
  item, 
  status, 
  onAction 
}) => {
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilExpiry(item.expiry_date);
  let statusLabel = "Fresh";
  let statusClass = "fresh";

  if (daysLeft < 0) {
    statusLabel = "Expired";
    statusClass = "expired";
  } else if (daysLeft === 0) {
    statusLabel = "Expires Today";
    statusClass = "expires-today";
  } else if (daysLeft === 1) {
    statusLabel = "Expires Tomorrow";
    statusClass = "expires-tomorrow";
  } else if (daysLeft <= 3) {
    statusLabel = `Expires in ${daysLeft} days`;
    statusClass = "near-expiry";
  }

  return (
    <div className={`alert-card alert-${statusClass}`}>
      <div className="alert-header">
        <div className="alert-icon">
          {statusClass === "expired" && "⚠️"}
          {statusClass === "expires-today" && "🔴"}
          {statusClass === "expires-tomorrow" && "🟠"}
          {statusClass === "near-expiry" && "🟡"}
          {statusClass === "fresh" && "✅"}
        </div>
        <div className="alert-info">
          <h4 className="alert-title">{item.name}</h4>
          <p className="alert-category">{item.category}</p>
        </div>
        <span className={`alert-badge alert-badge-${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="alert-details">
        <div className="detail-item">
          <span className="detail-label">Quantity:</span>
          <span className="detail-value">{item.quantity} {item.unit}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Expiry:</span>
          <span className="detail-value">{new Date(item.expiry_date).toLocaleDateString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Storage:</span>
          <span className="detail-value">{item.storage_location}</span>
        </div>
      </div>

      {item.status === "Available" && (
        <div className="alert-actions">
          <Button 
            variant="success" 
            size="sm"
            onClick={() => onAction(item.id, "Used")}
            icon="✓"
          >
            Use Now
          </Button>
          <Button 
            variant="info" 
            size="sm"
            onClick={() => onAction(item.id, "Donated")}
            icon="🤝"
          >
            Donate
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => onAction(item.id, "Wasted")}
            icon="🗑️"
          >
            Waste
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
