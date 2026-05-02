interface Vendor {
  id: number;
  business_name: string;
  email: string;
  status: string;
}

const VendorTable = ({
  vendors = [],
  onToggle,
}: {
  vendors?: Vendor[];
  onToggle: (id: number, status: string) => void;
}) => {
  if (!Array.isArray(vendors)) {
    return <p>No vendor data</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f5f5f5" }}>
          <th style={thStyle}>Business</th>
          <th style={thStyle}>Email</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Action</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map((v) => (
          <tr key={v.id}>
            <td style={tdStyle}>{v.business_name}</td>
            <td style={tdStyle}>{v.email}</td>
            <td style={tdStyle}>{v.status}</td>
            <td style={tdStyle}>
              <button onClick={() => onToggle(v.id, v.status)}>
                {v.status === "active" ? "Block" : "Activate"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const thStyle: React.CSSProperties = { padding: 12, textAlign: "left", fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: 12, borderBottom: "1px solid #ddd" };

export default VendorTable;
