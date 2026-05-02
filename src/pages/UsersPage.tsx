import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";

type Vendor = {
  id: string;
  business_name: string;
  owner_name?: string;
  tin?: string;
  address?: string;
  branch_count?: number;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    created_at?: string;
  };
};

const UsersPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/vendors");
      setVendors(res.data);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vendors.filter(v =>
    v.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <p className="text-sm text-gray-600">
          {loading ? "Loading…" : `${vendors.length} registered vendors`}
        </p>

        {/* Search bar */}
        <div className="my-4">
          <input
            placeholder="Search by email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-80 border rounded p-2"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded shadow overflow-x-auto">
          {loading ? (
            <Empty icon="⏳" text="Loading vendors…" />
          ) : filtered.length === 0 ? (
            <Empty icon="👥" text="No vendors found" />
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  {["Business", "Owner", "Email", "Phone", "TIN", "Branches"].map(h => (
                    <th key={h} className="px-4 py-2 text-xs font-bold text-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, idx) => (
                  <tr key={v.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2">{v.business_name}</td>
                    <td className="px-4 py-2">{v.owner_name || "-"}</td>
                    <td className="px-4 py-2">{v.user.email}</td>
                    <td className="px-4 py-2">{v.user.phone || "-"}</td>
                    <td className="px-4 py-2">{v.tin || "-"}</td>
                    <td className="px-4 py-2">{v.branch_count || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const Empty = ({ icon, text }: { icon: string; text: string }) => (
  <div className="p-12 text-center text-gray-600 text-sm">
    <div className="text-3xl mb-2">{icon}</div>{text}
  </div>
);

export default UsersPage;
