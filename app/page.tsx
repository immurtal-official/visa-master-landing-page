import { LandingPage } from "@/components/landing-page";
import { displayNameFromMetadata } from "@/lib/auth/display-name";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const initialViewer = !error && data?.claims.sub
    ? { displayName: displayNameFromMetadata(data.claims.user_metadata ?? {}) }
    : null;

  return <LandingPage initialViewer={initialViewer} />;
}
