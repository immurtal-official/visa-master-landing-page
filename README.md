# Visa Master landing page

The public web experience for [Visa Master](https://github.com/immurtal-official/visa-master), a product that researches official visa requirements, assembles application documents, and guides applicants through the preparation process.

This repository currently contains an interactive landing-page prototype. It lets the team compare five visual directions and demonstrates the intended journey from a travel prompt to a prepared application Workspace. It is ready to deploy as a standard Next.js project, but its product actions are not connected to production services yet.

## Repository role

Visa Master is split across three repositories with different responsibilities:

- **`visa-master-landing-page`** owns the public website and will grow into the browser-based signup and dashboard experience.
- **[`visa-master-website`](https://github.com/immurtal-official/visa-master-website)** contains the product and architecture specifications. Despite its name, it does not currently contain the production website implementation.
- **[`visa-master`](https://github.com/immurtal-official/visa-master)** contains the Agent, document toolchain, retrieval pipeline, PDF generation, quality checks, and local Workspace runtime.

The planned production boundary is:

```text
Browser
  |
  v
Landing page and web app (Vercel)
  |
  +---- authentication, PostgreSQL, storage, job state (Supabase)
  |
  +---- secure Agent API and document processing (Hetzner)
```

Vercel serves the frontend. Supabase provides shared platform services. Resource-intensive Agent work stays outside Vercel and runs on Hetzner.

## What is implemented

The page includes five selectable design concepts, a draggable WebGL globe with landmark cards, a responsive route prompt, an animated analysis state, a generated-Workspace preview, and a signup gate. The interface supports reduced-motion preferences and includes an SVG fallback while WebGL initializes.

The route analysis is simulated with a browser timer. Source counts, visa requirements, generated files, downloads, Workspace launch, Google sign-in, and email sign-in are demonstrations only. This repository currently has no API routes, database, Supabase client, authentication, analytics, or Agent integration.

## Technology

- [Next.js](https://nextjs.org/) App Router
- React and TypeScript
- [COBE](https://github.com/shuding/cobe) for the WebGL globe
- CSS custom properties for the five themes, responsive layout, and motion
- ESLint with the Next.js Core Web Vitals rules

## Project structure

```text
app/
├── globals.css      Theme tokens, layouts, responsive rules, and motion
├── layout.tsx       Root layout, fonts, favicon, and metadata
└── page.tsx         Concept data and the interactive landing-page experience
public/
└── favicon.svg
eslint.config.mjs
package.json
tsconfig.json
```

The prototype is deliberately compact. Most UI behavior currently lives in `app/page.tsx`; it should be separated into components when the team commits to a final design direction.

## Run locally

Install Node.js 22 or later, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required for the current prototype.

## Validate changes

Run all repository checks with:

```bash
npm run check
```

This runs ESLint, TypeScript without emitting files, and a production Next.js build. The commands are also available separately:

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy to Vercel

Import this repository into Vercel and keep the detected **Next.js** framework preset. Vercel uses `npm run build` automatically; no `vercel.json`, custom output directory, or environment variables are currently required.

After Supabase and the Agent API are integrated, configure their URLs and credentials as Vercel environment variables. Never expose Supabase service-role credentials or Agent infrastructure secrets through variables prefixed with `NEXT_PUBLIC_`.

## Production work remaining

Before presenting this as a live visa-preparation service, the team still needs to choose one visual concept and remove the concept switcher, connect calls to action to Supabase authentication, replace simulated results with a secure backend flow, label or replace example claims, host the landmark images under project control, add privacy and legal pages, implement consent-aware analytics, and add end-to-end coverage for the signup and job-submission journeys.

Until those integrations exist, this repository should be described and tested as a frontend prototype rather than a working visa application service.
