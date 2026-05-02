import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../utils/supabase";

type VendorRequest = {
  id: string;
  business_name: string;
  owner_name?: string;
  tin?: string;
  address?: string;
  branch_count?: number;
  status?: string;
  user?: {
    id?: string;
    full_name?: string;
    email?: string;
    phone?: string;
  };
};

const IssuesPage = () => {
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);

    // ✅ SUPABASE QUERY (NO axios)
    const { data, error } = await supabase
      .from("vendors")
      .select("*, user:users(*)")
      .eq("status", "pending"); // 👈 IMPORTANT (requests only)

    if (error) {
      console.error("Supabase error:", error.message);
      setRequests([]);
    } else {
      setRequests((data as VendorRequest[]) || []);
    }

    setLoading(false);
  };

  const approveVendor = async (id: string) => {
    const { error } = await supabase
      .from("vendors")
      .update({ status: "active" })
      .eq("id", id);

    if (!error) fetchRequests();
  };

  const rejectVendor = async (id: string) => {
    const { error } = await supabase
      .from("vendors")
      .update({ status: "rejected" })
      .eq("id", id);

    if (!error) fetchRequests();
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Vendor Requests</h1>

        <p className="text-sm text-gray-600">
          {loading ? "Loading…" : `${requests.length} pending requests`}
        </p>

        <div className="bg-white rounded shadow mt-4 overflow-x-auto">
          {loading ? (
            <Empty icon="⏳" text="Loading requests…" />
          ) : requests.length === 0 ? (
            <Empty icon="👥" text="No pending requests" />
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  {["Business", "Owner", "Email", "Phone", "TIN", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-xs font-bold text-gray-600 uppercase"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="px-4 py-2">{r.business_name}</td>
                    <td className="px-4 py-2">{r.owner_name ?? "-"}</td>
                    <td className="px-4 py-2">{r.user?.email ?? "-"}</td>
                    <td className="px-4 py-2">{r.user?.phone ?? "-"}</td>
                    <td className="px-4 py-2">{r.tin ?? "-"}</td>

                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => approveVendor(r.id)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => rejectVendor(r.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Reject
                      </button>
                    </td>
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
    <div className="text-3xl mb-2">{icon}</div>
    {text}
  </div>
);

export default IssuesPage;