# AlphaTrack Digital Website

Official frontend website for AlphaTrack Digital — a measurement-first digital growth agency focused on conversion tracking, analytics, paid media, automation, and measurable marketing performance.

## Project Role

`main` is the production frontend website branch.

Use this branch for:

- Public website pages
- Blog frontend
- Landing pages
- Header, footer, navigation, and shared frontend components
- SEO, copy, styling, and responsive design

Backend/API production and runtime work belongs in `alphatrackdigital/atd-backend-test`. Historical backend-related branches/files in this repository are not the canonical backend implementation path.

## Tech Stack

- Vite
- React
- TypeScript
- React Router
- Tailwind CSS
- shadcn-ui / Radix UI
- Framer Motion
- Namecheap/cPanel LiteSpeed production hosting

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Production frontend website |
| `backend` | Backend/API functions for blog, auth, leads, and admin tools |
| `deploy` | Full-stack safe-keeping and integration reference |

Short-lived branches should use:

```text
feature/*
fix/*
content/*
backend/*
hotfix/*
chore/*
experiment/*
```

## Local Development

```sh
git clone https://github.com/alphatrackdigital/atd-website.git
cd atd-website
npm install
npm run dev
```

Local URL:

```text
http://127.0.0.1:8080
```

## Commands

```sh
npm run dev          # Start local dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run Playwright tests
npm run preview      # Preview production build
npm run release:prepare # Validate and package a cPanel release
```

## Development Workflow

Do not edit `main` directly.

```sh
git checkout main
git pull origin main
git checkout -b feature/task-name
```

Before pushing changes:

```sh
npm run lint
npm run build
git status
git diff
```

Then commit and open a pull request into `main`. Review the built output before publishing to the production host.

## Production Hosting

Current production host:

```text
Namecheap/cPanel LiteSpeed
```

Production domain:

```text
https://alphatrack.digital
```

Current publishing model:

```text
Static React build output from `dist` is served by the production host.
```

Production publishing uses the manually triggered, protected GitHub Actions workflow described in [`docs/production-publishing.md`](docs/production-publishing.md). It packages `main`, waits for approval, backs up cPanel, deploys over SSH, runs GET-only smoke checks, and restores the backup if those checks fail.

The repository still contains Netlify-compatible function code and `netlify.toml`, but Netlify is not the current production host. Treat those files as a future migration path unless the hosting decision changes.

Brevo API routes such as `/api/leads` and `/api/brevo-subscribe` require a Node/serverless runtime. They will not run on static-only cPanel hosting without a separate API deployment or hosting migration.

## Frontend QA

Canonical non-production frontend runtime QA is the deliberate Cloudflare exact-SHA lane:

```text
https://atd-website-qa.alphatrackdigital.workers.dev
```

Use the manually triggered `Cloudflare Website Exact-SHA QA` GitHub Actions workflow when provider-hosted frontend proof is materially required. The deployment manifest at `/__atd/deployment.json` must match the reviewed Git SHA.

Do not recreate the retired Vercel `atd-website-test` project. Netlify frontend previews are not the canonical website QA path.

Public production remains on Namecheap/cPanel and is separately gated.

Live backend/API service used by the public Namecheap/cPanel website:

```text
https://alphatra-serv.netlify.app
```

For Namecheap/cPanel frontend builds, point browser form calls at the backend service:

```text
VITE_LEADS_ENDPOINT=https://alphatra-serv.netlify.app/api/leads
VITE_BREVO_SUBSCRIBE_ENDPOINT=https://alphatra-serv.netlify.app/api/brevo-subscribe
```

## Current Product Direction

Primary CTA:

```text
Book A Free Strategy Call
```

The site should feel modern, premium, clean, conversion-focused, and measurement-first.

## High-Risk Files

Edit these only when necessary:

```text
vite.config.ts
netlify.toml
src/App.tsx
src/main.tsx
src/entry-server.tsx
scripts/prerender-homepage.mjs
netlify/functions/*
```

## Additional Documentation

- `docs/playwright-ui-targeting.md` — Playwright locator workflow for Codex and UI QA.
- `docs/netlify-credit-control.md` — Netlify project roles, staging workflow, and credit-control rules.


## Hybrid Codex workflow

GitHub is the synchronization and integration authority. Local Codex and Codex Cloud are development workers.

For a Local → Cloud handoff:

```text
feature branch → tests → commit → push exact SHA → Codex Cloud task → Cloud PR into source branch → GitHub CI/release gate
```

Do not have Local and Cloud edit the same source branch simultaneously. Production deployment remains separately authorized from code generation.
