import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import VendorTable from "../components/vendortable";
import { supabase } from "../utils/supabase";
import {
  mapVendorProfileRow,
  VENDOR_PROFILE_SELECT,
} from "../utils/vendorData";
import type { Vendor, VendorStatus } from "../components/vendor";
import { adminUi } from "../constants/adminUi";

const G = "#1DB954";

const Dashboard = () => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("vendor_profiles")
      .select(VENDOR_PROFILE_SELECT);

    if (error) {
      console.error("Fetch vendors error:", error.message);
      setVendors([]);
    } else {
      setVendors((data || []).map(mapVendorProfileRow));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "active").length,
    pending: vendors.filter((v) => v.status === "pending").length,
    restricted: vendors.filter((v) => v.accountStatus !== "active").length,
  };

  const recentVendors = vendors.slice(0, 5);

  const toggleStatus = async (id: string, status: VendorStatus) => {
    const nextVerified = status !== "active";

    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: nextVerified })
      .eq("id", id);

    if (error) {
      console.error(error.message);
      return;
    }

    fetchVendors();
  };

  const exportCSV = () => {
    const rows = [
      ["Business", "Email", "Status"],
      ...vendors.map((v) => [
        v.business_name,
        v.user?.email || "",
        v.status,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vendors.csv";
    a.click();
  };

  return (
    <div className={adminUi.content}>
        <Header />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <StatTile label="Total vendors" value={stats.total} icon="🏪" accent={G} />
          <StatTile label="Verified" value={stats.active} icon="✅" accent={G} />
          <StatTile label="Pending" value={stats.pending} icon="⏳" accent="#E53935" />
          <StatTile
            label="Suspended / banned"
            value={stats.restricted}
            icon="🚫"
            accent="#F57F17"
          />
        </div>

        <div className={`${adminUi.toolbarRow} justify-between mb-4`}>
          <button type="button" onClick={exportCSV} className={adminUi.secondaryBtn}>
            Export CSV
          </button>

          <div className="flex gap-2">
            <Link to="/vendors/new" className={adminUi.primaryBtn}>
              + Add vendor
            </Link>
            <button
              type="button"
              onClick={() => navigate("/vendors")}
              className={adminUi.secondaryBtn}
            >
              View all
            </button>
          </div>
        </div>

        <div className={`${adminUi.card} p-0 overflow-hidden`}>
          {loading ? (
            <Empty icon="⏳" text="Loading..." />
          ) : (
            <div className="p-4">
              <VendorTable vendors={recentVendors} onToggle={toggleStatus} />
            </div>
          )}
        </div>
    </div>
  );
};

const StatTile = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: string;
  accent: string;
}) => (
  <div className={`${adminUi.card} py-5`}>
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-2xl font-bold mt-1" style={{ color: accent }}>
      {icon} {value}
    </div>
  </div>
);

const Empty = ({ icon, text }: { icon: string; text: string }) => (
  <div className="p-10 text-center text-gray-500 dark:text-gray-400">
    <div className="text-3xl mb-2">{icon}</div>
    {text}
  </div>
);

export default Dashboard;
