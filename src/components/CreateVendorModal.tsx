import { useState } from "react";
import api from "../utils/axiosInstance";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.business_name) newErrors.business_name = "Business name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Valid email is required";
    if (!form.phone.match(/^\d{7,15}$/)) newErrors.phone = "Phone must be digits only";
    if (!form.password || form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!pdf) newErrors.certificate = "Certificate PDF is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
      data.append("certificate", pdf!);

      await api.post("/admin/vendors/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrors({ global: err.response?.data?.message || "Failed to create vendor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 font-bold text-lg">Create Vendor</h2>

        <div className="flex flex-col gap-2">
          <input name="business_name" placeholder="Business Name *" onChange={handleChange} />
          {errors.business_name && <span className="text-red-500 text-xs">{errors.business_name}</span>}

          <input name="owner_name" placeholder="Owner Name" onChange={handleChange} />

          <input name="email" type="email" placeholder="Email *" onChange={handleChange} />
          {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}

          <input name="phone" placeholder="Phone *" onChange={handleChange} />
          {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}

          <input name="address" placeholder="Address" onChange={handleChange} />
          <input name="tin" placeholder="TIN" onChange={handleChange} />
          <textarea name="business_description" placeholder="Business Description" onChange={handleChange} />
          <input name="location" placeholder="Location" onChange={handleChange} />
          <input name="business_type" placeholder="Business Type" onChange={handleChange} />
          <input name="branch_count" type="number" min={1} placeholder="Branch Count" onChange={handleChange} />

          <input name="password" type="password" placeholder="Initial Password *" onChange={handleChange} />
          {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}

          <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files?.[0] || null)} />
          {errors.certificate && <span className="text-red-500 text-xs">{errors.certificate}</span>}
        </div>

        {errors.global && <p className="text-red-500 text-sm mt-2">{errors.global}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} disabled={loading}>Cancel</button>
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
