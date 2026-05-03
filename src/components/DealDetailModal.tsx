import { useState } from "react";
import { supabase } from "../utils/supabase";
import type { DealRow } from "../utils/dealsData";
import { adminUi } from "../constants/adminUi";

type Props = {
  deal: DealRow | null;
  onClose: () => void;
  onUpdated: () => void;
};

function formatMoney(n: number) {
  return typeof n === "number" ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—";
}

function formatDt(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const DealDetailModal = ({ deal, onClose, onUpdated }: Props) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!deal) return null;

  const loc = deal.location;
  const locLabel = loc
    ? [loc.sub_city, loc.city, loc.country].filter(Boolean).join(", ")
    : "—";

  const cancelDeal = async () => {
    if (
      !confirm(
        "Cancel this deal? It will be hidden and marked as removed by admin. The vendor cannot use it for new orders."
      )
    )
      return;

    setBusy(true);
    setErr(null);

    const { error } = await supabase
      .from("deals")
      .update({
        is_active: false,
        removed_by_admin: true,
        moderation_reason_code: "admin_cancelled",
      })
      .eq("id", deal.id);

    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    onUpdated();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-modal-title"
    >
      <div
        className={`${adminUi.card} relative max-h-[90vh] max-w-lg overflow-y-auto shadow-xl`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 id="deal-modal-title" className={`${adminUi.h1} pr-10`}>
          {deal.title}
        </h2>
        <p className={adminUi.subtitle}>Deal ID: {deal.id}</p>

        {err && (
          <div className={`${adminUi.globalError} my-4`} role="alert">
            {err}
          </div>
        )}

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Vendor shop
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {deal.vendor_shop?.business_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Seller contact
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {deal.seller?.email ?? "—"}
              {deal.seller?.full_name
                ? ` · ${deal.seller.full_name}`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Category
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {deal.category?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Location
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">{locLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Prices
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {formatMoney(deal.original_price)} → {formatMoney(deal.discounted_price)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Quantity
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {deal.quantity_remaining} / {deal.quantity_total} remaining
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Schedule
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">
              Start {formatDt(deal.start_time)}
              <br />
              Expires {formatDt(deal.expiry_time)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Status
            </dt>
            <dd className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  deal.is_active
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {deal.is_active ? "Active listing" : "Inactive"}
              </span>
              {deal.removed_by_admin && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200">
                  Removed by admin
                </span>
              )}
            </dd>
          </div>
          {deal.description && (
            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Description
              </dt>
              <dd className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {deal.description}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-6 dark:border-gray-800">
          <button type="button" onClick={onClose} className={adminUi.secondaryBtn}>
            Close
          </button>
          {deal.is_active && !deal.removed_by_admin && (
            <button
              type="button"
              onClick={cancelDeal}
              disabled={busy}
              className={adminUi.dangerBtnSm}
            >
              {busy ? "Cancelling…" : "Cancel deal"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetailModal;
