import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/vendors",   label: "Vendors",   icon: "🏪" },
  { to: "/users",     label: "Users",     icon: "👥" },
  { to: "/issues",    label: "Issues",    icon: "🚨" },
];

const Sidebar = () => (
  <div style={wrap}>
    {/* Brand */}
    <div style={brand}>
      <div style={logoCircle}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span style={brandText}>Grabbit</span>
    </div>

    <p style={sectionLabel}>MENU</p>

    <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({ ...navLink, ...(isActive ? activeLink : {}) })}
        >
          <span style={{ fontSize: 18 }}>{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  </div>
);

const wrap: React.CSSProperties = {
  width: 220,
  background: "#1A1F2E",   // dark slate — no green tint
  color: "#fff",
  padding: "24px 16px",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
};
const brand: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, marginBottom: 32,
};
const logoCircle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: "50%", backgroundColor: "#1DB954",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 12px rgba(29,185,84,0.4)",
};
const brandText: React.CSSProperties = {
  fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px",
};
const sectionLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: "#5A6478",
  letterSpacing: "1.5px", marginBottom: 8, paddingLeft: 12,
};
const navLink: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px", borderRadius: 10,
  color: "#8A93A8", textDecoration: "none",
  fontSize: 14, fontWeight: 600,
  transition: "all 0.15s",
};
const activeLink: React.CSSProperties = {
  backgroundColor: "#252B3B",
  color: "#1DB954",
};

export default Sidebar;