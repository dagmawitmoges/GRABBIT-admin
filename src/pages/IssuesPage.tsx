import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";

type VendorRequest = {
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

const IssuesPage = () => {
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/vendors");
      setRequests(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Vendor Requests</h1>
        <p className="text-sm text-gray-600">
          {loading ? "Loading…" : `${requests.length} requests`}
        </p>

        <div className="bg-white rounded shadow mt-4 overflow-x-auto">
          {loading ? (
            <Empty icon="⏳" text="Loading requests…" />
          ) : requests.length === 0 ? (
            <Empty icon="👥" text="No requests found" />
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
                {requests.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2">{r.business_name}</td>
                    <td className="px-4 py-2">{r.owner_name || "-"}</td>
                    <td className="px-4 py-2">{r.user.email}</td>
                    <td className="px-4 py-2">{r.user.phone || "-"}</td>
                    <td className="px-4 py-2">{r.tin || "-"}</td>
                    <td className="px-4 py-2">{r.branch_count || 1}</td>
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

export default IssuesPage;
