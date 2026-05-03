import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminUi } from "../constants/adminUi";
import { createVendorWithAuth } from "../utils/createVendor";
import type { BranchInput, DocumentInput } from "../utils/createVendor";

const phoneRe = /^\+?[0-9\s]{7,20}$/;

const newBranch = (): BranchInput => ({
  sub_city: "",
  city: "",
  country: "",
  address_detail: "",
});

const newDocSlot = (): { id: string; file: File | null; document_type: string } => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  file: null,
  document_type: "",
});

const AddVendorPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    profile_phone: "",
    vendor_phone: "",
    business_name: "",
    business_description: "",
    tin: "",
    is_verified: false,
  });

  const [branches, setBranches] = useState<BranchInput[]>([newBranch()]);
  const [docSlots, setDocSlots] = useState(() => [newDocSlot()]);

  const setField = (name: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const updateBranch = (index: number, patch: Partial<BranchInput>) => {
    setBranches((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...patch } : b))
    );
  };

  const addBranch = () => setBranches((prev) => [...prev, newBranch()]);
  const removeBranch = (index: number) => {
    if (branches.length <= 1) return;
    setBranches((prev) => prev.filter((_, i) => i !== index));
  };

  const addDocSlot = () => setDocSlots((prev) => [...prev, newDocSlot()]);
  const removeDocSlot = (id: string) => {
    if (docSlots.length <= 1) return;
    setDocSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.email.trim() || !form.email.includes("@"))
      e.email = "Valid email required";
    if (!form.password || form.password.length < 6)
      e.password = "At least 6 characters";
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.last_name.trim()) e.last_name = "Required";
    if (
      !form.profile_phone.trim() ||
      !phoneRe.test(form.profile_phone.replace(/\s/g, ""))
    )
      e.profile_phone = "Valid phone required";
    if (
      !form.vendor_phone.trim() ||
      !phoneRe.test(form.vendor_phone.replace(/\s/g, ""))
    )
      e.vendor_phone = "Valid phone required";
    if (!form.business_name.trim()) e.business_name = "Required";

    branches.forEach((b, i) => {
      if (!b.city.trim()) e[`branch_${i}_city`] = "City required";
      if (!b.country.trim()) e[`branch_${i}_country`] = "Country required";
    });

    const docs = docSlots.filter((s) => s.file);
    if (docs.length === 0) e.documents = "Add at least one document";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrors({});
    if (!validate()) return;

    const documents: DocumentInput[] = docSlots
      .filter((s): s is typeof s & { file: File } => s.file !== null)
      .map((s) => ({
        file: s.file,
        document_type: s.document_type,
      }));

    setLoading(true);
    try {
      await createVendorWithAuth({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        profile_phone: form.profile_phone.replace(/\s/g, ""),
        is_verified: form.is_verified,
        business_name: form.business_name,
        business_description: form.business_description.trim() || null,
        vendor_phone: form.vendor_phone.replace(/\s/g, ""),
        tin: form.tin.trim() || null,
        branches,
        documents,
      });
      navigate("/vendors", { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create vendor";
      setErrors({ _global: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={adminUi.contentWide}>
        <div className="mb-8">
          <Link
            to="/vendors"
            className={`${adminUi.dangerOutlineBtn} mb-4`}
          >
            ← Back to vendors
          </Link>
          <h1 className={adminUi.h1}>Add vendor</h1>
          <p className={adminUi.subtitle}>
            Create an account, profile, branches, and documents.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {errors._global && (
            <div className={adminUi.globalError} role="alert">
              {errors._global}
            </div>
          )}

          <section className={adminUi.card}>
            <h2 className={adminUi.sectionTitle}>Account access</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(v) => setField("email", v)}
                error={errors.email}
                required
              />
              <Field
                label="Initial password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(v) => setField("password", v)}
                error={errors.password}
                required
              />
            </div>
          </section>

          <section className={adminUi.card}>
            <h2 className={adminUi.sectionTitle}>Owner profile</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <Field
                label="First name"
                name="first_name"
                value={form.first_name}
                onChange={(v) => setField("first_name", v)}
                error={errors.first_name}
                required
              />
              <Field
                label="Last name"
                name="last_name"
                value={form.last_name}
                onChange={(v) => setField("last_name", v)}
                error={errors.last_name}
                required
              />
              <Field
                label="Profile phone"
                name="profile_phone"
                value={form.profile_phone}
                onChange={(v) => setField("profile_phone", v)}
                error={errors.profile_phone}
                required
              />
            </div>
            <div className="mt-5 flex items-start gap-3">
              <input
                id="is_verified"
                type="checkbox"
                checked={form.is_verified}
                onChange={(e) => setField("is_verified", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1DB954] focus:ring-[#1DB954]"
              />
              <label htmlFor="is_verified" className="text-sm text-gray-700">
                <span className="font-medium">Verified on creation</span>
              </label>
            </div>
          </section>

          <section className={adminUi.card}>
            <h2 className={adminUi.sectionTitle}>Business</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Field
                  label="Business name"
                  name="business_name"
                  value={form.business_name}
                  onChange={(v) => setField("business_name", v)}
                  error={errors.business_name}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className={adminUi.label}>Business description</label>
                <textarea
                  name="business_description"
                  className={adminUi.textarea}
                  placeholder="What the business offers…"
                  value={form.business_description}
                  onChange={(e) =>
                    setField("business_description", e.target.value)
                  }
                />
              </div>
              <Field
                label="Business phone"
                name="vendor_phone"
                value={form.vendor_phone}
                onChange={(v) => setField("vendor_phone", v)}
                error={errors.vendor_phone}
                required
              />
              <Field
                label="TIN"
                name="tin"
                value={form.tin}
                onChange={(v) => setField("tin", v)}
              />
            </div>
          </section>

          <section className={adminUi.card}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-gray-900 m-0">
                Branches & locations
              </h2>
              <button
                type="button"
                onClick={addBranch}
                className={adminUi.secondaryBtn}
              >
                + Add branch
              </button>
            </div>

            <div className="space-y-6">
              {branches.map((b, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Branch {i + 1}
                    </span>
                    {branches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBranch(i)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field
                      label="Subcity"
                      name={`sub_city_${i}`}
                      value={b.sub_city}
                      onChange={(v) => updateBranch(i, { sub_city: v })}
                    />
                    <Field
                      label="City"
                      name={`city_${i}`}
                      value={b.city}
                      onChange={(v) => updateBranch(i, { city: v })}
                      error={errors[`branch_${i}_city`]}
                      required
                    />
                    <Field
                      label="Country"
                      name={`country_${i}`}
                      value={b.country}
                      onChange={(v) => updateBranch(i, { country: v })}
                      error={errors[`branch_${i}_country`]}
                      required
                    />
                    <div className="md:col-span-2">
                      <label className={adminUi.label}>Address detail</label>
                      <input
                        className={adminUi.input}
                        value={b.address_detail}
                        onChange={(e) =>
                          updateBranch(i, { address_detail: e.target.value })
                        }
                        placeholder="Street, building, notes…"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={adminUi.card}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-gray-900 m-0">
                Documents
              </h2>
              <button
                type="button"
                onClick={addDocSlot}
                className={adminUi.secondaryBtn}
              >
                + Add document
              </button>
            </div>

            {errors.documents && (
              <p className={`${adminUi.errorText} mb-3`}>{errors.documents}</p>
            )}

            <div className="space-y-4">
              {docSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-col md:flex-row md:items-end gap-4 rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex-1">
                    <label className={adminUi.label}>Document type</label>
                    <input
                      className={adminUi.input}
                      placeholder="e.g. Certificate, license"
                      value={slot.document_type}
                      onChange={(e) =>
                        setDocSlots((prev) =>
                          prev.map((s) =>
                            s.id === slot.id
                              ? { ...s, document_type: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className={adminUi.label}>File</label>
                    <input
                      type="file"
                      className={`${adminUi.input} py-2 file:mr-3 file:rounded-md file:border-0 file:bg-[#1DB954]/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#1DB954]`}
                      onChange={(e) =>
                        setDocSlots((prev) =>
                          prev.map((s) =>
                            s.id === slot.id
                              ? { ...s, file: e.target.files?.[0] ?? null }
                              : s
                          )
                        )
                      }
                    />
                  </div>
                  {docSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocSlot(slot.id)}
                      className="text-sm text-red-600 hover:underline md:mb-3"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className={`${adminUi.toolbarRow} justify-end pb-12`}>
            <Link to="/vendors" className={adminUi.secondaryBtn}>
              Cancel
            </Link>
            <button type="submit" disabled={loading} className={adminUi.primaryBtn}>
              {loading ? "Creating…" : "Create vendor"}
            </button>
          </div>
        </form>
    </div>
  );
};

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className={adminUi.label}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className={adminUi.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className={adminUi.errorText}>{error}</p>}
    </div>
  );
}

export default AddVendorPage;
