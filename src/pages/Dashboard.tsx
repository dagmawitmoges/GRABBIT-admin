import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import VendorTable from "../components/vendortable";
import AddVendorModal from "../components/CreateVendorModal";

const G = "#1DB954";

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
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />

      <div className="flex-1 p-6 overflow-y-auto">
        <Header onAdd={() => setShowModal(true)} />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
          <StatTile label="Total Vendors" value={stats.total} icon="🏪" accent={G} />
          <StatTile label="Active" value={stats.active} icon="✅" accent={G} />
          <StatTile label="Blocked" value={stats.blocked} icon="🚫" accent="#E53935" />
        </div>

        {/* Recent vendors header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0F1F0F]">Recent Vendors</h2>
            <p className="text-sm text-gray-600">Last {recentVendors.length} registered</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 border border-green-600 rounded text-green-600 bg-white hover:bg-green-50 transition"
            >
              ↓ Export CSV
            </button>
            <button
              onClick={() => navigate("/vendors")}
              className="px-3 py-2 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
            >
              View All Vendors →
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded shadow overflow-x-auto">
          {loading ? (
            <Empty icon="⏳" text="Loading vendors…" />
          ) : recentVendors.length === 0 ? (
            <Empty icon="🏪" text="No vendors yet" />
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
  <div className="bg-white rounded p-5 shadow flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${accent === "#E53935" ? "bg-red-100" : "bg-green-100"}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  </div>
);

const Empty = ({ icon, text }: { icon: string; text: string }) => (
  <div className="p-12 text-center text-gray-600 text-sm">
    <div className="text-3xl mb-2">{icon}</div>{text}
  </div>
);

export default Dashboard;
