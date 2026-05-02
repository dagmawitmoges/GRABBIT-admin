import React from "react";
import { Link, useLocation } from "react-router-dom";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname.startsWith(path) ? { fontWeight: "bold" } : {};

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "220px",
          background: "#111827",
          color: "white",
          padding: "1.5rem",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem" }}>Grabbit Admin</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link to="/dashboard" style={{ color: "white", ...isActive("/dashboard") }}>
            Dashboard
          </Link>
          <Link to="/vendors" style={{ color: "white", ...isActive("/vendors") }}>
            Vendors
          </Link>
          {/* Add Users, Issues, etc. later */}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "1.5rem", background: "#F3F4F6" }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
