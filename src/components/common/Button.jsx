function Button({ children, onClick, type = "button" }) {
  return (
    <button type={type} onClick={onClick} style={btnStyle}>
      {children}
    </button>
  );
}

const btnStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#8bb8ff",
  cursor: "pointer",
  fontWeight: "bold",
};

export default Button;