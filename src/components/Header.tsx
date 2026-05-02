const Header = ({ onAdd }: any) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl font-semibold">Vendor Dashboard</h1>
      <p className="text-gray-500 text-sm">
        Manage your platform vendors
      </p>
    </div>

    <button
      onClick={onAdd}
      className="bg-red-500 text-white px-4 py-2 rounded-lg"
    >
      + Add Vendor
    </button>
  </div>
);

export default Header;