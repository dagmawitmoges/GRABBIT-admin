import type {
  Vendor,
  VendorAccountStatus,
  VendorVerificationStatus,
} from "../components/vendor";

/** PostgREST embed: vendor_profiles.user_id → profiles.id */
export const VENDOR_PROFILE_SELECT = `
  *,
  profile:profiles!vendor_profiles_user_id_fkey(
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    role,
    is_verified
  )
`;

export function verificationToStatus(
  isVerified: boolean | null | undefined
): VendorVerificationStatus {
  return isVerified ? "active" : "pending";
}

function normalizeAccountStatus(raw: string | null | undefined): VendorAccountStatus {
  if (raw === "suspended" || raw === "banned") return raw;
  return "active";
}

export function mapVendorProfileRow(row: any): Vendor {
  const p = row.profile;
  const owner =
    p?.full_name?.trim() ||
    [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() ||
    "";

  return {
    id: row.user_id,
    business_name: row.business_name ?? "",
    owner_name: owner || undefined,
    status: verificationToStatus(p?.is_verified),
    accountStatus: normalizeAccountStatus(row.account_status),
    phone: row.phone ?? undefined,
    location: row.location ?? undefined,
    tin: row.tin ?? undefined,
    business_description: row.business_description ?? undefined,
    certificate_file_path: row.certificate_file_path ?? undefined,
    user: p
      ? {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          phone: p.phone,
        }
      : undefined,
  };
}
