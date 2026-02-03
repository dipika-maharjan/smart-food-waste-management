import "./Card.css";

const Card = ({ 
  title, 
  value, 
  subtitle = null, 
  icon = null, 
  variant = "default",
  onClick = null,
  children = null
}) => {
  return (
    <div 
      className={`card card-${variant}`}
      onClick={onClick}
    >
      <div className="card-header">
        {icon && <div className="card-icon">{icon}</div>}
        <div className="card-title-section">
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      </div>
      
      {value !== undefined && (
        <div className="card-value">{value}</div>
      )}
      
      {children && (
        <div className="card-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;
