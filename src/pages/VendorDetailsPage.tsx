import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";

const G = "#1DB954";
const GL = "#E8F5ED";
const MUTED = "#6B7C6B";
const DARK = "#0F1F0F";

type Vendor = {
  id: string | number;
  business_name: string;
  owner_name: string;
  phone?: string;
  contact_phone?: string;
  address?: string;
  status: string;
  business_type?: string;
  location?: string;
  tin?: string;
  user?: { email: string };
  email?: string;
};

const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Vendor | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        // Try direct endpoint first, fall back to list search
        try {
          const res = await api.get(`/admin/vendors/${id}`);
          setVendor(res.data);
          setDraft(res.data);
        } catch {
          const res = await api.get("/admin/vendors");
          const found = res.data.find((v: Vendor) => String(v.id) === id);
          setVendor(found ?? null);
          setDraft(found ?? null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  const validate = () => {
    if (!draft) return false;
    const errs: Record<string, string> = {};
    if (!draft.business_name?.trim()) errs.business_name = "Business name is required";
    if (!draft.owner_name?.trim()) errs.owner_name = "Owner name is required";
    const phone = draft.phone || draft.contact_phone || "";
    if (!phone.match(/^\+?[0-9]{9,15}$/)) errs.phone = "Enter a valid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !draft) return;
    try {
      setSaving(true);
      await api.put(`/admin/vendors/${draft.id}`, draft);
      setVendor(draft);
      setEditing(false);
      setErrors({});
    } catch (e: any) {
      setErrors({ general: e.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(vendor);
    setErrors({});
    setEditing(false);
  };

  const toggleStatus = async () => {
    if (!vendor) return;
    const newStatus = vendor.status === "active" ? "blocked" : "active";
    await api.patch(`/admin/vendors/${vendor.id}`, { status: newStatus });
    const updated = { ...vendor, status: newStatus };
    setVendor(updated);
    setDraft(updated);
  };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F8F5", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: MUTED }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          Loading vendor…
        </div>
      </div>
    </div>
  );

  if (!vendor) return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F8F5", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: MUTED }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          Vendor not found
        </div>
      </div>
    </div>
  );

  const email = vendor.user?.email ?? vendor.email ?? "N/A";
  const phone = vendor.phone ?? vendor.contact_phone ?? "N/A";
  const d = draft!;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F8F5", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "28px 32px" }}>
        {/* Back + header */}
        <button onClick={() => navigate("/vendors")} style={backBtnStyle}>← Back to Vendors</button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "16px 0 24px" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: DARK, margin: 0, letterSpacing: "-0.5px" }}>
              {vendor.business_name}
            </h1>
            <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0" }}>{vendor.business_type ?? "Vendor"}</p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
              backgroundColor: vendor.status === "active" ? GL : "#FFEBEE",
              color: vendor.status === "active" ? G : "#E53935",
            }}>
              {vendor.status === "active" ? "✓ Active" : "✕ Blocked"}
            </span>

            <button
              onClick={toggleStatus}
              style={{
                padding: "8px 16px", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                backgroundColor: vendor.status === "active" ? "#FFEBEE" : GL,
                color: vendor.status === "active" ? "#E53935" : G,
              }}
            >
              {vendor.status === "active" ? "Block Vendor" : "Unblock Vendor"}
            </button>

            {!editing && (
              <button onClick={() => setEditing(true)} style={primaryBtn}>
                ✎ Edit Vendor
              </button>
            )}
          </div>
        </div>

        {errors.general && (
          <div style={{ background: "#FFEBEE", border: "1px solid #FFCDD2", borderRadius: 10, padding: "10px 16px", color: "#C62828", marginBottom: 16, fontSize: 13 }}>
            ⚠ {errors.general}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Business Info */}
          <InfoCard title="Business Information">
            {editing ? (
              <>
                <EditField label="Business Name" value={d.business_name} error={errors.business_name}
                  onChange={v => setDraft({ ...d, business_name: v })} />
                <EditField label="Owner Name" value={d.owner_name} error={errors.owner_name}
                  onChange={v => setDraft({ ...d, owner_name: v })} />
                <EditField label="Business Type" value={d.business_type ?? ""} error=""
                  onChange={v => setDraft({ ...d, business_type: v })} />
                <EditField label="TIN" value={d.tin ?? ""} error=""
                  onChange={v => setDraft({ ...d, tin: v })} />
              </>
            ) : (
              <>
                <InfoRow label="Business Name" value={vendor.business_name} />
                <InfoRow label="Owner Name" value={vendor.owner_name} />
                <InfoRow label="Business Type" value={vendor.business_type ?? "N/A"} />
                <InfoRow label="TIN" value={vendor.tin ?? "N/A"} />
              </>
            )}
          </InfoCard>

          {/* Contact Info */}
          <InfoCard title="Contact Information">
            {editing ? (
              <>
                <EditField label="Phone" value={d.phone ?? d.contact_phone ?? ""} error={errors.phone}
                  onChange={v => setDraft({ ...d, phone: v, contact_phone: v })} />
                <EditField label="Address" value={d.address ?? ""} error=""
                  onChange={v => setDraft({ ...d, address: v })} />
                <EditField label="Location" value={d.location ?? ""} error=""
                  onChange={v => setDraft({ ...d, location: v })} />
              </>
            ) : (
              <>
                <InfoRow label="Email" value={email} />
                <InfoRow label="Phone" value={phone} />
                <InfoRow label="Address" value={vendor.address ?? "N/A"} />
                <InfoRow label="Location" value={vendor.location ?? "N/A"} />
              </>
            )}
          </InfoCard>
        </div>

        {/* Save / Cancel */}
        {editing && (
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
            <button onClick={handleCancel} style={ghostBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Sub-components ── */

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
    <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.5px", textTransform: "uppercase", margin: "0 0 16px" }}>{title}</p>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{value}</div>
  </div>
);

const EditField = ({ label, value, error, onChange }: { label: string; value: string; error: string; onChange: (v: string) => void }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 11, color: MUTED, fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "9px 12px", border: `1.5px solid ${error ? "#E53935" : "#E2E8E2"}`,
        borderRadius: 8, fontSize: 14, color: DARK, outline: "none", boxSizing: "border-box",
      }}
      onFocus={e => !error && (e.target.style.borderColor = G)}
      onBlur={e => !error && (e.target.style.borderColor = "#E2E8E2")}
    />
    {error && <span style={{ fontSize: 11, color: "#E53935", marginTop: 2, display: "block" }}>{error}</span>}
  </div>
);

const backBtnStyle: React.CSSProperties = {
  background: "none", border: "none", color: MUTED, cursor: "pointer",
  fontSize: 13, fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 4,
};
const primaryBtn: React.CSSProperties = {
  padding: "9px 18px", backgroundColor: G, color: "#fff",
  border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
  cursor: "pointer", boxShadow: "0 4px 12px rgba(29,185,84,0.3)",
};
const ghostBtn: React.CSSProperties = {
  padding: "9px 18px", border: "1.5px solid #E2E8E2", backgroundColor: "#fff",
  borderRadius: 10, fontSize: 13, fontWeight: 700, color: MUTED, cursor: "pointer",
};

export default VendorDetailsPage;