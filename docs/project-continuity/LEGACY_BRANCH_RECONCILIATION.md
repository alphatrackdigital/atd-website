# Legacy Branch Reconciliation

Last reviewed: 2026-08-18

## Decision Summary

| Branch | File evidence | Feature conclusion | Risk | Decision |
| --- | --- | --- | --- | --- |
| Website repo `deploy@4a60eb93` | 224 files: 159 exact in current frontend, 49 have later frontend versions, 10 map to canonical backend (7 exact, 3 later), and 6 renamed/removed paths are accounted for below | No usable unique feature remains. The branch includes an unresolved import of a nonexistent `RichTextEditor`, duplicate lead handlers, and obsolete full-stack deployment configuration. | Low; exact recovery tag verified | **Completed 2026-08-18:** tagged as `archive/deploy-2026-05-14`, then deleted without merging. |
| Website repo `backend@60adfd9` | All 22 files exist in canonical backend: 10 exact and 12 deliberately updated; canonical backend adds the full Vercel surface, transactional webhook, persistence helper, throttle, and tests | Canonical backend is a strict functional successor and is live on Netlify. The branch remains useful only as historical source/rollback context. | Medium until stability window ends | Tag now; retain branch through the agreed Netlify stability window, then delete without merging. |
| Website repo `vercel-backend@42259b36` | All 41 files exist in canonical backend: 15 exact and 26 deliberately updated; canonical backend adds 12 files | Canonical backend preserves the complete Vercel API surface and improves CORS, authentication throttling, integration handling, configuration, and tests. Active Vercel backend testing is isolated on canonical `staging@c9035d19`. | Low; exact recovery tag verified | **Completed 2026-08-18:** tagged as `archive/vercel-backend-2026-06-12`, then deleted without merging. |

## Method and Scope

- Compared Git trees by path and blob hash, not by timestamps or filenames alone.
- Sources: frontend `origin/main@38f280d0`, canonical backend `origin/main@c9035d19`, and the three legacy tips above.
- Reviewed merged backend PRs #2 and #3, their commit/file lists, the current Netlify/Vercel bindings, and the repeated non-mutating production smoke results.
- No source file, environment value, deploy, database record, form, webhook, or branch was changed during the comparison.

## Backend Branch File Matrix

### Exact legacy `backend` files

These ten blobs are byte-identical in canonical backend `main`:

- `.gitignore`
- `netlify/functions/blog-admin.ts`
- `netlify/functions/blog.ts`
- `netlify/functions/contacts-admin.ts`
- `netlify/functions/lib/idempotency.mjs`
- `netlify/functions/lib/jwt.ts`
- `netlify/functions/lib/models/AdminUser.ts`
- `netlify/functions/lib/models/BlogPost.ts`
- `netlify/functions/lib/models/Contact.ts`
- `public/index.html`

### Updated legacy `backend` files

| Legacy path | Canonical disposition |
| --- | --- |
| `.env.example` | Expanded variable contract and sanitized example values; no runtime secret change. |
| `README.md` | Rewritten for the canonical dual-runtime backend and current safety model. |
| `netlify.toml` | Preserves all legacy API routes and adds the transactional webhook route; removes wildcard platform CORS headers. |
| `netlify/functions/auth.ts` | Preserved login/JWT behaviour and added bounded in-memory login throttling. |
| `netlify/functions/brevo-meeting-webhook.mjs` | Preserved signed/idempotent booking flow and added source lifecycle, Brevo list resilience, CRM deal/task handoff, internal notification, and richer GA4 handling. |
| `netlify/functions/brevo-subscribe.mjs` | Preserved subscription behaviour and aligned current consent/list/DOI and tracking handling. |
| `netlify/functions/leads.mjs` | Reconciled schema alignment, campaign attribution, source lifecycle, consent, DOI fallback, CRM handoff, internal notifications, Mongo persistence, Meta CAPI/event IDs, dedupe and sanitized provider errors. |
| `netlify/functions/lib/db.ts` | Preserves `alphatrack` default and supports optional `MONGODB_DATABASE`. |
| `netlify/functions/lib/http.ts` | Replaces wildcard CORS with approved/configured production, Netlify-preview and Vercel-preview origins. |
| `package.json` | Adds current Netlify/test tooling and upgraded runtime dependencies. |
| `package-lock.json` | Regenerated dependency lock for the canonical package contract. |
| `tsconfig.json` | Type-checks both Vercel and Netlify TypeScript handlers. |

Canonical backend additionally contains the full `api/` Vercel implementation, `brevo-transactional-webhook`, `contact-persistence`, login-throttle modules, seven targeted test files, `vercel.json`, and `vitest.config.ts`.

## Vercel Branch File Matrix

### Exact legacy `vercel-backend` files

These fifteen blobs are byte-identical in canonical backend `main`:

- `.gitignore`
- `api/_lib/idempotency.ts`
- `api/_lib/jwt.ts`
- `api/_lib/models/AdminUser.ts`
- `api/_lib/models/BlogPost.ts`
- `api/_lib/models/Contact.ts`
- `netlify/functions/blog-admin.ts`
- `netlify/functions/blog.ts`
- `netlify/functions/contacts-admin.ts`
- `netlify/functions/lib/idempotency.mjs`
- `netlify/functions/lib/jwt.ts`
- `netlify/functions/lib/models/AdminUser.ts`
- `netlify/functions/lib/models/BlogPost.ts`
- `netlify/functions/lib/models/Contact.ts`
- `public/index.html`

### Updated legacy `vercel-backend` files

