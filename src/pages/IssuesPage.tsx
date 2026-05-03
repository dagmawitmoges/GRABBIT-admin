import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { adminUi } from "../constants/adminUi";
import IssueDetailModal from "../components/IssueDetailModal";
import {
  formatIssueType,
  normalizeIssueRow,
  PLATFORM_ISSUE_LIST_SELECT,
  subjectVendorBusinessName,
  type IssueStatus,
  type IssueType,
  type PlatformIssueRow,
} from "../utils/issuesData";

type PendingRow = {
  id: string;
  email: string;
  full_name?: string | null;
  vendor_profile?: {
    business_name: string;
    tin?: string | null;
    phone?: string | null;
  } | null;
};

type TabId = "queue" | "onboarding";

const IssuesPage = () => {
  const [tab, setTab] = useState<TabId>("queue");

  const [issues, setIssues] = useState<PlatformIssueRow[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<PlatformIssueRow | null>(
    null
  );

  const [requests, setRequests] = useState<PendingRow[]>([]);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  const fetchIssues = useCallback(async () => {
    setIssuesLoading(true);
    setIssuesError(null);

    const { data, error } = await supabase
      .from("platform_issues")
      .select(PLATFORM_ISSUE_LIST_SELECT)
      .in("status", ["open", "in_progress"] as IssueStatus[])
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("platform_issues:", error.message);
      setIssues([]);
      setIssuesError(
        error.message.includes("does not exist") ||
          error.code === "42P01"
          ? "Run the database migration that creates platform_issues (see supabase/migrations)."
          : error.message
      );
    } else {
      setIssues((data ?? []) as unknown as PlatformIssueRow[]);
    }

    setIssuesLoading(false);
  }, []);

  const fetchRequests = useCallback(async () => {
    setOnboardingLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        full_name,
        vendor_profiles(business_name, tin, phone)
      `
      )
      .eq("role", "VENDOR")
      .eq("is_verified", false);

    if (error) {
      console.error("Supabase error:", error.message);
      setRequests([]);
    } else {
      const rows =
        (data || []).map((row: Record<string, unknown>) => {
          const vpRaw = row.vendor_profiles;
          const vp = Array.isArray(vpRaw) ? vpRaw[0] : vpRaw;
          return {
            id: row.id as string,
            email: row.email as string,
            full_name: row.full_name as string | null | undefined,
            vendor_profile: (vp as PendingRow["vendor_profile"]) ?? null,
          } as PendingRow;
        }) ?? [];
      setRequests(rows);
    }

    setOnboardingLoading(false);
  }, []);

  useEffect(() => {
    void fetchIssues();
    void fetchRequests();
  }, [fetchIssues, fetchRequests]);

  const approveVendor = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true })
      .eq("id", id);

    if (!error) void fetchRequests();
  };

  const rejectVendor = async (id: string) => {
    await supabase.from("vendor_profiles").delete().eq("user_id", id);
    const { error } = await supabase
      .from("profiles")
      .update({ role: "CUSTOMER" })
      .eq("id", id);

    if (!error) void fetchRequests();
  };

  const tabBtn = (id: TabId, label: string, count?: number) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        tab === id
          ? "bg-[#1DB954] text-white shadow-sm"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      }`}
    >
      {label}
      {count != null ? (
        <span
          className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
            tab === id
              ? "bg-white/20 text-white"
              : "bg-gray-200 dark:bg-gray-600"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );

  return (
    <div className={adminUi.content}>
      <h1 className={adminUi.h1}>Issues</h1>
      <p className={adminUi.subtitle}>
        Action queue from the database and pending vendor onboarding.
      </p>

      <div className={`${adminUi.toolbarRow} mt-6 gap-2`}>
        {tabBtn("queue", "Action queue", issues.length)}
        {tabBtn("onboarding", "Vendor onboarding", requests.length)}
      </div>

      {tab === "queue" && (
        <div className="mt-6">
          {issuesError && (
            <div
              className={`${adminUi.globalError} mb-4`}
              role="alert"
            >
              {issuesError}
            </div>
          )}

          <div className={`${adminUi.card} p-0 overflow-x-auto`}>
            {issuesLoading ? (
              <Empty icon="⏳" text="Loading issues…" />
            ) : issues.length === 0 ? (
              <Empty
                icon="✅"
                text="No open issues. Rows appear when users report problems (platform_issues) or you insert test data in SQL."
              />
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((row) => (
                    <tr
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setSelectedIssue(normalizeIssueRow(row))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedIssue(normalizeIssueRow(row));
                      }}
                      className="cursor-pointer border-b border-gray-100 hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {formatIssueType(row.issue_type as IssueType)}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1DB954]">
                        {row.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {subjectVendorBusinessName(row) ??
                          row.subject_vendor?.email ??
                          "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.status === "open"
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                              : "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Click a row to update status, add admin notes, and view vendor
            reviews/ratings when a subject vendor is linked.
          </p>
        </div>
      )}

      {tab === "onboarding" && (
        <div className="mt-6">
          <div className={`${adminUi.card} p-0 overflow-x-auto`}>
            {onboardingLoading ? (
              <Empty icon="⏳" text="Loading requests…" />
            ) : requests.length === 0 ? (
              <Empty icon="👥" text="No pending vendor requests" />
            ) : (
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    {["Business", "Owner", "Email", "Phone", "TIN", "Actions"].map(
                      (h) => (
                        <th key={h} className="px-4 py-3">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="px-4 py-3">
                        {r.vendor_profile?.business_name ?? "—"}
                      </td>
                      <td className="px-4 py-3">{r.full_name ?? "—"}</td>
                      <td className="px-4 py-3">{r.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        {r.vendor_profile?.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.vendor_profile?.tin ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void approveVendor(r.id)}
                            className={adminUi.primaryBtnSm}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => void rejectVendor(r.id)}
                            className={adminUi.dangerBtnSm}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onSaved={fetchIssues}
      />
    </div>
  );
};

const Empty = ({ icon, text }: { icon: string; text: string }) => (
  <div className="p-12 text-center text-sm text-gray-600 dark:text-gray-400">
    <div className="mb-2 text-3xl">{icon}</div>
    {text}
  </div>
);

export default IssuesPage;
