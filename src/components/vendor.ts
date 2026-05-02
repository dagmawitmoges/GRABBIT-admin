// src/types/vendor.ts
export type VendorStatus = "active" | "blocked";

export type Vendor = {
  id: string;
  business_name: string;
  owner_name?: string; // optional everywhere
  status: VendorStatus;

  phone?: string;
  contact_phone?: string;
  address?: string;
  location?: string;
  tin?: string;
  business_type?: string;
  email?: string;

  user?: {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
  };
};
