import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { mapVendorProfileRow } from "../utils/vendorData";
import type {
  Vendor,
  VendorAccountStatus,
  VendorStatus,
} from "../components/vendor";
import { adminUi } from "../constants/adminUi";

const G = "#1DB954";

const VENDOR_DETAIL_SELECT = `
  *,
  profile:profiles!vendor_profiles_user_id_fkey(
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    role,
    is_verified,
    location_id,
    created_at,
    updated_at,
    locations ( id, city, sub_city, country )
  ),
  vendor_branches(
    id,
    address_detail,
    created_at,
    locations ( city, sub_city, country )
  ),
  vendor_documents(
    id,
    document_type,
    file_url,
    uploaded_at
  )
`;

type BranchRow = {
  id: string;
  address_detail?: string | null;
  created_at?: string | null;
  locations?: {
    city?: string | null;
    sub_city?: string | null;
    country?: string | null;
  } | null;
};

type DocRow = {
  id: string;
  document_type?: string | null;
  file_url: string;
  uploaded_at?: string | null;
};

type ProfileDetail = {
  id?: string;
  email?: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  role?: string | null;
  location_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  locations?: {
    city?: string | null;
    sub_city?: string | null;
    country?: string | null;
  } | null;
};

function normalizeProfileLocation(raw: ProfileDetail["locations"]) {
  if (!raw) return null;
  const arr = raw as unknown;
  if (Array.isArray(arr)) return arr[0] ?? null;
  return raw;
}

