import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import VendorTable from "../components/vendortable";
import CreateVendorModal from "../components/CreateVendorModal";

const VendorsPage = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/vendors");
      // ✅ Normalize response to always be an array
      setVendors(Array.isArray(res.data) ? res.data : res.data.vendors || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const toggleStatus = async (id: number, status: string) => {
    await api.patch(`/admin/vendors/${id}`, {
      status: status === "active" ? "blocked" : "active",
    });
    fetchVendors();
  };

  const filtered = vendors
    .filter((v) => v.business_name?.toLowerCase().includes(search.toLowerCase()))
    .filter((v) => filter === "all" || v.status === filter);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F5F8F5",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <Sidebar />

      <div style={{ flex: 1, padding: "28px 32px" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#0F1F0F",
                margin: 0,
              }}
            >
              Vendors
            </h1>
            <p style={{ fontSize: 13, color: "#6B7C6B", margin: "4px 0 0" }}>
              {loading
                ? "Loading…"
                : `${vendors.length} vendor${vendors.length !== 1 ? "s" : ""} registered`}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={createBtnStyle}
          >
            + Create Vendor
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7C6B",
                fontSize: 15,
              }}
            >
              🔍
            </span>
            <input
              placeholder="Search vendors…"
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>

          <select
            onChange={(e) => setFilter(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 14, cursor: "pointer" }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Table card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={emptyStyle}>⏳ Loading vendors…</div>
          ) : filtered.length === 0 ? (
            <div style={emptyStyle}>🏪 No vendors found</div>
          ) : (
            <VendorTable vendors={filtered} onToggle={toggleStatus} />
          )}
        </div>
      </div>

      {showModal && (
        <CreateVendorModal onClose={() => setShowModal(false)} onSuccess={fetchVendors} />
      )}
    </div>
  );
};

const createBtnStyle: React.CSSProperties = {
  padding: "11px 20px",
  backgroundColor: "#1DB954",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  transition: "background-color 0.2s",
  boxShadow: "0 4px 14px rgba(29,185,84,0.3)",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 14px 10px 38px",
  border: "1.5px solid #E2E8E2",
  borderRadius: 10,
  fontSize: 14,
  color: "#0F1F0F",
  backgroundColor: "#fff",
  outline: "none",
  minWidth: 200,
};

const emptyStyle: React.CSSProperties = {
  padding: 48,
  textAlign: "center",
  color: "#6B7C6B",
  fontSize: 14,
};

export default VendorsPage;
