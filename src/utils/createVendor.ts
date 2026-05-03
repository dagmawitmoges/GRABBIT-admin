import { supabase } from "./supabase";

/** PostgREST / Storage errors include useful detail in the JSON body — surface them in the UI. */
function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    const parts = [o.message, o.details, o.hint].filter(
      (x): x is string => typeof x === "string" && x.length > 0
    );
    if (parts.length) return parts.join(" — ");
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export type BranchInput = {
  sub_city: string;
  city: string;
  country: string;
  address_detail: string;
};

export type DocumentInput = {
  file: File;
  document_type: string;
};

export type CreateVendorPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  profile_phone: string;
  is_verified: boolean;
  business_name: string;
  business_description: string | null;
  vendor_phone: string;
  tin: string | null;
  branches: BranchInput[];
  documents: DocumentInput[];
};

async function uploadVendorFile(file: File): Promise<string> {
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}_${file.name.replace(/[^\w.\-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage
    .from("vendor-certificates")
    .upload(safeName, file);

  if (uploadError)
    throw new Error(`Storage upload: ${errMsg(uploadError, uploadError.message)}`);

  const { data: urlData } = supabase.storage
    .from("vendor-certificates")
    .getPublicUrl(safeName);

  return urlData.publicUrl;
}

export async function createVendorWithAuth(
  payload: CreateVendorPayload
): Promise<void> {
  const {
    data: { session: adminSession },
  } = await supabase.auth.getSession();
  if (!adminSession) throw new Error("Session expired. Log in again.");

  const uploadedDocs: { file_url: string; document_type: string | null }[] =
    [];
  for (const doc of payload.documents) {
    const url = await uploadVendorFile(doc.file);
    const t = doc.document_type.trim();
    uploadedDocs.push({
      file_url: url,
      document_type: t || null,
    });
  }

  const full_name = [payload.first_name, payload.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
    options: {
      data: {
        full_name: full_name || undefined,
        // Triggers on auth.users (e.g. public.users mirror) may read role from metadata.
        role: "VENDOR",
      },
    },
  });

  if (signUpError)
    throw new Error(`Sign up: ${errMsg(signUpError, signUpError.message)}`);

  const newUser = signUpData.user;
  if (!newUser?.id) {
    throw new Error(
      "User was not returned (check Auth email confirmation settings)."
    );
  }

  const userId = newUser.id;

  const locationRows = payload.branches.map((b, i) => ({
    sub_city: b.sub_city.trim() || null,
    city: b.city.trim(),
    country: b.country.trim(),
    sort_order: i,
  }));

  const { data: insertedLocs, error: locErr } = await supabase
    .from("locations")
    .insert(locationRows)
    .select("id");

  if (locErr) throw new Error(`Locations: ${errMsg(locErr, locErr.message)}`);
  if (!insertedLocs?.length) throw new Error("Could not create locations.");

  const primaryLocationId = insertedLocs[0]!.id;

  const locationSummary = payload.branches
    .map((b) =>
      [b.sub_city?.trim(), b.city?.trim(), b.country?.trim()]
        .filter(Boolean)
        .join(", ")
    )
    .filter(Boolean)
    .join(" · ");

  // full_name is a generated column — only set first_name / last_name.
  // Upsert: a DB trigger may insert a stub profile first; always force role VENDOR for admin-created vendors.
  const { error: pErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: payload.email.trim(),
      first_name: payload.first_name.trim() || null,
      last_name: payload.last_name.trim() || null,
      phone: payload.profile_phone.trim(),
      role: "VENDOR",
      is_verified: payload.is_verified,
      location_id: primaryLocationId,
    },
    { onConflict: "id" }
  );
  if (pErr) throw new Error(`Profile: ${errMsg(pErr, pErr.message)}`);

  const { error: vErr } = await supabase.from("vendor_profiles").insert({
    user_id: userId,
    business_name: payload.business_name.trim(),
    business_description: payload.business_description?.trim() || null,
    phone: payload.vendor_phone.trim(),
    location: locationSummary || null,
    tin: payload.tin?.trim() || null,
    certificate_file_path: uploadedDocs[0]?.file_url ?? null,
    account_status: "active",
  });
  if (vErr) throw new Error(`Vendor profile: ${errMsg(vErr, vErr.message)}`);

  const branchInserts = insertedLocs.map((loc, i) => ({
    vendor_user_id: userId,
    location_id: loc.id,
    address_detail: payload.branches[i]!.address_detail.trim() || null,
  }));

  const { error: bErr } = await supabase
    .from("vendor_branches")
    .insert(branchInserts);
  if (bErr) throw new Error(`Branches: ${errMsg(bErr, bErr.message)}`);

  if (uploadedDocs.length > 0) {
    const docRows = uploadedDocs.map((d) => ({
      vendor_user_id: userId,
      document_type: d.document_type,
      file_url: d.file_url,
    }));
    const { error: dErr } = await supabase
      .from("vendor_documents")
      .insert(docRows);
    if (dErr) throw new Error(`Documents: ${errMsg(dErr, dErr.message)}`);
  }

  const { error: sessionErr } = await supabase.auth.setSession({
    access_token: adminSession.access_token,
    refresh_token: adminSession.refresh_token,
  });
  if (sessionErr)
    throw new Error(`Restore session: ${errMsg(sessionErr, sessionErr.message)}`);
}
