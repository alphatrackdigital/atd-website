# Frontend Release Delta Review

Last reviewed: 2026-08-19

## Scope and Decision

- Verified live cPanel frontend: `45043ef7b62890f5b8d0057eeef473e4610af44e`.
- Current remote production source: `main@38f280d0b99a10678de455dac16a671f431d372c`.
- Relationship: `45043ef7` is an ancestor of `38f280d0`; the review covers the complete 40-file delta.
- Live fingerprint was reconfirmed on 2026-08-19 from `index-HbX5w1An.js` and `index-BsKRnpiV.css`.
- Decision: **HOLD pending review/merge of draft PR #42 and governance confirmation.** The product delta is suitable in intent. Draft PR #42 implements the three code-level corrections at `3ae5c386` and passed the full local release gate, but it remains unmerged and has no production effect.

No workflow was dispatched, no deployment occurred, and no GitHub, cPanel, Vercel or Netlify setting was changed during this review.

## Delta Matrix

| Area | Files | Review finding | Release risk |
| --- | --- | --- | --- |
| Protected publishing | `.github/workflows/release-production.yml`, activation/rollback scripts, package/validation/smoke scripts, `docs/production-publishing.md` | Adds explicit confirmation, environment approval, immutable artifact transfer, cPanel backup, guarded activation, GET-only smoke and automatic rollback. A successful production run on 2026-08-11 proves the path worked. | Low after the reproducibility fixes below. |
| Connection verification | `.github/workflows/verify-production-connection.yml` | Validates variable formats, pinned host/key, document-root boundaries, required tools and write prerequisites without changing site files. It failed once on 2026-08-10 and passed on 2026-08-11. | Low, but rerun for freshness before release. |
| Static routing and 404 | `public/.htaccess`, `netlify.toml`, `vercel.json`, `scripts/prerender-homepage.mjs`, `src/pages/NotFound.tsx` | Replaces SPA soft-404 behavior with prerendered routes and a real noindex 404 across cPanel/test hosts. cPanel `.htaccess` behavior was exercised successfully by the prior protected release. | Low. |
| Hydration and SSR | `src/main.tsx`, `src/entry-server.tsx`, `src/App.tsx`, hydration/prerender tests | Switches prerender output to streaming SSR and hydrates existing HTML; keeps the toaster client-only to prevent server/client mismatch. | Low; isolated `38f280d0` build succeeded. Full release tests remain part of the workflow gate. |
| SEO and discovery | `SEO.tsx`, legal pages, `sitemap.xml`, IndexNow file/script, `llms.txt`, `NotFound.tsx` | Normalizes legal canonicals, removes canonical/OG URL from 404, adds missing service/expertise routes, and submits the sitemap to IndexNow after release. | Low, except IndexNow failure semantics below. |
| Performance and assets | `index.html`, local font/license, optimized wordmark, Clarity icon, `Index.tsx`, `index.css`, Header/Footer | Removes third-party font dependencies, delays Ketch loading, optimizes logos/tool/blog images and avoids initial hero animation. | Low; consent UI should still receive a visual production check after release. |
| Homepage accessibility/content | `Index.tsx` and homepage tests | Corrects heading/summary markup, contrast and redundant accessible names while preserving links and content structure. | Low. |
| Hosting/test configuration | `netlify.toml`, `vercel.json`, `vite.config.ts` | Aligns test hosts with prerendered clean URLs and real 404s. Draft PR #42 disables production source maps and adds an invariant that rejects `.map` assets. | Low after PR #42 is reviewed and merged. |
| Documentation/tooling | `README.md`, `.gitignore`, `package.json`, tests | Adds the release gate and operating documentation. | Low. |

## Findings to Close Before Release

### 1. Production source maps are public — corrected in draft PR #42

`vite.config.ts` sets `build.sourcemap: true`, and the cPanel workflow uploads the entire `dist/` directory. This would publish `.map` files containing frontend source content. Vite-prefixed endpoint values are public by design, and no secret was observed, but exposing full source is unnecessary for this static production site.

Draft PR #42 sets production source maps to false and makes the production validator fail if any `.map` asset is present. Its generated assets contained zero maps during the full release gate. This is prepared evidence, not current `main` or production state until merged and released.

### 2. Release checkouts follow moving `main` — corrected in draft PR #42

Both workflow jobs use `ref: main`. If `main` advances after dispatch, the build may not correspond to the dispatch SHA, and the deploy job may load scripts from a different revision than the downloaded artifact.

Draft PR #42 requires dispatch from `main`, checks out the immutable dispatch SHA for the build, exposes that exact SHA as a job output and uses it for the deploy-job script checkout. Workflow YAML and explicit checkout invariants passed locally.

### 3. IndexNow can mark an otherwise successful deployment failed — corrected in draft PR #42

IndexNow runs after cPanel activation and smoke. A temporary IndexNow rejection would fail the workflow even though production is healthy, without invoking rollback.

Draft PR #42 makes IndexNow explicitly non-blocking and emits a workflow warning when it fails. It does not change the preceding deployment, smoke or rollback semantics.

### 4. Production governance needs tightening — medium

- `main` currently reports `protected: false` with no enforced status checks.
- The `Production` environment requires one user reviewer and only permits branch `main`, but `prevent_self_review` is false.

Recommended correction: protect `main` and enable prevention of self-review where the plan and team structure support it. These controls do not alter the application artifact.

### 5. Connection proof is not current-day — low

The required variables and secret names still exist, and the last connection test plus protected deployment succeeded on 2026-08-11. GitHub metadata cannot prove today that the cPanel authorized key, host pin or filesystem permissions have not changed.

Recommended correction: after the code/config hardening PR is merged, dispatch `Verify cPanel connection` once. It performs SSH and filesystem prerequisite checks without uploading or changing the website.

## Verified GitHub Prerequisites

| Prerequisite | Current evidence | Status |
| --- | --- | --- |
| `Production` environment | Exists | Pass |
| Required approval | One user reviewer | Pass, but self-review is allowed |
| Deployment branch | Custom policy permits only `main` | Pass |
| Environment variables | `CPANEL_DOCUMENT_ROOT`, `CPANEL_HOST`, `CPANEL_PORT`, `CPANEL_USER`, `PRODUCTION_URL` | Pass by name; values were not exposed |
| Environment secrets | `CPANEL_SSH_KNOWN_HOSTS`, `CPANEL_SSH_PRIVATE_KEY` | Pass by name; values are inaccessible and were not exposed |
| Read-only connection workflow | Run `31538950711` succeeded on 2026-08-11 | Pass historically; rerun for freshness |
| Protected release workflow | Run `31539884737` fully succeeded on 2026-08-11 at `4fdcec59` | Pass historically |
| Current `main` CI | PR #41 Netlify preview/header/redirect checks passed; no repository test check was attached | Partial; the release workflow will execute lint, tests, build and production validation before approval |

## Safe Next Sequence

1. Review draft PR #42 covering source-map policy, immutable workflow checkouts and non-blocking IndexNow behavior.
2. Confirm its Vercel checks and retained local full-gate evidence; add a repository CI requirement only if a genuine repeatable check is configured.
3. Protect `main` and prevent self-review if supported and operationally appropriate.
4. Dispatch the read-only `Verify cPanel connection` workflow.
5. Review the generated deployable artifact and release reason.
6. Only with explicit deployment approval, dispatch `Release public website` for the pinned commit.
7. Re-fingerprint production and repeat GET-only smoke after the workflow completes.
