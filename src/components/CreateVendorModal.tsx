import { useState } from "react";
import { supabase } from "../utils/supabase";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateVendorModal = ({ onClose, onSuccess }: Props) => {
  const [form, setForm] = useState({
    business_name: "",
    owner_name: "",
    email: "",
    phone: "",
    address: "",
    tin: "",
    business_description: "",
    location: "",
    business_type: "",
    branch_count: 1,
    password: "",
  });

  const [pdf, setPdf] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ VALIDATION
  const validate = () => {
    const newErrors: any = {};

    if (!form.business_name) newErrors.business_name = "Required";
    if (!form.email.includes("@")) newErrors.email = "Invalid email";
    if (!form.phone.match(/^\d{7,15}$/)) newErrors.phone = "Invalid phone";
    if (!form.password || form.password.length < 6)
      newErrors.password = "Min 6 characters";
    if (!pdf) newErrors.certificate = "PDF required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SUBMIT (SUPABASE ONLY)
  const submit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // 1️⃣ Upload PDF to storage
      const fileName = `${Date.now()}_${pdf!.name}`;

      const { error: uploadError } = await supabase.storage
        .from("vendor-certificates")
        .upload(fileName, pdf!);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("vendor-certificates")
        .getPublicUrl(fileName);

      // 2️⃣ Create vendor in DB
      const { error } = await supabase.from("vendors").insert([
        {
          business_name: form.business_name,
          owner_name: form.owner_name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          tin: form.tin,
          business_description: form.business_description,
          location: form.location,
          business_type: form.business_type,
          branch_count: Number(form.branch_count),
          status: "pending",
          certificate_url: publicUrl.publicUrl,
        },
      ]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrors({ global: err.message || "Failed to create vendor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[500px] max-h-[90vh] overflow-y-auto">

        <h2 className="mb-4 font-bold text-lg">Create Vendor</h2>

        <div className="flex flex-col gap-2">

          <input
            name="business_name"
            placeholder="Business Name *"
            onChange={handleChange}
          />
          <span className="text-red-500 text-xs">{errors.business_name}</span>

          <input name="owner_name" placeholder="Owner Name" onChange={handleChange} />

          <input name="email" placeholder="Email *" onChange={handleChange} />
          <span className="text-red-500 text-xs">{errors.email}</span>

          <input name="phone" placeholder="Phone *" onChange={handleChange} />
          <span className="text-red-500 text-xs">{errors.phone}</span>

          <input name="address" placeholder="Address" onChange={handleChange} />
          <input name="tin" placeholder="TIN" onChange={handleChange} />
          <textarea
            name="business_description"
            placeholder="Business Description"
            onChange={handleChange}
          />

          <input name="location" placeholder="Location" onChange={handleChange} />
          <input name="business_type" placeholder="Business Type" onChange={handleChange} />

          <input
            name="branch_count"
            type="number"
            min={1}
            placeholder="Branch Count"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Initial Password *"
            onChange={handleChange}
          />
          <span className="text-red-500 text-xs">{errors.password}</span>

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files?.[0] || null)}
          />
          <span className="text-red-500 text-xs">{errors.certificate}</span>
        </div>

        {errors.global && (
          <p className="text-red-500 text-sm mt-2">{errors.global}</p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVendorModal;