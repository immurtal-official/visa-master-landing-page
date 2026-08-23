import { redirect } from "next/navigation";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { displayNameFromMetadata } from "@/lib/auth/display-name";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/login?next=/workspace");

  const displayName = displayNameFromMetadata(data.user.user_metadata);
  if (!displayName) {
    redirect("/onboarding/profile?next=/workspace");
  }

  return (
    <main className="site utility-page workspace-page">
      <section className="utility-card workspace-card">
        <span className="utility-kicker">VISA MASTER WORKSPACE</span>
        <h1>Your workspace is ready for the next step.</h1>
        <p>Welcome, <strong>{displayName}</strong>. Case creation and the guided visa workflow will connect here next.</p>
        <div className="workspace-status">
          <span>01</span>
          <div><strong>Account connected</strong><small>Your session is protected by Supabase Auth.</small></div>
          <b>Ready</b>
        </div>
        <div className="utility-actions">
          <Link className="utility-primary" href="/">Return to landing page</Link>
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
