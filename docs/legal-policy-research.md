# Visa Master privacy and terms research

Research date: 24 August 2026

This note is a product-specific drafting brief, not legal advice. It uses primary regulatory guidance and first-party policies as structural references; none of their wording should be copied. A lawyer should review the final pages before Visa Master accepts passport records, financial evidence, health information, or other high-risk application data.

## Product baseline verified in this repository

Visa Master is currently a private-beta landing and authentication experience. It collects waitlist and invited-user email addresses; display names; email/password or Google-authentication account data; essential Supabase session cookies; and a locally stored language preference. Invite-abuse controls derive a keyed digest from the request IP and keep failed-attempt records. The page also loads destination images from third-party hosts, which exposes ordinary request metadata such as an IP address to those hosts.

Google sign-in currently asks for the standard `openid`, email, and profile scopes; Supabase documents these as the scopes its Google provider needs. The app uses Google data to authenticate the person, associate an email address with an account, and initialize profile metadata. It does not currently request Gmail, Drive, Calendar, or other Google-product data. [Supabase Google login documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)

The landing experience still demonstrates, rather than performs, visa research, document generation, file storage, government submission, and payment. The policies should distinguish this current beta from future workspace features. Do not claim that passport or evidence files are presently collected, sent to an Agent, submitted to a government, or retained under a particular schedule until those flows exist and have been audited.

## What the reference services consistently do

The strongest patterns are visible across first-party terms from temporary-visa, travel-document, and related services:

