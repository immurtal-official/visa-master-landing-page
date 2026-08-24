import Link from "next/link";
import type { ReactNode } from "react";

type LegalSection = {
  id: string;
  label: string;
};

export function LegalPage({
  eyebrow,
  title,
  summary,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSection[];
  children: ReactNode;
}) {
  return (
    <main className="site legal-page">
      <header className="legal-header">
        <Link className="legal-brand" href="/" aria-label="Visa Master home">
          visa<span>master</span>
        </Link>
        <nav aria-label="Legal pages">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </header>

      <div className="legal-shell">
        <aside className="legal-sidebar">
          <span className="legal-eyebrow">{eyebrow}</span>
          <nav aria-label="On this page">
            <p>On this page</p>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>{section.label}</a>
            ))}
          </nav>
        </aside>

        <article className="legal-document">
          <header className="legal-title">
            <span className="legal-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{summary}</p>
            <time dateTime="2026-08-24">Effective August 24, 2026</time>
          </header>
          {children}
        </article>
      </div>

      <footer className="legal-footer">
        <span>Visa Master is a Lüya product.</span>
        <Link href="/">Return home</Link>
      </footer>
    </main>
  );
}
