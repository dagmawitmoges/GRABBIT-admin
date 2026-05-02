import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../utils/supabase";

const UsersPage = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const { data } = await supabase
      .from("vendors")
      .select("*, user:users(*)");

    if (data) setVendors(data);
  };

  const filtered = vendors.filter(v =>
    v.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Vendors</h1>

        <input
          placeholder="Search email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 my-4"
        />

        <table className="w-full">
          <thead>
            <tr>
              <th>Business</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(v => (
              <tr key={v.id}>
                <td>{v.business_name}</td>
                <td>{v.user?.email}</td>
                <td>{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;