import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { DEAL_LIST_SELECT, type DealRow } from "../utils/dealsData";
import DealDetailModal from "../components/DealDetailModal";
import { adminUi } from "../constants/adminUi";

const DEAL_MINIMAL = `
  *,
  category:categories(name),
  location:locations(city, sub_city, country)
`;

function asDealRows(data: unknown): DealRow[] {
  return (data ?? []) as DealRow[];
}

const DealsPage = () => {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchNote, setFetchNote] = useState<string | null>(null);
  const [selected, setSelected] = useState<DealRow | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setFetchNote(null);

    let q = supabase
      .from("deals")
      .select(DEAL_LIST_SELECT)
      .order("created_at", { ascending: false })
      .limit(300);

    const { data, error } = await q;

    if (error) {
      const fallback = await supabase
        .from("deals")
        .select(DEAL_MINIMAL)
        .order("created_at", { ascending: false })
        .limit(300);

      if (fallback.error) {
        console.error(fallback.error.message);
        setDeals([]);
        setFetchNote(fallback.error.message);
      } else {
        setDeals(asDealRows(fallback.data));
        setFetchNote(
          "Loaded without vendor/seller links. Run DB migration or fix relationship names in src/utils/dealsData.ts if embeds are required."
        );
      }
    } else {
      setDeals(asDealRows(data));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = deals.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={adminUi.content}>
      <div className="mb-6">
        <h1 className={adminUi.h1}>Deals</h1>
        <p className={adminUi.subtitle}>
          Review listings. Open a deal to see details and cancel it if needed.
        </p>
      </div>

      {fetchNote && (
        <div
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
        >
          {fetchNote}
        </div>
      )}

      <input
        placeholder="Search by title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${adminUi.input} max-w-md mb-4`}
      />

      <div className={`${adminUi.card} p-0 overflow-hidden`}>
        {loading ? (
          <p className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading…
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(d)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelected(d);
                    }}
                    className="cursor-pointer border-b border-gray-100 hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 font-medium text-[#1DB954]">
                      {d.title}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {d.vendor_shop?.business_name ??
                        d.seller?.email ??
                        "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {d.discounted_price}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {d.quantity_remaining}/{d.quantity_total}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          d.removed_by_admin
                            ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                            : d.is_active
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                        }`}
                      >
                        {d.removed_by_admin
                          ? "Removed"
                          : d.is_active
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DealDetailModal
        deal={selected}
        onClose={() => setSelected(null)}
        onUpdated={load}
      />
    </div>
  );
};

export default DealsPage;
