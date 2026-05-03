/** PostgREST select for admin deals list — adjust FK hints in Supabase if embed fails. */

export const DEAL_LIST_SELECT = `
  id,
  vendor_id,
  vendor_user_id,
  category_id,
  location_id,
  title,
  description,
  original_price,
  discounted_price,
  quantity_total,
  quantity_remaining,
  start_time,
  expiry_time,
  is_active,
  removed_by_admin,
  moderation_reason_code,
  created_at,
  updated_at,
  category:categories(name),
  location:locations(city, sub_city, country),
  vendor_shop:vendor_profiles!deals_vendor_user_id_fkey(business_name, user_id, account_status),
  seller:profiles!deals_vendor_id_fkey(email, full_name)
`;

export type DealRow = {
  id: string;
  vendor_id: string;
  vendor_user_id: string | null;
  title: string;
  description: string | null;
  original_price: number;
  discounted_price: number;
  quantity_total: number;
  quantity_remaining: number;
  start_time: string | null;
  expiry_time: string;
  is_active: boolean;
  removed_by_admin: boolean;
  moderation_reason_code: string | null;
  created_at: string;
  updated_at: string;
  category?: { name: string } | null;
  location?: { city?: string | null; sub_city?: string | null; country?: string | null } | null;
  vendor_shop?: {
    business_name: string;
    user_id: string;
    account_status?: string | null;
  } | null;
  seller?: { email: string; full_name?: string | null } | null;
};
