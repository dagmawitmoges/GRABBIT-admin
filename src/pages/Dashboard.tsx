import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import VendorTable from "../components/vendortable";
import AddVendorModal from "../components/CreateVendorModal";

const G = "#1DB954";
const GL = "#E8F5ED";
const BG = "#F5F8F5";
const MUTED = "#6B7C6B";

const Dashboard = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/vendors");
      setVendors(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === "active").length,
    blocked: vendors.filter(v => v.status === "blocked").length,
  };

  // Show only the 5 most recent on the dashboard
  const recentVendors = vendors.slice(0, 5);

  const toggleStatus = async (id: number, status: string) => {
    await api.patch(`/admin/vendors/${id}`, {
      status: status === "active" ? "blocked" : "active",
    });
    fetchVendors();
  };

  const exportCSV = () => {
    const rows = [
      ["Business", "Email", "Status"],
      ...vendors.map(v => [v.business_name, v.email, v.status]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: BG, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        <Header onAdd={() => setShowModal(true)} />

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, margin: "24px 0" }}>
          <StatTile label="Total Vendors" value={stats.total} icon="🏪" accent={G} />
          <StatTile label="Active" value={stats.active} icon="✅" accent={G} />
          <StatTile label="Blocked" value={stats.blocked} icon="🚫" accent="#E53935" />
        </div>

        {/* Recent vendors section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F1F0F", margin: 0 }}>Recent Vendors</h2>
            <p style={{ fontSize: 13, color: MUTED, margin: "2px 0 0" }}>Last {recentVendors.length} registered</p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={exportCSV}
              style={ghostBtnStyle}
              onMouseEnter={e => ((e.target as HTMLButtonElement).style.backgroundColor = GL)}
              onMouseLeave={e => ((e.target as HTMLButtonElement).style.backgroundColor = "#fff")}
            >
              ↓ Export CSV
            </button>

            {/* ✅ Route to full vendors page */}
            <button
              onClick={() => navigate("/vendors")}
              style={primaryBtnStyle}
              onMouseEnter={e => ((e.target as HTMLButtonElement).style.backgroundColor = "#17a347")}
              onMouseLeave={e => ((e.target as HTMLButtonElement).style.backgroundColor = G)}
            >
              View All Vendors →
            </button>
          </div>
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {loading ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Loading vendors…
            </div>
          ) : recentVendors.length === 0 ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🏪</div>No vendors yet
            </div>
          ) : (
            <VendorTable vendors={recentVendors} onToggle={toggleStatus} />
          )}
        </div>
      </div>

      {showModal && (
        <AddVendorModal onClose={() => setShowModal(false)} onSuccess={fetchVendors} />
      )}
    </div>
  );
};

const StatTile = ({ label, value, icon, accent }: { label: string; value: number; icon: string; accent: string }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: accent === "#E53935" ? "#FFEBEE" : "#E8F5ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

const ghostBtnStyle: React.CSSProperties = {
  padding: "9px 16px",
  border: "1.5px solid #1DB954",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 700,
  color: "#1DB954",
  backgroundColor: "#fff",
  cursor: "pointer",
  transition: "background-color 0.2s",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "9px 16px",
  backgroundColor: "#1DB954",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  transition: "background-color 0.2s",
  boxShadow: "0 4px 12px rgba(29,185,84,0.3)",
};

const emptyStyle: React.CSSProperties = {
  padding: 48,
  textAlign: "center",
  color: MUTED,
  fontSize: 14,
};

export default Dashboard;