function formatDt(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/** DB stores generated full_name from first + last; map display name back for updates. */
function accountStatusPill(accountStatus: VendorAccountStatus) {
  switch (accountStatus) {
    case "banned":
      return { label: "Banned", bg: "#B71C1C" };
    case "suspended":
      return { label: "Suspended", bg: "#F57F17" };
    default:
      return { label: "Trading allowed", bg: "#2E7D32" };
  }
}

function splitDisplayName(name: string): {
  first_name: string | null;
  last_name: string | null;
} {
  const t = name.trim();
  if (!t) return { first_name: null, last_name: null };
  const i = t.indexOf(" ");
  if (i === -1) return { first_name: t, last_name: null };
  return {
    first_name: t.slice(0, i).trim() || null,
    last_name: t.slice(i + 1).trim() || null,
  };
}

const VendorDetailsPage = () => {
  const { id } = useParams();
  const vendorId = id ?? "";

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [draft, setDraft] = useState<Vendor | null>(null);
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [vpCreated, setVpCreated] = useState<string | null>(null);
  const [vpUpdated, setVpUpdated] = useState<string | null>(null);
  const [profileCreated, setProfileCreated] = useState<string | null>(null);
  const [profileUpdated, setProfileUpdated] = useState<string | null>(null);
  const [profileDetail, setProfileDetail] = useState<ProfileDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountBusy, setAccountBusy] = useState(false);

  const load = async () => {
    if (!vendorId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("vendor_profiles")
      .select(VENDOR_DETAIL_SELECT)
      .eq("user_id", vendorId)
      .single();

    if (error) {
      console.error(error.message);
      setVendor(null);
      setBranches([]);
      setDocuments([]);
      setProfileDetail(null);
    } else if (data) {
      setVendor(mapVendorProfileRow(data));
      setDraft(mapVendorProfileRow(data));
      setVpCreated(data.created_at ?? null);
      setVpUpdated(data.updated_at ?? null);

      const p = data.profile as ProfileDetail | undefined;
      setProfileDetail(p ?? null);
      setProfileCreated(p?.created_at ?? null);
      setProfileUpdated(p?.updated_at ?? null);

      const rawBranches = (data.vendor_branches || []) as BranchRow[];
      setBranches(
        rawBranches.map((b) => {
          const loc = b.locations as unknown;
          const locObj = Array.isArray(loc) ? loc[0] : loc;
          return {
            ...b,
            locations:
              locObj && typeof locObj === "object"
                ? (locObj as BranchRow["locations"])
                : null,
          };
        })
      );

      const docs = (data.vendor_documents || []) as DocRow[];
      setDocuments(docs);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [vendorId]);

  const validate = () => {
    if (!draft) return false;

    const errs: Record<string, string> = {};

    if (!draft.business_name?.trim()) {
      errs.business_name = "Business name is required";
    }

    if (!draft.owner_name?.trim()) {
      errs.owner_name = "Owner name is required";
    }

    const phone = draft.phone || "";
    if (phone && !/^\+?[0-9]{7,15}$/.test(phone.replace(/\s/g, ""))) {
      errs.phone = "Invalid phone number";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !draft) return;

    setSaving(true);

    const { error: vErr } = await supabase
      .from("vendor_profiles")
      .update({
        business_name: draft.business_name,
        business_description: draft.business_description ?? null,
        phone: draft.phone ?? null,
        location: draft.location ?? null,
        tin: draft.tin ?? null,
      })
      .eq("user_id", draft.id);

    if (vErr) {
      setErrors({ general: vErr.message });
      setSaving(false);
      return;
    }

    const { first_name, last_name } = splitDisplayName(draft.owner_name ?? "");
    const { error: pErr } = await supabase
      .from("profiles")
      .update({
        first_name,
        last_name,
      })
      .eq("id", draft.id);

    if (pErr) {
      setErrors({ general: pErr.message });
      setSaving(false);
      return;
    }

    const computedFull = [first_name, last_name].filter(Boolean).join(" ").trim();
    const next = {
      ...draft,
      user: draft.user
        ? { ...draft.user, full_name: computedFull || draft.user.full_name }
        : draft.user,
    };
    setVendor(next);
    setDraft(next);
    setEditing(false);
    setErrors({});
    setSaving(false);
    await load();
  };

  const toggleStatus = async () => {
    if (!vendor) return;

    const nextVerified = vendor.status !== "active";

    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: nextVerified })
      .eq("id", vendor.id);

    if (!error) {
      const st: VendorStatus = nextVerified ? "active" : "pending";
      const updated = { ...vendor, status: st };
      setVendor(updated);
      setDraft(updated);
      await load();
    }
  };

  const setVendorAccountStatus = async (next: VendorAccountStatus) => {
    if (!vendor) return;

    setAccountBusy(true);
    setErrors((prev) => {
      const { general: _g, ...rest } = prev;
      return rest;
    });

    const { error } = await supabase
      .from("vendor_profiles")
      .update({ account_status: next })
      .eq("user_id", vendor.id);

    setAccountBusy(false);

    if (error) {
      setErrors({ general: error.message });
      return;
    }

    const updated = { ...vendor, accountStatus: next };
    setVendor(updated);
    setDraft((d) => (d ? { ...d, accountStatus: next } : updated));
    await load();
  };

  if (loading) {
    return (
      <div
        className={`${adminUi.contentWide} flex min-h-[50vh] items-center justify-center text-gray-500 dark:text-gray-400`}
      >
        Loading…
      </div>
    );
  }

  if (!vendor) {
    return (
      <div
        className={`${adminUi.contentWide} flex min-h-[50vh] flex-col items-center justify-center gap-4`}
      >
        <p className="text-gray-600 dark:text-gray-300">Vendor not found</p>
        <Link to="/vendors" className={adminUi.secondaryBtn}>
          Back to vendors
        </Link>
      </div>
    );
  }

  const email = vendor.user?.email || "—";
  const d = draft ?? vendor;
  const homeLoc = normalizeProfileLocation(profileDetail?.locations);

  return (
    <div className={adminUi.contentWide}>
        <Link
          to="/vendors"
          className={`${adminUi.dangerOutlineBtn} mb-6 inline-flex`}
        >
          ← Back to vendors
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={adminUi.h1}>{vendor.business_name}</h1>
            <p className={adminUi.subtitle}>Full vendor record</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className="px-3 py-1 rounded-lg text-white text-sm font-medium"
              style={{
                background: vendor.status === "active" ? G : "#E53935",
              }}
            >
              {vendor.status === "active" ? "Verified" : "Pending"}
            </span>
            <span
              className="px-3 py-1 rounded-lg text-white text-sm font-medium"
              style={{
                background: accountStatusPill(vendor.accountStatus).bg,
              }}
            >
              {accountStatusPill(vendor.accountStatus).label}
            </span>
            <button type="button" onClick={toggleStatus} className={adminUi.secondaryBtn}>
              Toggle verification
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={adminUi.primaryBtn}
            >
              Edit
            </button>
          </div>
        </div>

        {errors.general && (
          <div className={`${adminUi.globalError} mb-6`}>{errors.general}</div>
        )}

        <section className={`${adminUi.card} mb-6`}>
          <h2 className={adminUi.sectionTitle}>Owner & account</h2>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <Info label="Email" value={email} />
            <Info label="Profile phone" value={vendor.user?.phone ?? "—"} />
            <Info label="First name" value={profileDetail?.first_name ?? "—"} />
            <Info label="Last name" value={profileDetail?.last_name ?? "—"} />
            <Info label="Full name" value={vendor.user?.full_name ?? "—"} />
            <Info
              label="Role"
              value={
                profileDetail?.role != null ? String(profileDetail.role) : "—"
              }
            />
            <Info label="Profile location ID" value={profileDetail?.location_id ?? "—"} mono />
            <Info label="Verification" value={vendor.status === "active" ? "Verified" : "Pending"} />
            <Info
              label="Trading / deals"
              value={accountStatusPill(vendor.accountStatus).label}
            />
            <Info
              label="Profile created"
              value={formatDt(profileCreated)}
            />
            <Info
              label="Profile updated"
              value={formatDt(profileUpdated)}
            />
          </dl>
          {homeLoc && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Profile location (home)
              </p>
              <p className="text-sm text-gray-800">
                {[homeLoc.sub_city, homeLoc.city, homeLoc.country]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
          )}
        </section>

        <section className={`${adminUi.card} mb-6`}>
          <h2 className={adminUi.sectionTitle}>Trading &amp; deals</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Suspend or ban stops this vendor from posting new deals and accepting
            orders once your app and API enforce{" "}
            <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">
              vendor_profiles.account_status
            </code>
            .
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {vendor.accountStatus !== "active" && (
              <button
                type="button"
                disabled={accountBusy}
                onClick={() => setVendorAccountStatus("active")}
                className={adminUi.primaryBtnSm}
              >
                {accountBusy ? "Updating…" : "Restore (active)"}
              </button>
            )}
            {vendor.accountStatus === "active" && (
              <button
                type="button"
                disabled={accountBusy}
                onClick={() => {
                  if (
                    confirm(
                      "Suspend this vendor? They should be blocked from new deals and orders in the app."
                    )
                  )
                    void setVendorAccountStatus("suspended");
                }}
                className={adminUi.secondaryBtn}
              >
                Suspend
              </button>
            )}
            {(vendor.accountStatus === "active" ||
              vendor.accountStatus === "suspended") && (
              <button
                type="button"
                disabled={accountBusy}
                onClick={() => {
                  if (
                    confirm(
                      "Ban this vendor? This is the strongest lock; restore only when appropriate."
                    )
                  )
                    void setVendorAccountStatus("banned");
                }}
                className={adminUi.dangerBtnSm}
              >
                Ban
              </button>
            )}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <section className={adminUi.card}>
            <h2 className={adminUi.sectionTitle}>Business (editable)</h2>
            <Input
              label="Business name"
              value={d.business_name}
              onChange={(v: string) =>
                setDraft({ ...d, business_name: v })
              }
              error={errors.business_name}
              disabled={!editing}
            />

            <Input
              label="Owner display name"
              value={d.owner_name ?? ""}
              onChange={(v: string) =>
                setDraft({ ...d, owner_name: v })
              }
              error={errors.owner_name}
              disabled={!editing}
            />

            <label className={adminUi.label}>Description</label>
            <textarea
              disabled={!editing}
              value={d.business_description ?? ""}
              onChange={(e) =>
                setDraft({ ...d, business_description: e.target.value })
              }
              className={adminUi.textarea}
              rows={3}
            />

            <Input
              label="Business phone"
              value={d.phone || ""}
              onChange={(v: string) =>
                setDraft({ ...d, phone: v })
              }
              error={errors.phone}
              disabled={!editing}
            />

            <Input
              label="Location summary"
              value={d.location || ""}
              onChange={(v: string) =>
                setDraft({ ...d, location: v })
              }
              disabled={!editing}
            />

            <Input
              label="TIN"
              value={d.tin || ""}
              onChange={(v: string) =>
                setDraft({ ...d, tin: v })
              }
              disabled={!editing}
            />
          </section>

          <section className={adminUi.card}>
            <h2 className={adminUi.sectionTitle}>Vendor profile meta</h2>
            <dl className="grid gap-3 text-sm">
              <Info label="User ID" value={vendor.id} mono />
              <Info label="Vendor profile created" value={formatDt(vpCreated)} />
              <Info label="Vendor profile updated" value={formatDt(vpUpdated)} />
              {d.certificate_file_path && (
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">
                    Legacy certificate URL
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={d.certificate_file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1DB954] hover:underline break-all text-sm"
                    >
                      Open file
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <section className={`${adminUi.card} mb-6`}>
          <h2 className={adminUi.sectionTitle}>Branches</h2>
          {branches.length === 0 ? (
            <p className="text-sm text-gray-500">No branch rows.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-2 pr-4">Subcity</th>
                    <th className="py-2 pr-4">City</th>
                    <th className="py-2 pr-4">Country</th>
                    <th className="py-2 pr-4">Address detail</th>
                    <th className="py-2 pr-4">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4">{b.locations?.sub_city ?? "—"}</td>
                      <td className="py-2 pr-4">{b.locations?.city ?? "—"}</td>
                      <td className="py-2 pr-4">{b.locations?.country ?? "—"}</td>
                      <td className="py-2 pr-4 max-w-xs">
                        {b.address_detail ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">
                        {formatDt(b.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={`${adminUi.card} mb-12`}>
          <h2 className={adminUi.sectionTitle}>Documents</h2>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {doc.document_type || "Document"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded {formatDt(doc.uploaded_at)}
                    </p>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={adminUi.primaryBtnSm}
                  >
                    Open
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {editing && (
          <div className={`${adminUi.toolbarRow} justify-end mt-6 pb-12`}>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={adminUi.secondaryBtn}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={adminUi.primaryBtn}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
    </div>
  );
};

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-gray-900 dark:text-gray-100 ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

const Input = ({
  label,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) => (
  <div className="mb-4">
    <label className={adminUi.label}>{label}</label>
    <input
      disabled={disabled}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`${adminUi.input} ${disabled ? "bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400" : ""}`}
    />
    {error && <p className={adminUi.errorText}>{error}</p>}
  </div>
);

export default VendorDetailsPage;
