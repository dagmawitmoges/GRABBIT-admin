import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import {
  mapVendorProfileRow,
  VENDOR_PROFILE_SELECT,
} from "../utils/vendorData";
import { adminUi } from "../constants/adminUi";

const UsersPage = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const { data } = await supabase
      .from("vendor_profiles")
      .select(VENDOR_PROFILE_SELECT);

    if (data) setVendors(data.map(mapVendorProfileRow));
  };

  const filtered = vendors.filter((v) =>
    v.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={adminUi.content}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h1 className={adminUi.h1}>Users</h1>
            <p className={adminUi.subtitle}>Vendor accounts by email</p>
          </div>
          <Link to="/vendors/new" className={adminUi.primaryBtn}>
            + Add vendor
          </Link>
        </div>

        <input
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${adminUi.input} max-w-md mb-6`}
        />

        <div className={`${adminUi.card} p-0 overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-gray-100 hover:bg-gray-50/80"
                >
                  <td className="py-3 px-4">
                    <Link
                      to={`/vendors/${v.id}`}
                      className="text-[#1DB954] font-medium hover:underline"
                    >
                      {v.business_name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{v.user?.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        v.status === "active"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default UsersPage;
