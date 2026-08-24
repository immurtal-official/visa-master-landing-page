import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Visa Master",
  description: "How Visa Master collects, uses, stores, and shares personal information.",
};

const sections = [
  { id: "scope", label: "Scope and current beta" },
  { id: "data", label: "Information we collect" },
  { id: "use", label: "How we use information" },
  { id: "google", label: "Google sign-in data" },
  { id: "ai", label: "AI-assisted features" },
  { id: "bases", label: "Legal bases" },
  { id: "sharing", label: "How information is shared" },
  { id: "retention", label: "Retention and security" },
  { id: "rights", label: "Your rights and choices" },
  { id: "children", label: "Children and other applicants" },
  { id: "changes", label: "Changes and contact" },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="PRIVACY POLICY"
      title="Privacy Policy"
      summary="This policy describes how Visa Master collects, uses, stores, and shares personal information. It applies to our public website, private-beta access, accounts, and the Visa Master workspace as its features become available."
      sections={sections}
    >
      <section id="scope">
        <h2>1. Scope and current beta</h2>
        <p>Visa Master is a private technology service designed to guide people through visa preparation. In this policy, “Visa Master,” “we,” and “us” mean the team operating Visa Master, a Lüya product. You can contact us at <a href="mailto:askluya@gmail.com">askluya@gmail.com</a>.</p>
        <p>Our current private beta provides a public product demonstration, a waitlist and invite flow, account authentication, display-name onboarding, and an early workspace. The demonstration shows example routes and documents; it does not yet collect or persist visa Case documents, submit applications, or send information to visa-issuing or border authorities.</p>
        <div className="legal-note"><strong>Before that changes:</strong> if we enable features that collect passport copies, evidence, application answers, or other Case information, we will update this policy and provide relevant notice before collecting that information.</div>
      </section>

      <section id="data">
        <h2>2. Information we collect</h2>
        <h3>Information you provide now</h3>
        <ul>
          <li><strong>Account information:</strong> your email address, password credentials handled by our authentication provider, display name, and sign-in method.</li>
          <li><strong>Early-access information:</strong> your email address, waitlist status, invite redemption status, and the invite phrase you submit for validation.</li>
          <li><strong>Communications:</strong> information you include when you contact us, report a problem, or send feedback.</li>
        </ul>
        <h3>Information collected automatically</h3>
        <p>We receive limited technical information needed to run and protect the service, such as IP address, browser or device information, request timestamps, authentication session data, and security events. For example, we use IP addresses to enforce the private-beta limit on failed invite attempts. The landing page currently loads destination photographs from third-party image hosts, which may receive ordinary request information such as your IP address and browser headers.</p>
        <h3>Information future Case features may require</h3>
        <p>A visa workflow may require identity and contact details; passport and nationality information; travel history and plans; family, education, and employment information; financial evidence; photographs; application answers; and supporting documents. Some destinations may require information that local law treats as sensitive. We will collect only what the selected workflow needs and will explain any materially different use at the point of collection.</p>
      </section>

      <section id="use">
        <h2>3. How we use information</h2>
        <p>We use personal information to provide and secure accounts; operate the waitlist and invitation system; remember authenticated sessions; personalize the workspace; respond to support requests; diagnose failures; prevent fraud and abuse; comply with law; and improve the reliability and usability of Visa Master.</p>
        <p>When Case features become available, we may use the information you provide to organize evidence, compare it with official requirements, prepare draft documents and checklists, and guide you through the actions you choose to take. We will not submit an application, make a payment, or send your information to an authority unless a feature clearly explains that action and you authorize it.</p>
      </section>

      <section id="google">
        <h2>4. Google sign-in data</h2>
        <p>If you choose “Sign in with Google,” Google provides Visa Master with the basic account information you approve, currently your email address, name, profile image, and identifiers needed to connect the sign-in to your Visa Master account. We use this information only to authenticate you, protect your session, create or connect your account, and display your chosen name.</p>
        <p>Visa Master does not request access to your Gmail, Google Drive, contacts, calendar, or other Google content. We do not sell Google user data, use it for advertising, or use it to train AI models. You can remove Visa Master’s access from your Google Account settings; doing so does not automatically delete information already stored in your Visa Master account, so contact us if you also want that information deleted.</p>
      </section>

      <section id="ai">
        <h2>5. AI-assisted features</h2>
        <p>Visa Master is being designed to use automated and AI-assisted tools to research requirements, organize information, and draft application materials. These tools support your work; they do not decide whether you receive a visa and they do not replace your review or a visa-issuing authority’s decision.</p>
        <p>The current landing-page demonstration does not send visa Case documents to an AI provider. Before a production feature sends personal information to an AI or document-processing provider, we will identify the relevant processing, limit it to providing the feature, and update this policy where necessary. Visa Master does not make decisions with legal or similarly significant effects based solely on automated processing.</p>
      </section>

      <section id="bases">
        <h2>6. Legal bases for processing</h2>
        <p>Where laws such as the UK GDPR or EU GDPR apply, our legal basis depends on the activity:</p>
        <ul>
          <li><strong>Contract:</strong> to create your account and provide features you request.</li>
          <li><strong>Legitimate interests:</strong> to secure, maintain, troubleshoot, and improve the service, provided those interests are not overridden by your rights.</li>
          <li><strong>Consent:</strong> where we ask for an optional use or where the law requires consent. You may withdraw it at any time.</li>
          <li><strong>Legal obligation:</strong> where we must retain or disclose information to comply with law.</li>
        </ul>
        <p>If information is required to provide an account or requested feature, not providing it may mean that feature cannot work.</p>
      </section>

      <section id="sharing">
        <h2>7. How information is shared</h2>
        <p>We share information only as needed to operate Visa Master, follow your instructions, protect the service, or comply with law. Current service providers include <strong>Vercel</strong> for website hosting and delivery, <strong>Supabase</strong> for authentication and database services, and <strong>Google</strong> when you choose Google sign-in. These providers process information under their own terms and privacy commitments.</p>
        <p>Destination photographs are currently delivered by third-party image hosts, including Unsplash and Tourist Travel Tips. As Case features are introduced, we may use carefully selected infrastructure, document-processing, email-delivery, security, and AI service providers. We will update this policy before using providers in a materially different way. We may also disclose information if reasonably necessary to comply with legal process, protect people or the service, investigate abuse, or complete a corporate transaction subject to appropriate safeguards.</p>
        <p>We do not sell personal information or share it for cross-context behavioral advertising. The current beta does not disclose visa information to embassies, consulates, or visa-issuing authorities because it does not submit applications.</p>
        <h3>International processing</h3>
        <p>Our providers may process information in countries other than your own. Where required, we use recognized transfer mechanisms or other appropriate safeguards. You may contact us for information about safeguards relevant to your data.</p>
      </section>

      <section id="retention">
        <h2>8. Retention and security</h2>
        <p>We keep information only for as long as reasonably needed for the purposes described here. Account information is generally kept while your account remains active. Waitlist information is kept while we manage private-beta access or until you ask us to remove it. Security and request records are retained for periods appropriate to preventing abuse, resolving incidents, and meeting legal obligations.</p>
        <p>When Case features launch, their retention settings and deletion behavior will be described before collection. We use reasonable technical and organizational measures to protect information, but no online service can promise absolute security. Keep your password confidential and contact us promptly if you believe your account has been compromised.</p>
      </section>

      <section id="rights">
        <h2>9. Your rights and choices</h2>
        <p>Depending on where you live, you may have rights to access, correct, delete, or receive a copy of personal information; restrict or object to certain processing; withdraw consent; and appeal or complain to a data-protection authority. We will not discriminate against you for exercising an applicable privacy right.</p>
        <div className="legal-note"><strong>Your right to object:</strong> where we rely on legitimate interests, you may object to that processing by emailing <a href="mailto:askluya@gmail.com">askluya@gmail.com</a>. We will review the request under applicable law.</div>
        <p>You may also ask us to remove your waitlist entry or delete your account by emailing us. We may need to verify that the request relates to you, and some information may be retained where law or security needs require it. You may lodge a complaint with the privacy regulator where you live or work.</p>
        <h3>Cookies and similar technology</h3>
        <p>Visa Master currently uses authentication cookies and similar storage that are necessary to keep you signed in, remember limited interface choices, and protect the service. We do not currently use third-party advertising cookies. If we introduce optional analytics or advertising technology, we will provide any notice and choice required by law.</p>
      </section>

      <section id="children">
        <h2>10. Children and other applicants</h2>
        <p>Visa Master accounts are intended for people who are at least 18 years old. A future workflow may allow an adult to prepare a Case for a minor or another applicant. In that situation, you must be legally authorized to provide their information and use the service for them. We will add appropriate notices and controls before enabling such a workflow.</p>
      </section>

      <section id="changes">
        <h2>11. Changes and contact</h2>
        <p>We may update this policy as Visa Master develops. If a change materially affects how we use personal information, we will provide reasonable notice through the service, by email, or both. The effective date at the top shows when this version began to apply.</p>
        <p>Questions, privacy requests, and concerns can be sent to <a href="mailto:askluya@gmail.com">askluya@gmail.com</a>. Please do not email passport copies or other sensitive visa documents.</p>
      </section>
    </LegalPage>
  );
}
