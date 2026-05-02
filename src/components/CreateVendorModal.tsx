import { useState } from "react";
import api from "../utils/axiosInstance";

const CreateVendorModal = ({ onClose, onSuccess }: any) => {
  const [form, setForm] = useState({
    business_name: "",
    owner_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const submit = async () => {
    await api.post("/admin/vendors", form);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">

        <h2 className="mb-4 font-bold">Create Vendor</h2>

        <input placeholder="Business Name" onChange={e => setForm({...form, business_name: e.target.value})} />
        <input placeholder="Owner Name" onChange={e => setForm({...form, owner_name: e.target.value})} />
        <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
        <input placeholder="Phone" onChange={e => setForm({...form, phone: e.target.value})} />
        <input placeholder="Address" onChange={e => setForm({...form, address: e.target.value})} />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>
          <button onClick={submit} className="bg-red-500 text-white px-3 py-1">
            Create
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateVendorModal;