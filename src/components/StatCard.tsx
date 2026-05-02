const StatCard = ({ title, value }: any) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-xl font-bold">{value}</h2>
  </div>
);

export default StatCard;