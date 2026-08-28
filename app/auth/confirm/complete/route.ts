import { NextResponse, type NextRequest } from "next/server";

import { isValidUsername, normalizeUsername } from "@/lib/auth/display-name";
import { safeNextPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

function confirmationUrl(request: NextRequest, tokenHash: string, next: string) {
  const url = new URL("/auth/confirm", request.url);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", "email");
  url.searchParams.set("next", next);
  url.searchParams.set("error", "invalid_username");
  return url;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));
  const username = normalizeUsername(String(formData.get("username") ?? ""));

  if (tokenHash && type === "email" && !isValidUsername(username)) {
    return NextResponse.redirect(confirmationUrl(request, tokenHash, next), 303);
  }

  if (tokenHash && type === "email") {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (!error && data.user) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: username, username },
      });

      if (updateError) {
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
