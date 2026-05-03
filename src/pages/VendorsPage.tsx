import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VendorTable from "../components/vendortable";
import { supabase } from "../utils/supabase";
import {
  mapVendorProfileRow,
  VENDOR_PROFILE_SELECT,
} from "../utils/vendorData";
import type { Vendor, VendorStatus } from "../components/vendor";
import { adminUi } from "../constants/adminUi";

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | VendorStatus>("all");
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("vendor_profiles")
      .select(VENDOR_PROFILE_SELECT);

    if (error) {
      console.error(error.message);
      setVendors([]);
    } else {
      setVendors((data || []).map(mapVendorProfileRow));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

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

  const filtered = vendors
    .filter((v) =>
      v.business_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((v) => filter === "all" || v.status === filter);

  return (
    <div className={adminUi.content}>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
          <div>
            <h1 className={adminUi.h1}>Vendors</h1>
            <p className={adminUi.subtitle}>
              Search, verify, and manage vendor accounts
            </p>
          </div>
          <Link to="/vendors/new" className={adminUi.primaryBtn}>
            + Add vendor
          </Link>
        </div>

        <div className={`${adminUi.toolbarRow} mb-6`}>
          <input
            placeholder="Search by business name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${adminUi.input} max-w-md`}
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | VendorStatus)
            }
            className={`${adminUi.select} w-auto min-w-[160px]`}
          >
            <option value="all">All</option>
            <option value="active">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className={`${adminUi.card} p-0 overflow-hidden`}>
          {loading ? (
            <p className="p-8 text-gray-500 text-center">Loading…</p>
          ) : (
            <div className="p-4 overflow-x-auto">
              <VendorTable vendors={filtered} onToggle={toggleStatus} />
            </div>
          )}
        </div>
    </div>
  );
};

export default VendorsPage;
