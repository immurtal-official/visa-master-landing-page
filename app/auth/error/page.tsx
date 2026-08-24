import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="site utility-page">
      <section className="utility-card">
        <span className="utility-kicker">SIGN-IN INTERRUPTED</span>
        <h1>We could not finish signing you in.</h1>
        <p>The link may have expired or the provider may not be configured yet. Try signing in again.</p>
        <Link className="utility-primary" href="/login">Back to sign in</Link>
      </section>
    </main>
  );
}