- Boundless identifies the contracting entity, explains the service in plain language, disclaims government affiliation, separates self-service tools from legal services, and makes the applicant responsible for a self-service application's accuracy and completeness. [Boundless Terms, sections 1–3](https://www.boundless.com/terms)
- iVisa separates accounts, privacy, user content, third parties, acceptable use, suspension, warranties, liability, disputes, and commercial terms. It expressly says government requirements can change, visa results are not guaranteed, and probabilistic AI output needs human verification. [iVisa Terms](https://www.ivisa.com/terms-and-conditions)
- Atlys similarly separates third-party services, acceptable use, document handling, disclaimers, consumer-law savings clauses, and its operational role. [Atlys Terms](https://www.atlys.com/en-US/terms)
- VFS distinguishes its role as an administrative processor from the government or diplomatic mission that decides the application. That is a useful conceptual boundary for Visa Master even though Visa Master currently prepares materials for the user rather than processing on a government's behalf. [VFS Global applicant privacy notice](https://www.vfsglobal.com/en/pdf/vfs-global-corporate-privacy-notice-visa-applicants-and-customers.pdf)
- Major SaaS terms give only a limited permission needed to host, transform, back up, and deliver user content while leaving ownership with the user. Dropbox is a clear first-party example; OpenAI separately warns that AI output may be inaccurate and requires users to evaluate it. [Dropbox Terms](https://www.dropbox.com/en/terms), [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/)

Visa Master should borrow those structural traditions, not their legal language or aggressive limitations.

## Privacy page: recommended structure

### 1. Identity, scope, and contact

Name the actual data controller/operator, its legal name, postal address, and a monitored privacy email. “Visa Master” and “Lüya” are product/brand names in the repository, not enough by themselves to identify a contracting legal person. If the operator is outside the EEA or UK but offers the service there, determine whether an EU or UK representative is required.

The notice should apply to the landing page, waitlist, accounts, workspace, communications, and any later document-processing features, while making clear when a feature is not yet available.

### 2. Data categories and sources

Use concrete categories, separated by source:

- **Provided directly:** email; invite-phrase submissions; chosen display name; support messages; and, only once implemented, answers, travel plans, passport details, photographs, financial/employment/family evidence, generated documents, and application feedback.
- **From Google:** only basic identity data authorized through Google sign-in—currently Google account identifier, email, name, profile image, and related profile metadata. State the exact data, purpose, storage, sharing, and deletion behavior; do not say “Google data” generically.
- **Collected automatically:** authentication/session records, request timestamps, IP-derived anti-abuse digest, security and error logs, device/browser/network metadata actually logged by Vercel or Supabase, and language preference stored in the browser.
- **About other people:** sponsors, hosts, relatives, dependants, employers, or travel companions appearing in application evidence. Require the account holder to have authority to provide it and give an appropriate notice to those people where required.

Passport numbers, account credentials, financial records, health information, religion, ethnicity, sexuality, and some family/application information may be sensitive or special-category data. California expressly treats government identifiers, account credentials, financial access data, precise location, communications contents, health data, and certain protected characteristics as sensitive personal information. [California Attorney General CCPA overview](https://oag.ca.gov/privacy/ccpa)

### 3. Purpose and lawful-basis table

For each category, pair the actual purpose with the legal basis rather than listing every possible basis:

- waitlist and beta communications — steps requested by the person and/or legitimate interests; obtain separate consent for unrelated marketing;
- account creation, authentication, workspace delivery, document preparation, and support — contract or steps before contract;
- security, invite-rate limiting, fraud prevention, and service reliability — legitimate interests and, where relevant, legal obligations;
- legal compliance and valid government requests — legal obligation;
- optional analytics or marketing cookies — consent where required;
- sensitive application evidence — identify an Article 9 condition before launch, likely an explicit, contextual consent flow where legally appropriate, rather than treating acceptance of the general privacy policy as consent.

EU/UK notices must provide the controller and representative/DPO details where applicable; purposes; legal bases and legitimate interests; recipients; transfer safeguards; retention periods or criteria; rights; consent withdrawal; complaint rights; whether data is required and the consequences of not providing it; and meaningful information about solely automated decisions where applicable. [ICO right-to-be-informed checklist](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/), [GDPR Articles 13–14](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

### 4. How the service uses AI

Say which user content may be sent to an AI/model provider, for which visible feature, whether humans can review it, and whether the provider may use it for model training. Do not promise “never used for training” until the selected API contracts and telemetry settings enforce that outcome. Explain that Visa Master uses AI to organize and draft, not to decide a visa application; government authorities make visa decisions. If any output could materially affect a user, preserve user review and correction rather than presenting it as a solely automated determination.

### 5. Sharing and processors

Name material processors where possible and otherwise use narrow categories. The current list should cover:

- Supabase for authentication, PostgreSQL records, and session handling;
- Vercel for application hosting, delivery, and operational logs;
- Google for optional sign-in;
- the actual transactional-email provider once configured;
- current third-party image hosts, or preferably eliminate this disclosure by hosting those images under project control;
- later storage, Agent-hosting, OCR, model, support, analytics, payment, and government/application-centre recipients only when those integrations go live.

Separate processors acting for Visa Master from independent recipients. A future government submission must occur only when the user knowingly directs it; disclose that the receiving authority then handles the data under its own law and notice. Also cover legal requests and a merger or business transfer, without implying unrestricted sale.

### 6. International transfers

State the real hosting/database regions and where support, model, and email providers process data. For EEA/UK users, identify the transfer mechanism—adequacy, Standard Contractual Clauses/UK addendum, or another valid safeguard—and how to request a copy. Supabase's DPA describes the customer as controller/business and Supabase as processor/service provider for covered data, but Visa Master must still configure the correct region and complete its own transfer assessment. [Supabase DPA](https://supabase.com/downloads/docs/Supabase%2BDPA%2B260317.pdf)

### 7. Retention

Give a period or understandable criterion per category: waitlist records; account/profile records; application workspaces and uploads; generated packs; security/invite-attempt logs; support messages; and legal/billing records. The current database has no product-level deletion schedule, so do not invent numbers in the notice. First decide and implement deletion jobs, backups behavior, account deletion, and legal holds. Say what happens to a workspace after account closure and distinguish live deletion from backup expiry.

### 8. Security

Use measured language: reasonable administrative, technical, and organizational safeguards, with examples that are actually implemented. Never claim “100% secure,” “bank-grade,” “end-to-end encrypted,” or “only you can see your files” unless the architecture proves each statement. Server-side document processing is ordinarily incompatible with a literal end-to-end-encryption claim because the service needs plaintext access.

### 9. Rights and choices

Provide a usable request channel for access, correction, deletion, restriction, portability, objection, consent withdrawal, and regulator complaints where applicable. Explain account/profile controls, Google access revocation, marketing unsubscribe, and cookie choices. The notice should not promise rights that the operator cannot operationally fulfill.

CCPA/CPRA may not apply to an early beta. The California regulator's current FAQ lists thresholds of at least $26.625 million in gross annual revenue, buying/selling/sharing data of 100,000 California residents or households, or deriving at least half of revenue from selling/sharing California data. The policy can still use its transparent category/purpose/right structure. If the Act becomes applicable, add notice-at-collection disclosures and rights to know, delete, correct, opt out of sale/share, limit qualifying sensitive-data uses, and non-discrimination. California also expressly identifies citizenship or immigration status as sensitive personal information. [California Privacy Protection Agency FAQ](https://cppa.ca.gov/faq)

### 10. Children, changes, and complaints

Account holders should be adults. Because adults may prepare applications for minor dependants, do not simply say “we never process children's data.” Explain that an adult may provide a dependant's information only with authority and that extra safeguards/consent may apply. Include an effective date, material-change notification method, controller contact, EU/UK representative or DPO if required, and supervisory-authority complaint rights.

## Google OAuth-specific requirements

For the free Supabase setup, Google brand verification—not a Supabase custom domain—is the step that can show the verified Visa Master name and logo. Google requires a public homepage on a verified owned domain with links to Terms and Privacy. The privacy page must be a dedicated responsive HTML page on the same domain, linked from both the homepage and OAuth configuration, and it must accurately disclose how Google user data is accessed, used, stored, shared, and deleted. [Google OAuth 2.0 Policies](https://developers.google.com/identity/protocols/oauth2/policies), [Google verification requirements](https://support.google.com/cloud/answer/13464321), [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)

The precise Visa Master disclosure can remain narrow: Google sign-in provides basic profile and email information to create/authenticate the account, prefill the profile, protect the workspace, and support account/security operations; Visa Master does not use it for advertising or access Google mail/files. If use changes, update the notice and obtain any newly required consent before the new use. Keep requested scopes to `openid`, email, and profile.

## Terms page: recommended structure

1. **Contract and eligibility:** contracting legal entity, covered websites/services, effective date, acceptance mechanism, adults-only account rule, and authority to act for a dependant or another applicant.
2. **Service boundary and beta:** guided self-service preparation based on official-source research; private-beta features may be incomplete, changed, or withdrawn. State clearly what is only a simulation today.
3. **No government affiliation:** Visa Master is not a government, embassy, consulate, visa application centre, or law firm and is not endorsed by them. Official forms and instructions may be available directly from authorities.
4. **No legal advice or representation:** general information, software assistance, and generated drafts do not create an attorney-client relationship. Refer legally complex cases to a qualified professional.
5. **Applicant responsibility:** the user supplies truthful, lawful, complete information; checks requirements and all generated fields against current official sources; reviews the final pack; signs and submits it; attends appointments; and meets deadlines. Visa Master should make no submission or external action without explicit user authorization.
6. **AI limitations:** output may be incomplete, outdated, inconsistent, or wrong; it is not the sole source of truth; users must review it. Visa Master does not make eligibility or visa decisions.
7. **No outcome guarantee:** authorities retain sole discretion and may request more evidence, change requirements, delay, or refuse. Do not promise approval, processing time, appointment availability, or “ready-to-go” perfection.
8. **Accounts and beta access:** account security, accurate account data, one-person invitations, no transfer or circumvention, and the right to suspend compromised or abusive accounts.
9. **User content:** user retains ownership; grants only the limited permission needed to host, copy, parse, transform, generate, back up, and return materials. The user warrants authority over information about other people. Do not take a perpetual marketing license over passports or evidence.
10. **Acceptable use:** no fraud, forged evidence, impersonation, unlawful visa-related activity, rights violations, malware, scraping, reverse engineering where law permits restriction, interference, credential sharing, rate-limit bypass, or unauthorized system access.
11. **Third-party and official sources:** explain dependencies on Supabase, Vercel, Google, future AI/storage providers, and external government sites. Do not disclaim responsibility for Visa Master's own processor choices more broadly than consumer law permits.
12. **Fees/refunds:** omit payment clauses while the beta is free, or state that paid features will have clear service-specific terms before purchase. Never retrofit undisclosed commercial terms after payment.
13. **Availability, suspension, and termination:** beta availability, maintenance, account closure, content export/deletion, survival clauses, and reasonable notice for non-urgent discontinuation.
14. **IP and feedback:** Visa Master owns the service and brand; the user receives a limited service license. Feedback can be used without transferring rights in application content.
15. **Disclaimers and liability:** use an “as available” limitation with mandatory consumer-law carve-outs. Avoid asserting that users waive non-waivable privacy, negligence, consumer, or statutory rights. Liability caps, indemnity, arbitration/class waivers, governing law, and venue require counsel and the operator's actual jurisdiction—not a copied U.S. SaaS template.
16. **Changes and contact:** advance notice for materially adverse changes where practical, version/effective date, and the same real operator/contact details as the privacy page.

## Product decisions required before publication

These facts cannot be safely inferred from the repository and should not be fabricated:

- the operator/controller's full legal name, registration jurisdiction, postal address, and contracting email;
- the governing law, venue, and whether any arbitration/class-action provision is appropriate;
- the minimum user/account age and process for adult-managed minor applications;
- the Supabase region, Vercel/log locations, support-access model, and international-transfer safeguards;
- the transactional-email provider and its role;
- category-specific retention/deletion periods and backup-expiry behavior;
- which Agent, OCR, storage, and model providers will receive application evidence, their regions, subprocessors, training settings, and human-access rules;
- whether Visa Master ever submits to authorities or only returns a user-controlled pack;
- any fees, refunds, guarantees, or service levels.

For Google verification now, the minimum honest launch version can describe the current beta precisely, include Google sign-in data handling, reserve a clearly marked future-workspace section, and link `/privacy` and `/terms` visibly from the homepage. Before document uploads are enabled, revise the privacy notice and terms in context with the final data-flow and obtain any necessary explicit consent for sensitive evidence.
