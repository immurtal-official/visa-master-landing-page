# Visa Master landing page

The public landing-page frontend for [Visa Master](https://github.com/immurtal-official/visa-master). Visa Master guides people through official visa requirements, helps organize their evidence, and prepares a consistent application pack while keeping the applicant in control.

This repository owns the marketing entry point and its interactive product preview. It is intentionally separate from the Agent runtime and is ready to deploy as a conventional Next.js application on Vercel.

## Repository boundaries

The Visa Master project is split by responsibility:

- **`visa-master-landing-page`** contains this public website and lead-in experience.
- **[`visa-master`](https://github.com/immurtal-official/visa-master)** contains the Agent, retrieval and document-processing pipeline, PDF generation, quality checks, and local Workspace runtime.
- **[`visa-master-website`](https://github.com/immurtal-official/visa-master-website)** contains product and architecture specifications. Despite its name, it is not a duplicate of this frontend implementation.

The intended production boundary is:

```text
Browser
  |
  v
Landing page / web frontend (Vercel)
  |
  +---- authentication, PostgreSQL, storage, job state (Supabase)
  |
  +---- secure Agent API and document processing (Hetzner)
```

Vercel serves the frontend, Supabase provides shared platform services, and the resource-intensive Agent workload runs on Hetzner.

## Current experience

The page presents one responsive visual direction with a warm light theme and a Night Flight dark theme. It includes:

- A draggable WebGL globe with interactive landmark cards and an SVG loading fallback.
- The hero message “DIY visa applications. The easy way.”
- A destination prompt with example searches.
- A deterministic Chengdu → Spain intake conversation, editable route review, and a Workspace with 14 Case actions.
- Contextual guide/template previews, official source links, and an application-form field reference from the existing curated route.
- A private-beta waitlist with revocable, single-use invite phrases and a five-failures-per-IP, 24-hour limit.
- Supabase Auth for invited email/password and Google accounts, plus a separate path for existing users.
- First-session display-name onboarding stored in Supabase Auth metadata for email and Google accounts.
- A session-aware header that opens the workspace under the signed-in user's display name.
- A theme toggle, responsive layouts, and reduced-motion support.

The public demo uses a bundled snapshot of the employed-adult Chengdu → Spain tourism route. It does not call an Agent or verify current official requirements. Intake answers persist only in `sessionStorage` in the current browser tab; they are not saved as a production Case. Unsupported applicants can explicitly explore a sample. Resources expose free guide/template previews and official document source pages. Opening the Workspace requires sign-in through the existing invitation-only signup flow, with intake retained in this tab. Action messages, document editing, browser automation, and Visa Master resource downloads show demo paid-feature prompts. These prompts never collect payment or grant a paid entitlement; they are presentation gates, not server-enforced download protection. PDF autofill, uploads, payment, bookings, and personalized pack generation are outside this demo. Authentication and early-access registration remain live when Supabase is configured.

## Technology

- [Next.js](https://nextjs.org/) App Router
- React and TypeScript
- [Supabase Auth](https://supabase.com/docs/guides/auth) with SSR cookie handling
- [COBE](https://github.com/shuding/cobe) for the WebGL globe
- Plain CSS with custom properties for themes, responsive layout, and motion
- ESLint with the Next.js Core Web Vitals rules

## Project structure

```text
app/
├── api/              Server-only waitlist and invite-redemption routes
├── account/          Password-update flow
├── auth/             OAuth/email callback and error routes
├── globals.css      Design tokens, layout, component styles, and motion
├── layout.tsx       Root layout, fonts, favicon, and metadata
├── login/            Direct sign-in page
├── privacy/          Public privacy notice
├── terms/            Public terms of use
├── workspace/        Protected post-authentication holding page
└── page.tsx          Landing-page UI, globe behavior, and demo state flow
components/auth/      Shared sign-in dialog and account controls
lib/early-access/     Invite normalization and keyed hashing
lib/supabase/         Browser, server, and session-refresh clients
public/
├── favicon.svg
└── luya-circle.svg    Lüya product mark
scripts/               Invite-phrase administration helpers
supabase/migrations/   Versioned profile and private-beta schema
proxy.ts              Refreshes auth cookies and protects private routes
eslint.config.mjs
package.json
tsconfig.json
```

The landing shell lives in `components/landing-page.tsx`. The conversation and Workspace live in `components/demo/`, with scoped styles in `app/demo.css`. Individual actions use the main Workspace’s conversation/composer/Artifacts-panel pattern, adapted to deterministic curated replies. Each action keeps its own message history and composer draft in the tab’s demo state; this is not the production Action Thread store. `lib/demo/intake.ts` owns deterministic route matching and storage validation. `lib/demo/resources.ts` associates Case actions with bundled resources.

Run `npm run demo:sync -- /path/to/visa-master` to deliberately refresh the checked-in snapshot in `lib/demo/data/`. The import script records source paths, the source repository revision, and SHA-256 hashes; it does not perform live verification. The deployed demo has no sibling-repository dependency. `npm run test:demo` checks route matching, unsupported answers, storage recovery, and snapshot integrity.

## Run locally

Install Node.js 22 or later, then run:

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local`. Add the public URL and publishable key from your Supabase project, then add a server-only Supabase secret key and a random invite-security secret of at least 32 characters. Never put either server secret in a `NEXT_PUBLIC_` variable.

```bash
cp .env.example .env.local
```

Then open [http://localhost:3000](http://localhost:3000). The Supabase Auth redirect allow list must include `http://localhost:3000/**` for local email confirmation and OAuth callbacks.

Apply the SQL files in `supabase/migrations/` to the connected Supabase project before testing onboarding. Visa Master stores the chosen display name in Supabase Auth user metadata, so the client can read it from the authenticated user without maintaining a separate public profile table. Display names are not unique and must not be used for authorization.

After applying the migrations in filename order, open **Authentication → Hooks** in Supabase and configure **Before User Created** to use the Postgres function `public.hook_require_early_access`. The hook denies new email and Google accounts unless the submitted email has redeemed an active phrase. Existing accounts can continue signing in without a phrase.

Generate a strong, non-expiring phrase and its keyed digest with:

```bash
npm run invite:create -- "Private beta"
```

The quoted value is an internal database label. To choose the phrase users enter, pass an explicit label and a custom phrase:

```bash
npm run invite:create -- --label "Private beta" --phrase "LUYA-EARLY-2026"
```

Custom phrases must be 6-160 characters after whitespace normalization. Phrase matching is case-insensitive, so the generator displays and stores phrases in uppercase to match the input UI. By default, the script uses `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SECRET_KEY` to insert both the administrative plaintext copy and its authentication digest directly into Supabase. To print an `insert` statement for manual use instead, add `--sql-only`. An unused phrase remains valid until it is redeemed once or its `active` column is set to `false`. The plaintext column is protected from client roles but remains visible to trusted database administrators.

## Validate changes

Run the complete local check:

```bash
npm run check
```

This runs ESLint, TypeScript without emitting files, and a production Next.js build. The commands are also available separately as `npm run lint`, `npm run typecheck`, and `npm run build`.

## Deploy to Vercel

Import this repository into Vercel and keep the detected **Next.js** framework preset. Vercel uses `npm run build`; the current version needs no `vercel.json` or custom output directory.

Connect the Supabase integration to **Production** and provide `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and the same `INVITE_SECURITY_SECRET` used when creating phrase digests. The latter two must remain server-only. On the free tier, keep Vercel Preview disconnected until it has an isolated Supabase project or preview branch; otherwise preview waitlist entries and sign-ups affect production data.

In Supabase Auth, set the Site URL to the canonical production domain and allow redirects from that domain, the stable Vercel domain, and localhost. Email/password requires email confirmation. Google additionally requires a Web OAuth client whose authorized redirect URI is the Supabase callback shown in the provider settings.

## Before production launch

The remaining product work includes configuring production SMTP and Google OAuth, connecting the Agent API, replacing simulated results with secure job state, hosting landmark images under project control, confirming the legal operator and jurisdiction in the public policies, implementing consent-aware analytics, and covering signup and job submission with end-to-end tests. Apple sign-in is intentionally deferred.

Until those integrations exist, this repository should be described as an interactive frontend prototype rather than a working visa-application service.

### Route-matching audit — 7 September 2026

The landing demo deliberately supports a narrower profile than Spain's full visa rules: Chengdu hukou, currently resident in mainland China, Spain as the tourism destination responsible for the application, a trip of up to 90 days with no Schengen stays in the preceding 180 days, a Chinese ordinary passport, and one employed adult paying from their own income/savings. Missing new facts in saved sessions are asked again before reopening the Workspace. Recent stays and sponsored funding create additional-review flags rather than blocking the roadmap. Other core profiles are outside demo coverage, not declared visa-ineligible.

Source checks:
- [Spanish Consulate General in Chengdu — jurisdiction](https://www.exteriores.gob.es/Consulados/Chengdu/es/Consulado/Paginas/Demarcaci%C3%B3n.aspx): Sichuan, Yunnan, Guizhou and Chongqing. Chengdu-city-only matching is a demo limit.
- [BLS Chengdu Chinese FAQ](https://web.blscn.cn/chengdu/chinese/faq.php): hukou-based filing and the four-region district. Residence-permit exceptions are not implemented; the site also contains older notices, so generalized exception handling needs specific current confirmation.
- [European Commission — applying for a Schengen visa](https://home-affairs.ec.europa.eu/policies/schengen/visa-policy/applying-schengen-visa_en): longest stay / equal-stay first entry, normal legal-residence filing, and the rolling 90/180-day limit. The demo does not calculate travel-date histories.
- [BLS Chengdu notices](https://web.blscn.cn/chengdu/): six months of bank statements; parental funding requires original and copy of the birth certificate. Sponsored funding needs additional evidence; the roadmap remains accessible with a review flag.

BLS and consulate content was available through current indexed official pages; direct fetches of several pages and the tourism PDF returned HTTP 403. This audit does not revalidate every bundled document or its current bytes. The original resource snapshots and hashes remain intact. A route match is not visa approval, a passport-validity check, an existing-visa/EU-family-rights assessment, or a filing-date check (normally no earlier than six months and at least 15 days before travel).
