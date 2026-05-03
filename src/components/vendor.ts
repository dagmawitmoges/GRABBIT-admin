// Aligned with Supabase: public.vendor_profiles + public.profiles
// verificationStatus maps profiles.is_verified
// accountStatus maps vendor_profiles.account_status (posting / orders lock)
export type VendorVerificationStatus = "active" | "pending";
export type VendorAccountStatus = "active" | "suspended" | "banned";

/** @deprecated use VendorVerificationStatus — kept as alias for table filters */
export type VendorStatus = VendorVerificationStatus;

export type Vendor = {
  id: string; // profiles.id / auth user id (vendor_profiles.user_id)
  business_name: string;
  owner_name?: string;
  /** Verified onboarding (profiles.is_verified) */
  status: VendorVerificationStatus;
  /** Posting deals & accepting orders (vendor_profiles.account_status) */
  accountStatus: VendorAccountStatus;

  phone?: string;
  location?: string;
  tin?: string;
  business_description?: string;
  certificate_file_path?: string;

  user?: {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
  };
};
