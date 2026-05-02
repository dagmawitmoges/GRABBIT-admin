import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";

const G = "#1DB954";
const MUTED = "#6B7C6B";

type User = {
  id: string;
  email: string;
  role: string;
  blocked: boolean;
  created_at?: string;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "blocked">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id: string, blocked: boolean) => {
    await api.put(`/admin/users/${id}/block`, { blocked: !blocked });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: !blocked } : u));
  };

  const filtered = users
    .filter(u => u.email.toLowerCase().includes(search.toLowerCase()))
    .filter(u => filter === "all" || (filter === "blocked" ? u.blocked : !u.blocked));

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F8F5", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F1F0F", margin: 0, letterSpacing: "-0.5px" }}>Users</h1>
            <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0" }}>
              {loading ? "Loading…" : `${users.length} total users`}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none" }}>🔍</span>
            <input
              placeholder="Search by email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 6, background: "#fff", padding: 4, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {(["all", "active", "blocked"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                backgroundColor: filter === f ? G : "transparent",
                color: filter === f ? "#fff" : MUTED,
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {loading ? (
            <Empty icon="⏳" text="Loading users…" />
          ) : filtered.length === 0 ? (
            <Empty icon="👥" text="No users found" />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0F4F0" }}>
                  {["User", "Role", "Status", "Action"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr key={u.id} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#FAFCFA", borderBottom: "1px solid #F0F4F0" }}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#E8F5ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: G }}>
                          {u.email[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "#0F1F0F" }}>{u.email}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: "#F0F4F0", color: MUTED }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        backgroundColor: u.blocked ? "#FFEBEE" : "#E8F5ED",
                        color: u.blocked ? "#E53935" : G,
                      }}>
                        {u.blocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => toggleBlock(u.id, u.blocked)}
                        style={{
                          padding: "7px 14px", border: "none", borderRadius: 8,
                          fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
                          backgroundColor: u.blocked ? G : "#FFEBEE",
                          color: u.blocked ? "#fff" : "#E53935",
                        }}
                      >
                        {u.blocked ? "Unblock" : "Block"}
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
  <div style={{ padding: 48, textAlign: "center", color: MUTED, fontSize: 14 }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>{text}
  </div>
);

const inputStyle: React.CSSProperties = {
  padding: "10px 14px 10px 38px", border: "1.5px solid #E2E8E2",
  borderRadius: 10, fontSize: 14, color: "#0F1F0F",
  backgroundColor: "#fff", outline: "none", minWidth: 240,
};
const thStyle: React.CSSProperties = {
  padding: "14px 20px", textAlign: "left", fontSize: 12,
  fontWeight: 700, color: MUTED, letterSpacing: "0.5px", textTransform: "uppercase",
};
const tdStyle: React.CSSProperties = { padding: "14px 20px", fontSize: 14 };

export default UsersPage;