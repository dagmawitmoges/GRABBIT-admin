import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import {
  formatIssueType,
  subjectVendorBusinessName,
  type IssueStatus,
  type IssueType,
  type PlatformIssueRow,
  type VendorReviewRow,
  VENDOR_REVIEW_SELECT,
} from "../utils/issuesData";
import { adminUi } from "../constants/adminUi";

type Props = {
  issue: PlatformIssueRow | null;
  onClose: () => void;
  onSaved: () => void;
};

function formatDt(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function stars(n: number) {
  return "★".repeat(Math.min(5, Math.max(0, Math.round(n)))) + "☆".repeat(
    Math.max(0, 5 - Math.round(n))
  );
}

const IssueDetailModal = ({ issue, onClose, onSaved }: Props) => {
  const [status, setStatus] = useState<IssueStatus>("open");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [reviews, setReviews] = useState<VendorReviewRow[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsErr, setReviewsErr] = useState<string | null>(null);

  useEffect(() => {
    if (!issue) return;
    setStatus(issue.status);
    setAdminNotes(issue.admin_notes ?? "");
    setErr(null);
    setReviewsErr(null);
  }, [issue]);

  const loadReviews = useCallback(async (vendorUserId: string) => {
    setReviewsLoading(true);
    setReviewsErr(null);
    const { data, error } = await supabase
      .from("vendor_reviews")
      .select(VENDOR_REVIEW_SELECT)
      .eq("vendor_user_id", vendorUserId)
      .order("created_at", { ascending: false })
      .limit(100);

    setReviewsLoading(false);
    if (error) {
      setReviewsErr(error.message);
      setReviews([]);
      return;
    }
    setReviews((data ?? []) as unknown as VendorReviewRow[]);
  }, []);

  useEffect(() => {
    if (!issue?.subject_vendor_id) {
      setReviews([]);
      return;
    }
    void loadReviews(issue.subject_vendor_id);
  }, [issue?.subject_vendor_id, issue?.id, loadReviews]);

  if (!issue) return null;

  const biz = subjectVendorBusinessName(issue);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  const save = async () => {
    setSaving(true);
    setErr(null);

    const resolved =
      status === "resolved" || status === "dismissed"
        ? new Date().toISOString()
        : null;

    const { error } = await supabase
      .from("platform_issues")
      .update({
        status,
        admin_notes: adminNotes.trim() || null,
        resolved_at: resolved,
      })
      .eq("id", issue.id);

    setSaving(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
    >
      <div
        className={`${adminUi.card} relative max-h-[90vh] w-full max-w-xl overflow-y-auto shadow-xl`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {formatIssueType(issue.issue_type as IssueType)}
        </p>
        <h2
          id="issue-modal-title"
          className={`${adminUi.h1} mt-1 pr-10 text-lg sm:text-2xl`}
        >
          {issue.title}
        </h2>
        <p className={adminUi.subtitle}>Issue ID: {issue.id}</p>

        {err && (
          <div className={`${adminUi.globalError} my-4`} role="alert">
            {err}
          </div>
        )}

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Status
            </dt>
            <dd className="mt-1">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className={adminUi.select}
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </dd>
          </div>
          {issue.description && (
            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Description
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {issue.description}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Reporter
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {issue.reporter?.email ?? issue.reporter_id ?? "—"}
              {issue.reporter?.full_name
                ? ` · ${issue.reporter.full_name}`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Subject vendor
            </dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {biz ?? issue.subject_vendor?.email ?? "—"}
              {issue.subject_vendor_id && (
                <span className="ml-2 font-mono text-xs text-gray-500 dark:text-gray-400">
                  ({issue.subject_vendor_id})
                </span>
              )}
            </dd>
          </div>
          {issue.subject_deal_id && (
            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Related deal
              </dt>
              <dd className="font-mono text-xs text-gray-800 dark:text-gray-200">
                {issue.subject_deal_id}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Created
            </dt>
            <dd className="text-gray-800 dark:text-gray-200">
              {formatDt(issue.created_at)}
            </dd>
          </div>
        </dl>

        {issue.subject_vendor_id && (
          <section className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Reviews &amp; ratings
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Feedback left for this vendor (from{" "}
              <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">
                vendor_reviews
              </code>
              ).
            </p>
            {reviewsLoading ? (
              <p className="mt-3 text-sm text-gray-500">Loading reviews…</p>
            ) : reviewsErr ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {reviewsErr}
              </p>
            ) : reviews.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                No reviews yet for this vendor.
              </p>
            ) : (
              <>
                <p className="mt-3 text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-medium">Average:</span>{" "}
                  {avgRating != null ? avgRating.toFixed(2) : "—"} / 5{" "}
                  <span className="text-amber-500" aria-hidden>
                    {avgRating != null ? stars(avgRating) : ""}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {" "}
                    ({reviews.length} review{reviews.length === 1 ? "" : "s"})
                  </span>
                </p>
                <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800">
                  {reviews.map((r) => (
                    <li
                      key={r.id}
                      className="border-b border-gray-50 px-3 py-2 text-sm last:border-0 dark:border-gray-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          {r.rating}/5 {stars(r.rating)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDt(r.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {r.reviewer?.email ?? r.reviewer_id}
                        {r.reviewer?.full_name
                          ? ` · ${r.reviewer.full_name}`
                          : ""}
                      </p>
                      {r.comment && (
                        <p className="mt-1 text-gray-800 dark:text-gray-200">
                          {r.comment}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        <div className="mt-4">
          <label className={adminUi.label}>Admin notes</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className={adminUi.textarea}
            rows={3}
            placeholder="Internal notes (not shown to users)"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-6 dark:border-gray-800">
          <button type="button" onClick={onClose} className={adminUi.secondaryBtn}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className={adminUi.primaryBtn}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
