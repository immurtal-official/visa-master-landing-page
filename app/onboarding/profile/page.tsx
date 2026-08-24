import Link from "next/link";
import { redirect } from "next/navigation";

import { UsernameForm } from "@/components/auth/username-form";
import { displayNameFromMetadata } from "@/lib/auth/display-name";
import { safeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function suggestedUsername(email: string | undefined, metadata: Record<string, unknown>) {
  const candidate = [metadata.preferred_username, metadata.user_name, metadata.username, email?.split("@")[0]]
    .find((value): value is string => typeof value === "string" && value.length > 0);

  if (!candidate) return "";

  const normalized = candidate
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^[^a-z]+/, "")
    .slice(0, 24);

  return normalized.length >= 3 ? normalized : "";
}

export default async function ProfileOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const requestedNext = safeNextPath(params.next ?? null);
  const next = requestedNext.startsWith("/onboarding/profile") ? "/workspace" : requestedNext;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect(`/login?next=${encodeURIComponent(`/onboarding/profile?next=${encodeURIComponent(next)}`)}`);
  }

  if (displayNameFromMetadata(data.user.user_metadata)) redirect(next);

  return (
    <main className="site utility-page profile-page">
      <section className="utility-card profile-card">
        <Link className="utility-brand" href="/">visa<span>master</span></Link>
        <span className="utility-kicker">ONE LAST STEP</span>
        <h1>Choose your username.</h1>
        <p>This is how Visa Master will address you in your private workspace.</p>
        <UsernameForm
          initialUsername={suggestedUsername(data.user.email, data.user.user_metadata)}
          next={next}
        />
      </section>
    </main>
  );
}
