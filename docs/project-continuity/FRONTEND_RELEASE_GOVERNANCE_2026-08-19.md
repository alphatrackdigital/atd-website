# Frontend Release Governance Continuation — 2026-08-19

## Scope

This record captures the ChatGPT web continuation of Steps 1–4 from the ATD continuity plan. No merge, production workflow dispatch, deployment, branch-protection mutation or Production-environment mutation was performed.

## 1. PR #42 Review and Correction

Draft PR #42 (`codex/harden-cpanel-release`) was reviewed file-by-file.

Verified release-hardening changes:

- production workflow requires manual `workflow_dispatch`;
- confirmation must be exactly `DEPLOY`;
- dispatch must originate from `main`;
- build records the immutable dispatch SHA;
- deploy checks out that same recorded SHA;
- deploy remains bound to the GitHub `Production` environment;
- production smoke failure invokes rollback;
- IndexNow runs after the smoke and is best-effort/non-blocking;
- production validation fails if public `.map` assets are present.

One small scope mismatch was corrected during review: the first draft set `sourcemap: false` for every Vite mode although the policy is production-only. Current PR head preserves development-mode maps with `sourcemap: mode !== "production"` while production remains map-free.

Current reviewed PR #42 head: `3a46d0cc256e3afda98059aa78c222e574b198fe`.

## 2. Genuine Pull-Request CI Added

A new workflow was added to PR #42:

- path: `.github/workflows/pr-release-gate.yml`;
- trigger: `pull_request` targeting `main`;
- permissions: `contents: read` only;
- no Production environment and no production secrets;
- Node.js 22 + `npm ci`;
- executes the existing `npm run release:prepare` gate;
- concurrency cancels superseded runs for the same PR.

The workflow is named `PR release gate` and completed successfully on PR #42 head `3a46d0cc...` on 2026-08-19.

This is now the appropriate future required CI check. The existing Vercel status must not be used as the sole required build check because the repository branch filter can report a successful integration status for an intentionally skipped deployment.

## 3. Exact Main/Production Governance Recommendation

Not applied in this pass.

### `main`

After PR #42 is merged so the workflow exists on the base branch:

1. require a pull request before merging;
2. require the `PR release gate` check;
3. require conversation resolution;
4. dismiss stale approvals when new commits are pushed;
5. require at least one approval where staffing permits;
6. block force pushes;
7. block branch deletion;
8. restrict direct pushes to the smallest practical maintainer set;
9. do not require the Vercel context as the repository's code-quality gate;
10. consider requiring branches to be up to date only after the new CI has proven stable.

### `Production` environment

1. keep deployment branches restricted to `main`;
2. keep at least one required reviewer;
3. prefer a reviewer other than the dispatch initiator;
4. enable prevention of self-review only if another eligible reviewer is reliably available;
5. keep all cPanel credentials and configuration values scoped to the environment.

## 4. Verified Live-to-Main Release Delta

GitHub comparison from verified live cPanel source `45043ef7b62890f5b8d0057eeef473e4610af44e` to repository `main@38f280d0b99a10678de455dac16a671f431d372c` shows:

- relationship: live commit is an ancestor of `main`;
- `main` is 4 commits ahead;
- total changed files: 40.

The delta is dominated by:

- protected cPanel publishing, rollback and connection-verification tooling;
- prerender/SSR/hydration corrections;
- static 404 and clean-route handling;
- SEO/canonical/sitemap/IndexNow work;
- local font and image optimizations;
- homepage/header/footer accessibility and performance refinements;
- release validation/package/smoke tooling.

### Admin/CMS clarification

The verified live commit `45043ef7` already contains the admin console and the fix that prevents the Brevo support widget from loading on admin routes. Therefore the 40-file live-to-main release delta does **not** newly introduce the admin console.

A direct `src/App.tsx` comparison confirms that the admin routes and route-aware support-widget exclusion are present in both live `45043ef7` and `main@38f280d0`. The material `App.tsx` release change is the client-only Sonner/toaster handling used to avoid SSR/hydration mismatch.

The broader product question—whether the current admin/blog system should become a complete managed public CMS publishing path—remains a separate product backlog item, not a blocker created by this 40-file release delta.

## Current Release Recommendation

**Code/content delta: suitable in intent. Governance state: HOLD until the following are explicitly approved/completed.**

1. Owner review/approval to merge PR #42.
2. Merge PR #42 without dispatching Production.
3. Apply the agreed `main`/Production governance settings.
4. Run the read-only `Verify cPanel connection` workflow for current-day freshness.
5. Confirm the exact release SHA and release reason.
6. Only with separate explicit production-release approval, dispatch `Release public website`.
7. Re-fingerprint the public site and run post-release GET-only verification.

No production release is necessary merely because `main` is newer than the current public fingerprint.
