import { NavLink } from "react-router-dom";

const Sidebar = () => (
  <div style={{ width: 220, background: "#0B172D", color: "#fff", padding: 20, minHeight: "100vh" }}>
    <h2 style={{ marginBottom: 20 }}>Admin</h2>
    <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/vendors" style={linkStyle}>Vendors</NavLink>
    </nav>
  </div>
);

const linkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};

export default Sidebar;