| Path group | Files | Canonical disposition |
| --- | --- | --- |
| Environment/docs/tooling | `.env.example`, `README.md`, `package.json`, `package-lock.json`, `tsconfig.json` | Current variable contract, dependencies, dual-runtime type-check and reviewed operating guidance. |
| Vercel database/CORS | `api/_lib/db.ts`, `api/_lib/http.ts` | Optional database override and origin allowlist replace fixed database/wildcard CORS. |
| Vercel auth | `api/auth/login.ts` | Calls the new request-aware CORS helper and adds login throttling. |
| Vercel blog/contact routes | `api/blog/[slug].ts`, `api/blog/admin/[slug].ts`, `api/blog/admin/index.ts`, `api/blog/index.ts`, `api/contacts/admin/[id].ts`, `api/contacts/admin/index.ts`, `api/contacts/admin/read/[id].ts` | Existing route behaviour preserved; each now uses request-aware CORS validation. |
| Vercel integrations | `api/leads.ts`, `api/brevo-subscribe.ts`, `api/brevo-meeting-webhook.ts` | Current schema, attribution, consent, DOI, CRM, notifications, GA4, Meta, dedupe and error-handling implementation. |
| Netlify parity | `netlify/functions/auth.ts`, `brevo-meeting-webhook.mjs`, `brevo-subscribe.mjs`, `leads.mjs`, `lib/db.ts`, `lib/http.ts`, `netlify.toml` | Same production-safe improvements described in the backend matrix; transactional webhook route added. |
| Vercel platform config | `vercel.json` | Keeps function duration but removes wildcard platform CORS so route code enforces the allowlist. |

Canonical-only additions versus `vercel-backend`: two login-throttle modules, the transactional webhook, contact-persistence helper, seven test files, and `vitest.config.ts`.

## `deploy` Branch Non-Exact File Matrix

The 159 byte-identical frontend files and seven byte-identical backend files need no migration. The following groups explain every non-exact path.

| Area | Legacy paths | Current disposition |
| --- | --- | --- |
| General frontend/config | `.env.example`, `.gitignore`, `bun.lock`, `eslint.config.js`, `index.html`, `package*.json`, `README.md`, `vite.config.ts` | Current frontend contains later production, test, cPanel, consent, dependency and release-workflow changes. Do not restore the older versions. |
| Deployment/API config | `api/leads.ts`, `netlify.toml`, `netlify/functions/brevo-subscribe.mjs`, `netlify/functions/leads.mjs` | Current frontend has later test-compatible copies; canonical production backend contains the reviewed production handlers. The old full-stack Netlify configuration is superseded. |
| Backend admin functions | `netlify/functions/auth.ts`, `blog-admin.ts`, `blog.ts`, `contacts-admin.ts`, `lib/db.ts`, `lib/http.ts`, JWT/models | Exact or later equivalents exist in canonical backend. |
| Obsolete duplicate | `netlify/functions/leads.ts` | Removed intentionally. The branch also contains `leads.mjs`; the TypeScript file is an older duplicate and is not needed by canonical routing. |
| Admin authentication | `src/context/AdminAuthContext.tsx`, `src/components/admin/ProtectedRoute.tsx`, `src/lib/adminApi.ts` | Replaced by `src/lib/adminAuth.ts`, the route guard in `AdminLayout`, endpoint resolution in `apiEndpoints.ts`, and typed calls inside admin pages. Current code handles storage failures and clears expired sessions on 401. |
| Admin blog editor | `src/pages/admin/AdminBlogEdit.tsx` | Replaced by `AdminBlogEditor.tsx`. The legacy editor imports `@/components/admin/RichTextEditor`, but that component does not exist anywhere in the branch, so the legacy path is not build-complete. |
| Public blog helper | `src/lib/blogApi.ts` | Unreferenced even on `deploy`; safe to omit. The current public blog remains repository-backed through `src/data/blogPosts.ts`. |
| Admin/public pages and shared UI | `src/App.tsx`, admin pages/layout, marketing pages, shared components, CSS and entry files | Current frontend has later routing, accessibility, consent, admin-widget exclusion, error handling, responsive, SEO and release changes. |
| Tests/docs/static output | changed tests, `docs/brevo-double-opt-in.md`, `docs/infrastructure-brief.md`, `public/sitemap.xml`, prerender script | Current versions reflect later production architecture and QA evidence. |

## Important Product Gap Not Solved by Branch Merging

The current admin blog console reads/writes MongoDB through backend admin routes, but the public frontend still reads `src/data/blogPosts.ts`. The old `deploy` branch did not complete this integration: its `blogApi.ts` was unreferenced. Therefore:

- Do not retain or merge `deploy` on the assumption that it makes admin-published posts public.
- Treat CMS/public-blog synchronization as a separate product decision and implementation task.
- Archiving the legacy branches does not remove a working public-blog integration because none of them contains a completed one.

## Archive and Deletion Safety

- Verified tags in the website repository:
  - `archive/deploy-2026-05-14` -> `4a60eb93f0000760c670f4599f97f01c7739c5e3` (created 2026-08-18)
  - `archive/vercel-backend-2026-06-12` -> `42259b3695b79d09f6b7f3d99e087eb9104673f9` (created 2026-08-18)
- Proposed tag still awaiting the backend stability decision:
  - `archive/legacy-backend-2026-06-16` -> `60adfd9d`
- The old Netlify rollback is independently retained as deploy `6a28859001e02f0008d0faf7` at `9b782887`; deleting a Git branch does not delete that Netlify deploy.
- Keep `backend` until the new Netlify production backend completes the chosen stability window.
- `deploy` and `vercel-backend` were removed on 2026-08-18 after remote tag verification. Both Vercel test endpoints returned HTTP 200 after each deletion, and the Netlify frontend remained on ready deploy `6a84cc9442bc7fa01a72dd31`; no build or deploy was requested.
- Do not merge any of the three legacy branches into either canonical `main`; their useful code is already present and their older configuration would create regressions.
