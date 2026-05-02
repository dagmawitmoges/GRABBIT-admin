import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { supabase } from "../utils/supabase";

const G = "#1DB954";

type Vendor = {
  id: string; // ✅ FIXED (Supabase UUID)
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
};

const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const vendorId = id ?? ""; // ✅ safe fallback

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [draft, setDraft] = useState<Vendor | null>(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ───── FETCH ─────
  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorId) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("vendors")
        .select("*, user:users(*)")
        .eq("id", vendorId)
        .single();

      if (error) {
        console.error(error.message);
        setVendor(null);
      } else {
        setVendor(data);
        setDraft(data);
      }

      setLoading(false);
    };

    fetchVendor();
  }, [vendorId]);

  // ───── VALIDATION ─────
  const validate = () => {
    if (!draft) return false;

    const errs: Record<string, string> = {};

    if (!draft.business_name?.trim()) {
      errs.business_name = "Business name is required";
    }

    if (!draft.owner_name?.trim()) {
      errs.owner_name = "Owner name is required";
    }

    const phone = draft.phone || draft.contact_phone || "";
    if (phone && !/^\+?[0-9]{9,15}$/.test(phone)) {
      errs.phone = "Invalid phone number";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ───── SAVE ─────
  const handleSave = async () => {
    if (!validate() || !draft) return;

    setSaving(true);

    const { error } = await supabase
      .from("vendors")
      .update({
        business_name: draft.business_name,
        owner_name: draft.owner_name,
        phone: draft.phone,
        contact_phone: draft.contact_phone,
        address: draft.address,
        location: draft.location,
        tin: draft.tin,
        business_type: draft.business_type,
      })
      .eq("id", draft.id);

    if (error) {
      setErrors({ general: error.message });
    } else {
      setVendor(draft);
      setEditing(false);
      setErrors({});
    }

    setSaving(false);
  };

  // ───── STATUS TOGGLE ─────
  const toggleStatus = async () => {
    if (!vendor) return;

    const newStatus =
      vendor.status === "active" ? "blocked" : "active";

    const { error } = await supabase
      .from("vendors")
      .update({ status: newStatus })
      .eq("id", vendor.id);

    if (!error) {
      const updated = { ...vendor, status: newStatus };
      setVendor(updated);
      setDraft(updated);
    }
  };

  // ───── LOADING ─────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // ───── NOT FOUND ─────
  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Vendor not found
      </div>
    );
  }

  const email = vendor.user?.email || "N/A";

  // safe draft fallback
  const d = draft ?? vendor;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 p-6">
        <button onClick={() => navigate("/vendors")}>
          ← Back
        </button>

        <h1 className="text-2xl font-bold mt-4">
          {vendor.business_name}
        </h1>

        <p className="text-gray-500">
          {vendor.business_type || "Vendor"}
        </p>

        {/* STATUS */}
        <div className="mt-4 flex gap-2 items-center">
          <span
            className="px-3 py-1 rounded text-white"
            style={{
              background:
                vendor.status === "active" ? G : "#E53935",
            }}
          >
            {vendor.status}
          </span>

          <button onClick={toggleStatus}>
            Toggle Status
          </button>

          <button onClick={() => setEditing(true)}>
            Edit
          </button>
        </div>

        {/* ERROR */}
        {errors.general && (
          <p className="text-red-500 mt-2">
            {errors.general}
          </p>
        )}

        {/* FORM */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card title="Business Info">
            <Input
              label="Business Name"
              value={d.business_name}
              onChange={(v: string) =>
                setDraft({ ...d, business_name: v })
              }
              error={errors.business_name}
            />

            <Input
              label="Owner Name"
              value={d.owner_name}
              onChange={(v: string) =>
                setDraft({ ...d, owner_name: v })
              }
              error={errors.owner_name}
            />
          </Card>

          <Card title="Contact">
            <Input label="Email" value={email} disabled />

            <Input
              label="Phone"
              value={d.phone || ""}
              onChange={(v: string) =>
                setDraft({ ...d, phone: v })
              }
              error={errors.phone}
            />
          </Card>
        </div>

        {/* SAVE */}
        {editing && (
          <div className="mt-6 flex gap-2 justify-end">
            <button onClick={() => setEditing(false)}>
              Cancel
            </button>

            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* UI COMPONENTS */
const Card = ({ title, children }: any) => (
  <div className="bg-white p-4 shadow rounded">
    <h3 className="font-bold mb-2">{title}</h3>
    {children}
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  error,
  disabled,
}: any) => (
  <div className="mb-3">
    <label className="text-xs text-gray-500">{label}</label>
    <input
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border p-2 rounded"
    />
    {error && (
      <p className="text-red-500 text-xs">{error}</p>
    )}
  </div>
);

export default VendorDetailsPage;