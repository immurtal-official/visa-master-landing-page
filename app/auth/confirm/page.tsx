import Link from "next/link";
import { redirect } from "next/navigation";

import { UsernameForm } from "@/components/auth/username-form";
import { safeNextPath } from "@/lib/auth/redirect";

function singleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tokenHash = singleValue(params.token_hash);
  const type = singleValue(params.type);
  const next = safeNextPath(singleValue(params.next) ?? null);
  const error = singleValue(params.error) === "invalid_username"
    ? "Use 3–24 characters, starting with a letter. Only letters, numbers, and underscores are allowed."
    : undefined;

  if (!tokenHash || type !== "email") {
    redirect(`/auth/error?next=${encodeURIComponent(next)}`);
  }

  return (
    <main className="site utility-page profile-page">
      <section className="utility-card profile-card">
        <Link className="utility-brand" href="/">visa<span>master</span></Link>
        <span className="utility-kicker">EMAIL CONFIRMATION</span>
        <h1>Choose your username.</h1>
        <p>Confirm your email and choose how Visa Master will address you in your private workspace.</p>
        <UsernameForm
          initialUsername=""
          next={next}
          confirmation={{ tokenHash, error }}
        />
      </section>
    </main>
  );
}
