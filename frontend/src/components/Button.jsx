import "./Button.css";

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  type = "button",
  onClick,
  disabled = false,
  icon = null,
  fullWidth = false,
  className = ""
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default Button;
