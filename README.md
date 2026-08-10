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

Backend/API work belongs on the `backend` branch.

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
git clone https://github.com/alphatrackdigital/alphatrackdigital.git
cd alphatrackdigital
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

## Frontend Staging

Primary frontend test/staging environment:

```text
https://alphatrackdigital.netlify.app
```

Use Netlify Deploy Previews and the optional `staging` branch for routine frontend review. Keep Vercel as fallback/comparison infrastructure only, not the normal review path.

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
