import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use — Visa Master",
  description: "The terms that apply when you access or use Visa Master.",
};

const sections = [
  { id: "agreement", label: "Agreement and eligibility" },
  { id: "service", label: "What Visa Master does" },
  { id: "important", label: "Important visa-service limits" },
  { id: "beta", label: "Private beta" },
  { id: "accounts", label: "Accounts" },
  { id: "responsibilities", label: "Your responsibilities" },
  { id: "content", label: "Your content" },
  { id: "ai", label: "AI-assisted output" },
  { id: "use", label: "Acceptable use" },
  { id: "third-party", label: "Third-party services" },
  { id: "ownership", label: "Ownership and feedback" },
  { id: "fees", label: "Fees" },
  { id: "ending", label: "Suspension and termination" },
  { id: "disclaimers", label: "Disclaimers and liability" },
  { id: "changes", label: "Changes and contact" },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="TERMS OF USE"
      title="The rules of the journey."
      summary="These Terms govern your access to Visa Master’s website, private beta, accounts, and workspace. They are written to keep the service useful, honest, and under your control."
      sections={sections}
    >
      <section id="agreement">
        <h2>1. Agreement and eligibility</h2>
        <p>By accessing or using Visa Master, you agree to these Terms and our <a href="/privacy">Privacy Policy</a>. If you do not agree, do not use the service. “Visa Master,” “we,” and “us” mean the team operating Visa Master, a Lüya product.</p>
        <p>You must be at least 18 years old and legally able to enter into this agreement. If a future feature lets you prepare a visa Case for a minor or another person, you must have authority to act for them and provide their information.</p>
      </section>

      <section id="service">
        <h2>2. What Visa Master does</h2>
        <p>Visa Master is a technology service designed to make do-it-yourself visa preparation easier, with an initial focus on travel, study, business, work, and other temporary or non-immigrant visas. Its planned workspace guides users through current official requirements, helps organize evidence, and prepares consistent draft documents and an application pack while the user remains in control.</p>
        <p>The current private beta is more limited. It includes a public product demonstration, waitlist and invitation access, authentication, display-name onboarding, and an early workspace. Example routes, requirements, files, completion states, and downloads shown on the landing page are demonstrations, not completed visa work or live advice.</p>
      </section>

      <section id="important">
        <h2>3. Important visa-service limits</h2>
        <div className="legal-note"><strong>Visa Master is a private service.</strong> It is not a government agency, embassy, consulate, visa-issuing authority, law firm, or regulated visa adviser, and it is not endorsed by any of them.</div>
        <p>Visa Master provides software, general information, and guided preparation tools. It does not provide legal advice or create an attorney-client or adviser-client relationship. Official forms and instructions may be available directly from the relevant authority without using Visa Master.</p>
        <p>Requirements, forms, fees, appointment availability, government systems, processing times, and policies can change without notice. Visa Master cannot guarantee that information will always be complete or current, that an authority will accept a document, that an appointment will be available, or that a visa or entry permission will be approved. The responsible visa-issuing and border authorities alone make those decisions.</p>
      </section>

      <section id="beta">
        <h2>4. Private beta</h2>
        <p>Access may be limited by waitlist, invite phrase, geography, capacity, or feature availability. An invitation is personal to its recipient unless we say otherwise. You may not sell, publish, automate guesses for, or misuse invite phrases.</p>
        <p>Beta features may be incomplete, change materially, contain errors, or be withdrawn. We may reset test data or limit access when reasonably necessary, but we will not intentionally present the demonstration as a completed application service.</p>
      </section>

      <section id="accounts">
        <h2>5. Accounts</h2>
        <p>You must provide accurate account information, keep your credentials confidential, and promptly tell us if you suspect unauthorized access. You are responsible for activity performed through your account unless applicable law says otherwise. You may not create accounts through deceptive, automated, or unauthorized means.</p>
        <p>If you use Google sign-in, your use of Google’s service is also governed by Google’s terms. Removing Visa Master from your Google Account stops future Google authorization but does not by itself delete your Visa Master account.</p>
      </section>

      <section id="responsibilities">
        <h2>6. Your responsibilities</h2>
        <p>You remain responsible for your application and decisions. This includes choosing the correct visa route, checking official requirements and deadlines, reviewing every answer and generated document, providing authentic and complete evidence, paying applicable fees, attending appointments, and deciding what to submit.</p>
        <p>You must correct mistakes you notice and must not ask Visa Master to create false statements, altered evidence, or misleading applications. We will not submit an application, make a payment, accept a declaration, or send information to an authority without a clear feature and your authorization.</p>
      </section>

      <section id="content">
        <h2>7. Your content</h2>
        <p>You keep ownership of the information, documents, and other material you provide. You give Visa Master a limited permission to host, copy, format, analyze, and otherwise process that material only as needed to provide, secure, support, and improve the features you request, consistent with the Privacy Policy.</p>
        <p>You represent that you have the right to provide the material, including information about another applicant. Do not upload malware, unlawfully obtained material, or information you are not authorized to use.</p>
      </section>

      <section id="ai">
        <h2>8. AI-assisted output</h2>
        <p>Some future features may use automated or AI-assisted systems to research, classify, compare, summarize, or draft. Output may be incomplete, outdated, or wrong, even when it sounds confident. Treat it as a working draft and check it against official sources and your own records.</p>
        <p>AI output is not a decision by a visa-issuing authority and should not be treated as legal advice. You are responsible for the final review and use of any generated material. The current landing-page demonstration does not process visa Case documents or generate a real application pack.</p>
      </section>

      <section id="use">
        <h2>9. Acceptable use</h2>
        <p>You may not use Visa Master to break the law; facilitate fraud, trafficking, evasion, or misrepresentation; impersonate another person; interfere with security or rate limits; probe for vulnerabilities without written authorization; scrape or overload the service; reverse engineer protected parts of the service except where law permits; infringe rights; or help another person do any of these things.</p>
      </section>

      <section id="third-party">
        <h2>10. Third-party services and official websites</h2>
        <p>Visa Master relies on providers such as Vercel, Supabase, and Google, and may link to official authority websites or other third-party services. Their systems, availability, content, and decisions are outside our control and governed by their own terms. A link or integration does not mean Visa Master controls or endorses every part of that service.</p>
        <p>Government websites and appointment systems may change, become unavailable, or reject information. You should verify important steps directly with the responsible authority.</p>
      </section>

      <section id="ownership">
        <h2>11. Visa Master ownership and feedback</h2>
        <p>Visa Master and its licensors own the service, software, branding, interface, and original content, excluding your content and third-party material. Subject to these Terms, we give you a limited, personal, non-exclusive, non-transferable right to use the service for its intended purpose.</p>
        <p>If you send feedback, you allow us to use it without restriction or payment, but you do not transfer ownership of your unrelated ideas or personal content.</p>
      </section>

      <section id="fees">
        <h2>12. Fees</h2>
        <p>The current private beta does not charge for the demonstrated landing-page flow. If paid features are introduced, we will show the price, currency, billing terms, and applicable refund or cancellation rules before you agree to a charge. Government, appointment, translation, courier, or other third-party fees are separate unless expressly stated.</p>
      </section>

      <section id="ending">
        <h2>13. Suspension and termination</h2>
        <p>You may stop using Visa Master at any time and may request account deletion as described in the Privacy Policy. We may limit, suspend, or terminate access if you breach these Terms, create risk or legal exposure, threaten the service or other people, or if operating a feature is no longer practical. Where appropriate, we will provide notice and a reasonable opportunity to address the issue.</p>
        <p>Sections that by their nature should continue—such as ownership, disclaimers, liability limits, and obligations concerning prior use—survive termination.</p>
      </section>

      <section id="disclaimers">
        <h2>14. Disclaimers and liability</h2>
        <p>To the extent permitted by law, Visa Master is provided “as is” and “as available.” We do not make warranties about uninterrupted availability, error-free output, approval outcomes, processing times, or fitness for a particular visa route.</p>
        <p>To the extent permitted by law, Visa Master and the people who operate it will not be liable for indirect, incidental, special, consequential, or punitive losses, or for lost profits, data, opportunities, travel, or visa and entry outcomes arising from use of the service. Nothing in these Terms excludes liability that cannot lawfully be excluded or limits mandatory consumer rights.</p>
      </section>

      <section id="changes">
        <h2>15. Changes and contact</h2>
        <p>We may update these Terms as the beta and service develop. If a change is material, we will provide reasonable notice through the service, by email, or both. Changes apply from the stated effective date; if you do not agree, you should stop using the service.</p>
        <p>Questions about these Terms can be sent to <a href="mailto:askluya@gmail.com">askluya@gmail.com</a>.</p>
      </section>
    </LegalPage>
  );
}
