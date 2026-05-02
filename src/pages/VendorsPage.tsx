import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import VendorTable from "../components/vendortable";
import CreateVendorModal from "../components/CreateVendorModal";
import { supabase } from "../utils/supabase";
import type { Vendor, VendorStatus } from "../components/vendor";

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | VendorStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("vendors")
      .select("*, user:users(id, email, full_name, phone)");

    if (error) {
      console.error(error.message);
      setVendors([]);
    } else {
      setVendors((data as Vendor[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

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

  const filtered = vendors
    .filter((v) =>
      v.business_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((v) => filter === "all" || v.status === filter);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: 24 }}>
        <h1>Vendors</h1>

        <button onClick={() => setShowModal(true)}>
          + Create Vendor
        </button>

        <div style={{ margin: "10px 0", display: "flex", gap: 10 }}>
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | VendorStatus)
            }
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <VendorTable vendors={filtered} onToggle={toggleStatus} />
        )}
      </div>

      {showModal && (
        <CreateVendorModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchVendors}
        />
      )}
    </div>
  );
};

export default VendorsPage;