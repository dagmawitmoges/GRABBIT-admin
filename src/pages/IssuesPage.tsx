import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";

const MUTED = "#6B7C6B";
const G = "#1DB954";

type Issue = {
  id: string;
  reporter: string;
  description: string;
  status: "open" | "resolved";
  created_at?: string;
};

const IssuesPage = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/issues");
      setIssues(res.data);
    } finally {
      setLoading(false);
    }
  };

  const resolveIssue = async (id: string) => {
    await api.put(`/admin/issues/${id}/resolve`);
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: "resolved" } : i));
  };

  const filtered = issues.filter(i => filter === "all" || i.status === filter);
  const openCount = issues.filter(i => i.status === "open").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F8F5", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F1F0F", margin: 0, letterSpacing: "-0.5px" }}>Issues & Reports</h1>
            <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0" }}>
              {openCount} open issue{openCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, background: "#fff", padding: 4, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {(["all", "open", "resolved"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                  backgroundColor: filter === f ? G : "transparent",
                  color: filter === f ? "#fff" : MUTED,
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {loading ? (
            <Empty icon="⏳" text="Loading issues…" />
          ) : filtered.length === 0 ? (
            <Empty icon="✅" text="No issues found" />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F0F4F0" }}>
                  {["Reporter", "Description", "Status", "Action"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((issue, idx) => (
                  <tr key={issue.id} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#FAFCFA", borderBottom: "1px solid #F0F4F0" }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#0F1F0F" }}>{issue.reporter}</div>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 320 }}>
                      <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.5 }}>{issue.description}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        backgroundColor: issue.status === "resolved" ? "#E8F5ED" : "#FFF3E0",
                        color: issue.status === "resolved" ? G : "#E65100",
                      }}>
                        {issue.status === "resolved" ? "✓ Resolved" : "● Open"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {issue.status !== "resolved" && (
                        <button
                          onClick={() => resolveIssue(issue.id)}
                          style={resolveBtnStyle}
                          onMouseEnter={e => ((e.target as HTMLButtonElement).style.backgroundColor = "#17a347")}
                          onMouseLeave={e => ((e.target as HTMLButtonElement).style.backgroundColor = G)}
                        >
                          Mark Resolved
                        </button>
                      )}
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

const thStyle: React.CSSProperties = {
  padding: "14px 20px", textAlign: "left", fontSize: 12,
  fontWeight: 700, color: MUTED, letterSpacing: "0.5px",
  textTransform: "uppercase",
};
const tdStyle: React.CSSProperties = { padding: "14px 20px", fontSize: 14 };
const resolveBtnStyle: React.CSSProperties = {
  padding: "7px 14px", backgroundColor: G, color: "#fff",
  border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700,
  cursor: "pointer", transition: "background-color 0.2s",
};

export default IssuesPage;