import { NextResponse, type NextRequest } from "next/server";

import { displayNameFromMetadata } from "@/lib/auth/display-name";
import { safeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (tokenHash && type === "email") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (!error) {
      const { data: userData } = await supabase.auth.getUser();

      if (userData.user && !displayNameFromMetadata(userData.user.user_metadata)) {
        const onboardingUrl = new URL("/onboarding/profile", request.url);
        onboardingUrl.searchParams.set("next", next);
        return NextResponse.redirect(onboardingUrl, 303);
      }

      return NextResponse.redirect(new URL(next, request.url), 303);
    }
  }

  const errorUrl = new URL("/auth/error", request.url);
  errorUrl.searchParams.set("next", next);
  return NextResponse.redirect(errorUrl, 303);
}
