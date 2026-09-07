import { redirect } from "next/navigation";
import { DemoWorkspacePage } from "@/components/demo/workspace-page";
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

  return <DemoWorkspacePage viewer={{ displayName }} />;
}
