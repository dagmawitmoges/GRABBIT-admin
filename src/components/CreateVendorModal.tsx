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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!form.business_name || !form.email || !form.password || !pdf) {
      setError("Business name, email, password, and certificate PDF are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
      data.append("certificate", pdf);

      await api.post("/admin/vendors/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create vendor");
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
          <input name="owner_name" placeholder="Owner Name" onChange={handleChange} />
          <input name="email" type="email" placeholder="Email *" onChange={handleChange} />
          <input name="phone" placeholder="Phone *" onChange={handleChange} />
          <input name="address" placeholder="Address" onChange={handleChange} />
          <input name="tin" placeholder="TIN" onChange={handleChange} />
          <textarea name="business_description" placeholder="Business Description" onChange={handleChange} />
          <input name="location" placeholder="Location" onChange={handleChange} />
          <input name="business_type" placeholder="Business Type" onChange={handleChange} />
          <input name="branch_count" type="number" min={1} placeholder="Branch Count" onChange={handleChange} />
          <input name="password" type="password" placeholder="Initial Password *" onChange={handleChange} />
          <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files?.[0] || null)} />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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
