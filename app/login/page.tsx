import Link from "next/link";

import { AuthPanel } from "@/components/auth/auth-panel";
import { safeNextPath } from "@/lib/auth/redirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next ?? null);

  return (
    <main className="site utility-page">
      <section className="utility-card auth-page-card">
        <Link className="utility-brand" href="/">visa<span>master</span></Link>
        <span className="utility-kicker">YOUR VISA WORKSPACE</span>
        <h1>Pick up where you left off.</h1>
        <p>Sign in to keep your application plan, evidence, and generated documents together.</p>
        <AuthPanel next={next} />
      </section>
    </main>
  );
}
