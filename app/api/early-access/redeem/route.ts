import { NextResponse } from "next/server";

import {
  digestInvitePhrase,
  digestIpAddress,
  isValidEmail,
  normalizeEmail,
  normalizeInvitePhrase,
  requestIp,
} from "@/lib/early-access/security";
import { createAdminClient } from "@/lib/supabase/admin";

type RedemptionResult = {
  status?: "authorized" | "invalid" | "rate_limited";
  attempts_remaining?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; phrase?: unknown };
    const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
    const phrase = normalizeInvitePhrase(typeof body.phrase === "string" ? body.phrase : "");

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!phrase || phrase.length > 160) {
      return NextResponse.json(
        { error: "That invite phrase is not recognized." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("redeem_invite_phrase", {
      p_email: email,
      p_ip_digest: digestIpAddress(requestIp(request)),
      p_phrase_digest: digestInvitePhrase(phrase),
    });

    if (error) throw error;

    const result = (data ?? {}) as RedemptionResult;

    if (result.status === "rate_limited") {
      return NextResponse.json(
        { error: "Too many failed attempts. Try again in 24 hours." },
        { status: 429 },
      );
    }

    if (result.status !== "authorized") {
      return NextResponse.json(
        {
          error: "That invite phrase is not recognized.",
          attemptsRemaining: result.attempts_remaining,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ status: "authorized", email });
  } catch (error) {
    console.error("Unable to redeem an invite phrase", error);
    return NextResponse.json(
      { error: "We couldn’t check that phrase. Please try again." },
      { status: 500 },
    );
  }
}
