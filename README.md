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
- Simulated requirement-checking and generated-Workspace states.
- A private-beta waitlist with revocable, single-use invite phrases and a five-failures-per-IP, 24-hour limit.
- Supabase Auth for invited email/password and Google accounts, plus a separate path for existing users.
- First-session display-name onboarding stored in Supabase Auth metadata for email and Google accounts.
- A session-aware header that opens the workspace under the signed-in user's display name.
- A theme toggle, responsive layouts, and reduced-motion support.

The analysis delay and displayed results are demonstrations. Authentication is live when Supabase is configured, but the page does not yet call an Agent API, download files, or persist visa-case data. Counts, document names, routes, and status messages are example content rather than live visa guidance.

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

The prototype is deliberately compact. Most behavior currently lives in `app/page.tsx`; larger production integrations should be extracted into focused components and service modules as they are introduced.

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

The remaining product work includes configuring production SMTP and Google OAuth, connecting the Agent API, replacing simulated results with secure job state, hosting landmark images under project control, adding privacy and legal pages, implementing consent-aware analytics, and covering signup and job submission with end-to-end tests. Apple sign-in is intentionally deferred.

Until those integrations exist, this repository should be described as an interactive frontend prototype rather than a working visa-application service.
