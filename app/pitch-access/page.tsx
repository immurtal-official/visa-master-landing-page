import type { Metadata } from "next";
import Link from "next/link";

import { pitchNextPath } from "@/lib/pitch-access";

export const metadata: Metadata = {
  title: "Pitch access | Visa Master",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  invalid: "That password is not correct. 密码不正确，请再试一次。",
  unavailable:
    "Pitch access has not been set up on this deployment yet. 这个站点还没有设置访问密码。",
};

export default async function PitchAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = pitchNextPath(params.next);
  const message = params.error ? MESSAGES[params.error] : undefined;

  return (
    <main className="site utility-page">
      <section className="utility-card auth-page-card">
        <Link className="utility-brand" href="/">visa<span>master</span></Link>
        <span className="utility-kicker">PITCH · 路演材料</span>
        <h1>Enter the password to view the pitch.</h1>
        <p>请输入访问密码，查看路演材料。</p>
        <form className="auth-form" method="post" action="/api/pitch-access">
          <input type="hidden" name="next" value={next} />
          <label>
            <span>Password · 密码</span>
            <input name="password" type="password" autoComplete="current-password" required autoFocus />
          </label>
          {message && <p className="auth-feedback error" role="alert">{message}</p>}
          <button className="email-button" type="submit">View the pitch · 查看</button>
        </form>
      </section>
    </main>
  );
}
