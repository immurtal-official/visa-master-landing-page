import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <main className="site utility-page">
      <section className="utility-card">
        <span className="utility-kicker">ACCOUNT SECURITY</span>
        <h1>Choose a new password.</h1>
        <p>Use at least eight characters. Your existing application data will stay unchanged.</p>
        <UpdatePasswordForm />
      </section>
    </main>
  );
}
