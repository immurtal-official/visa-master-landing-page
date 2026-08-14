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
- A signup gate for the primary calls to action.
- A theme toggle, responsive layouts, and reduced-motion support.

The analysis delay and displayed results are demonstrations. The page does not yet call an Agent API, authenticate users, download files, or persist data. Counts, document names, routes, and status messages are example content rather than live visa guidance.

## Technology

- [Next.js](https://nextjs.org/) App Router
- React and TypeScript
- [COBE](https://github.com/shuding/cobe) for the WebGL globe
- Plain CSS with custom properties for themes, responsive layout, and motion
- ESLint with the Next.js Core Web Vitals rules

## Project structure

```text
app/
├── globals.css      Design tokens, layout, component styles, and motion
├── layout.tsx       Root layout, fonts, favicon, and metadata
└── page.tsx         Landing-page UI, globe behavior, and demo state flow
public/
└── favicon.svg
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

Open [http://localhost:3000](http://localhost:3000). No environment variables are required for the current prototype.

## Validate changes

Run the complete local check:

```bash
npm run check
```

This runs ESLint, TypeScript without emitting files, and a production Next.js build. The commands are also available separately as `npm run lint`, `npm run typecheck`, and `npm run build`.

## Deploy to Vercel

Import this repository into Vercel and keep the detected **Next.js** framework preset. Vercel uses `npm run build`; the current version needs no `vercel.json`, custom output directory, or environment variables.

When Supabase and the Agent API are connected, add their URLs and credentials through Vercel environment variables. Never expose Supabase service-role credentials or Agent infrastructure secrets through variables prefixed with `NEXT_PUBLIC_`.

## Before production launch

The remaining product work includes connecting authentication and the Agent API, replacing simulated results with secure job state, hosting landmark images under project control, adding privacy and legal pages, implementing consent-aware analytics, and covering signup and job submission with end-to-end tests.

Until those integrations exist, this repository should be described as an interactive frontend prototype rather than a working visa-application service.
