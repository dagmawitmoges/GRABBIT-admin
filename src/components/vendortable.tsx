import type { Vendor, VendorStatus } from "../components/vendor";

interface Props {
  vendors: Vendor[];
  onToggle: (id: string, status: VendorStatus) => void;
}

const VendorTable = ({ vendors, onToggle }: Props) => {
  return (
    <table style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Business</th>
          <th>Owner</th>
          <th>Email</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {vendors.map((v) => (
          <tr key={v.id}>
            <td>{v.business_name}</td>
            <td>{v.owner_name ?? "-"}</td>
            <td>{v.user?.email ?? v.email ?? "-"}</td>
            <td>{v.status}</td>

            <td>
              <button onClick={() => onToggle(v.id, v.status)}>
                {v.status === "active" ? "Block" : "Unblock"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VendorTable;
