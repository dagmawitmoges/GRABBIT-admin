import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axiosInstance";

const VendorDetailsPage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const fetchVendors = async () => {
      const res = await api.get("/admin/vendors");
      const found = res.data.find((v: any) => String(v.id) === id);
      setVendor(found);
    };
    fetchVendors();
  }, [id]);

  const validate = () => {
    const errs: any = {};
    if (!vendor.business_name) errs.business_name = "Business name required";
    if (!vendor.owner_name) errs.owner_name = "Owner name required";
    if (!vendor.contact_phone.match(/^[0-9]{10}$/)) errs.contact_phone = "Phone must be 10 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await api.put(`/admin/vendors/${vendor.id}`, vendor);
    alert("Vendor updated successfully");
    setEditing(false);
  };

  if (!vendor) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">{vendor.business_name}</h1>
      <p>Owner: {vendor.owner_name}</p>
      <p>Email: {vendor.user?.email}</p>
      <p>Phone: {vendor.contact_phone}</p>
      <p>Address: {vendor.address}</p>
      <p>Status: {vendor.status}</p>

      {editing ? (
        <div className="mt-4 space-y-2">
          <input
            className="border p-2 w-full"
            value={vendor.business_name}
            onChange={(e) => setVendor({ ...vendor, business_name: e.target.value })}
          />
          {errors.business_name && <span className="text-red-500">{errors.business_name}</span>}

          <input
            className="border p-2 w-full"
            value={vendor.owner_name}
            onChange={(e) => setVendor({ ...vendor, owner_name: e.target.value })}
          />
          {errors.owner_name && <span className="text-red-500">{errors.owner_name}</span>}

          <input
            className="border p-2 w-full"
            value={vendor.contact_phone}
            onChange={(e) => setVendor({ ...vendor, contact_phone: e.target.value })}
          />
          {errors.contact_phone && <span className="text-red-500">{errors.contact_phone}</span>}

          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>
            Save
          </button>
        </div>
      ) : (
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setEditing(true)}
        >
          Edit Vendor
        </button>
      )}
    </div>
  );
};

export default VendorDetailsPage;
