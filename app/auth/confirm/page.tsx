import { redirect } from "next/navigation";

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

  if (!tokenHash || type !== "email") {
    redirect(`/auth/error?next=${encodeURIComponent(next)}`);
  }

  return (
    <main className="site utility-page">
      <section className="utility-card">
        <span className="utility-kicker">EMAIL CONFIRMATION</span>
        <h1>Confirm your email.</h1>
        <p>Finish creating your Visa Master workspace by confirming this email address.</p>
        <form className="utility-actions" action="/auth/confirm/complete" method="post">
          <input name="token_hash" type="hidden" value={tokenHash} />
          <input name="type" type="hidden" value="email" />
          <input name="next" type="hidden" value={next} />
          <button className="utility-primary" type="submit">Confirm email</button>
        </form>
      </section>
    </main>
  );
}
