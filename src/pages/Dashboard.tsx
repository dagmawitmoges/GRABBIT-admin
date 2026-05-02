import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import VendorTable from "../components/vendortable";
import AddVendorModal from "../components/CreateVendorModal";
import { supabase } from "../utils/supabase";
import type { Vendor, VendorStatus } from "../components/vendor";

const G = "#1DB954";

const Dashboard = () => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH DATA (SUPABASE)
     ========================= */
  const fetchVendors = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("vendors")
      .select(`
        *,
        user:users(id, email, full_name, phone)
      `);

    if (error) {
      console.error("Fetch vendors error:", error.message);
      setVendors([]);
    } else {
      setVendors(
        (data || []).map((v: any) => ({
          id: v.id,
          business_name: v.business_name ?? "",
          owner_name: v.owner_name ?? "",
          status: (v.status as VendorStatus) ?? "active",
          phone: v.phone,
          contact_phone: v.contact_phone,
          address: v.address,
          location: v.location,
          tin: v.tin,
          business_type: v.business_type,
          user: v.user,
        }))
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /* =========================
     STATS
     ========================= */
  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === "active").length,
    blocked: vendors.filter(v => v.status === "blocked").length,
  };

  const recentVendors = vendors.slice(0, 5);

  /* =========================
     TOGGLE STATUS
     ========================= */
  const toggleStatus = async (id: string, status: VendorStatus) => {
    const newStatus: VendorStatus =
      status === "active" ? "blocked" : "active";

    const { error } = await supabase
      .from("vendors")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    fetchVendors();
  };

  /* =========================
     EXPORT CSV
     ========================= */
  const exportCSV = () => {
    const rows = [
      ["Business", "Email", "Status"],
      ...vendors.map(v => [
        v.business_name,
        v.user?.email || "",
        v.status,
      ]),
    ];

    const csv = rows.map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vendors.csv";
    a.click();
  };

  /* =========================
     UI
     ========================= */
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 p-6">
        <Header onAdd={() => setShowModal(true)} />

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <StatTile label="Total Vendors" value={stats.total} icon="🏪" accent={G} />
          <StatTile label="Active" value={stats.active} icon="✅" accent={G} />
          <StatTile label="Blocked" value={stats.blocked} icon="🚫" accent="#E53935" />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between mb-4">
          <button onClick={exportCSV} className="border px-3 py-2 rounded">
            Export CSV
          </button>

          <button
            onClick={() => navigate("/vendors")}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            View All
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow rounded">
          {loading ? (
            <Empty icon="⏳" text="Loading..." />
          ) : (
            <VendorTable
              vendors={recentVendors}
              onToggle={toggleStatus}
            />
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <AddVendorModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchVendors}
        />
      )}
    </div>
  );
};

/* =========================
   UI HELPERS
   ========================= */
const StatTile = ({ label, value, icon, accent }: any) => (
  <div className="p-4 rounded shadow bg-white">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-bold" style={{ color: accent }}>
      {icon} {value}
    </div>
  </div>
);

const Empty = ({ icon, text }: { icon: string; text: string }) => (
  <div className="p-10 text-center text-gray-500">
    <div className="text-3xl mb-2">{icon}</div>
    {text}
  </div>
);

export default Dashboard;
