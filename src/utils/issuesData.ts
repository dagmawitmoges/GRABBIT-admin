/** PostgREST selects for Issues / admin queue. Adjust FK hints if embed errors. */

export const PLATFORM_ISSUE_LIST_SELECT = `
  id,
  issue_type,
  status,
  title,
  description,
  reporter_id,
  subject_vendor_id,
  subject_deal_id,
  metadata,
  admin_notes,
  created_at,
  updated_at,
  resolved_at,
  subject_vendor:profiles!platform_issues_subject_vendor_id_fkey(
    id,
    email,
    full_name,
    vendor_profiles(business_name)
  ),
  reporter:profiles!platform_issues_reporter_id_fkey(email, full_name)
`;

export type IssueType =
  | "vendor_onboarding"
  | "order_dispute"
  | "reported_listing"
  | "account_abuse"
  | "payment"
  | "other";

export type IssueStatus = "open" | "in_progress" | "resolved" | "dismissed";

export type PlatformIssueRow = {
  id: string;
  issue_type: IssueType;
  status: IssueStatus;
  title: string;
  description: string | null;
  reporter_id: string | null;
  subject_vendor_id: string | null;
  subject_deal_id: string | null;
  metadata: Record<string, unknown>;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  subject_vendor?: {
    id: string;
    email?: string | null;
    full_name?: string | null;
    vendor_profiles?: { business_name: string } | { business_name: string }[] | null;
  } | null;
  reporter?: { email?: string | null; full_name?: string | null } | null;
};

export const VENDOR_REVIEW_SELECT = `
  id,
  vendor_user_id,
  reviewer_id,
  deal_id,
  rating,
  comment,
  created_at,
  reviewer:profiles!vendor_reviews_reviewer_id_fkey(email, full_name)
`;

export type VendorReviewRow = {
  id: string;
  vendor_user_id: string;
  reviewer_id: string;
  deal_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: { email?: string | null; full_name?: string | null } | null;
};

/** PostgREST may return embedded FK rows as object or single-element array. */
export function normalizeIssueRow(
  raw: PlatformIssueRow
): PlatformIssueRow {
  const sv = raw.subject_vendor as unknown;
  const subject_vendor = Array.isArray(sv)
    ? ((sv[0] as PlatformIssueRow["subject_vendor"]) ?? null)
    : (raw.subject_vendor ?? null);
  const rep = raw.reporter as unknown;
  const reporter = Array.isArray(rep)
    ? ((rep[0] as PlatformIssueRow["reporter"]) ?? null)
    : (raw.reporter ?? null);
  return { ...raw, subject_vendor, reporter };
}

export function subjectVendorBusinessName(
  row: PlatformIssueRow
): string | null {
  const vp = row.subject_vendor?.vendor_profiles;
  if (!vp) return null;
  const o = Array.isArray(vp) ? vp[0] : vp;
  return o?.business_name ?? null;
}

export function formatIssueType(t: IssueType): string {
  const labels: Record<IssueType, string> = {
    vendor_onboarding: "Vendor onboarding",
    order_dispute: "Order dispute",
    reported_listing: "Reported listing",
    account_abuse: "Account abuse",
    payment: "Payment",
    other: "Other",
  };
  return labels[t] ?? t;
}
