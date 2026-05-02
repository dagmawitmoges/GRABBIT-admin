import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = async (id: string, blocked: boolean) => {
    await api.put(`/admin/users/${id}/block`, { blocked: !blocked });
    setUsers(users.map((u) => (u.id === id ? { ...u, blocked: !blocked } : u)));
  };

  return (
    <div>
      <h1>Users</h1>
      <input
        placeholder="Search by email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.blocked ? "Blocked" : "Active"}</td>
              <td>
                <button onClick={() => toggleBlock(u.id, u.blocked)}>
                  {u.blocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;
