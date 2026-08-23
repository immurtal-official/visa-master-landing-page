import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "./config";

export function createAdminClient() {
  const { url } = getSupabaseConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    throw new Error(
      "Supabase admin access is not configured. Add SUPABASE_SECRET_KEY to the server environment.",
    );
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
