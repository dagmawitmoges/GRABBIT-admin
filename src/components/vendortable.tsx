import { useNavigate } from "react-router-dom";
import type { Vendor, VendorAccountStatus, VendorStatus } from "./vendor";
import { adminUi } from "../constants/adminUi";

interface Props {
  vendors: Vendor[];
  onToggle: (id: string, status: VendorStatus) => void;
}

function tradingBadgeClass(a: VendorAccountStatus) {
  if (a === "banned") return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
  if (a === "suspended")
    return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200";
  return "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200";
}

function tradingLabel(a: VendorAccountStatus) {
  if (a === "banned") return "Banned";
  if (a === "suspended") return "Suspended";
  return "Active";
}

const VendorTable = ({ vendors, onToggle }: Props) => {
  const navigate = useNavigate();

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <th className="py-3 pr-4">Business</th>
          <th className="py-3 pr-4">Owner</th>
          <th className="py-3 pr-4">Email</th>
          <th className="py-3 pr-4">Verified</th>
          <th className="py-3 pr-4">Trading</th>
          <th className="py-3 pr-4 text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {vendors.map((v) => (
          <tr
            key={v.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/vendors/${v.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                navigate(`/vendors/${v.id}`);
            }}
            className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer dark:border-gray-800 dark:hover:bg-gray-800/50"
          >
            <td className="py-3 pr-4 font-medium text-[#1DB954]">
              {v.business_name}
            </td>
            <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{v.owner_name ?? "—"}</td>
            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{v.user?.email ?? "—"}</td>
            <td className="py-3 pr-4">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  v.status === "active"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                    : "bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                }`}
              >
                {v.status}
              </span>
            </td>
            <td className="py-3 pr-4">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tradingBadgeClass(v.accountStatus)}`}
              >
                {tradingLabel(v.accountStatus)}
              </span>
            </td>

            <td className="py-3 pl-4 text-right">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(v.id, v.status);
                }}
                className={adminUi.dangerOutlineBtn}
              >
                {v.status === "active" ? "Unverify" : "Verify"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default VendorTable;
