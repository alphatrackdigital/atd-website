# ChatGPT Web Continuity Handoff

Last reviewed: 2026-08-19

## Purpose

This is the self-contained entry point for continuing the AlphaTrack Digital website and martech continuity project in ChatGPT web. The companion files in this directory contain the evidence-backed project overview, environment map, branch reconciliation, integration register, production verification and restart backlog.

The objective is to finish a comprehensive overview from the beginning of the project through the current pause point, reconcile contradictions across GitHub, Notion and the two ChatGPT Projects, and leave an exact safe resume sequence. This is a documentation and read-only research task unless the owner gives fresh approval for a specific external change.

## Authoritative Snapshot

| Concern | Verified state |
| --- | --- |
| Website repository | `alphatrackdigital/alphatrackdigital` |
| Remote website production source | `main@38f280d0b99a10678de455dac16a671f431d372c` |
| Website test source | `staging@38f280d0b99a10678de455dac16a671f431d372c` |
| Verified live cPanel frontend | `45043ef7b62890f5b8d0057eeef473e4610af44e`, established by byte-identical homepage and critical-asset reconstruction |
| Public frontend | `https://alphatrack.digital` |
| Public API backend | Netlify `alphatra-serv`, sourced from `alphatrackdigital/atd-backend-test` `main@c9035d19e16e77badefaaf1257be5837bc694476` |
| Backend rollback | Netlify deploy at legacy website `backend@9b78288742bcca9e9c74ce15edfb48e9aa0b5c1a` retained during the stability window |
| Frontend release hardening | Draft PR [#42](https://github.com/alphatrackdigital/alphatrackdigital/pull/42), branch `codex/harden-cpanel-release`, current reviewed head `3a46d0cc256e3afda98059aa78c222e574b198fe` |
| PR #42 verification | Open, draft, mergeable on 2026-08-19; retained local release gate passed; new GitHub Actions `PR release gate` completed successfully; Vercel branch deployment is skipped/ignored by the configured branch filter and is not preview-build evidence |
| Production effect of PR #42 | None. It has not been merged and no cPanel production workflow was dispatched. |
| Continuity publication | Draft PR [#43](https://github.com/alphatrackdigital/alphatrackdigital/pull/43), branch `codex/atd-continuity-handoff`; open, draft, clean and mergeable on 2026-08-19 |
| Hosting effect of PR #43 | None. Vercel reported the documentation-branch deployment as skipped/ignored by the configured branch filter; no Netlify build or deployment ran. |

## PR #42 Evidence

PR #42 now:

- disables public **production** source maps while preserving development-mode source maps;
- adds a release validation failure if `.map` files enter the production assets;
- requires production workflow dispatch from `main`;
- pins build and deploy jobs to the same immutable dispatch SHA;
- makes the optional post-deploy IndexNow call non-blocking while retaining a visible warning;
- adds `.github/workflows/pr-release-gate.yml`, a secret-free `pull_request` workflow targeting `main` that runs the existing `npm run release:prepare` gate;
- updates the publishing contract documentation.

Validation evidence:

- retained local `npm run release:prepare` passed;
- 22 test files and 86 tests passed in the retained local gate;
- production validation passed for 39 sitemap routes and the static 404;
- generated production assets contained zero `.map` files;
- workflow YAML parsing and explicit workflow-invariant checks passed;
- ESLint returned no errors and seven pre-existing warnings in the retained local gate;
- GitHub Actions `PR release gate` completed successfully on current PR head `3a46d0cc256e3afda98059aa78c222e574b198fe`.

The Vercel integration status can appear successful while Vercel records the deployment itself as **Skipped Deployment / Ignored** under the configured branch filter. Do not use the Vercel context as the repository's sole required build/code-quality check.

## 2026-08-19 ChatGPT Web Continuation Result

The first read-only web continuation pass is captured in [`CHATGPT_WEB_VERIFICATION_2026-08-19.md`](CHATGPT_WEB_VERIFICATION_2026-08-19.md). It records current connector access, reconciled stale claims, exact branch-protection recommendations, evidence gaps, owner decisions and the safe resume sequence.

The subsequent frontend release/governance pass is captured in [`FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md`](FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md). It records the PR #42 file-level review, source-map scope correction, successful real PR CI run, exact governance recommendation and direct live-to-main comparison.

Key corrections from the continuation passes:

- the PR #42 and PR #43 Vercel results are skipped/ignored deployments rather than successful preview builds;
- PR #42 now contains a real repeatable `PR release gate` suitable to become the required CI check after merge;
- verified live frontend `45043ef7...` is an ancestor of `main@38f280d0...`; the current release delta is 4 commits / 40 files;
- the live commit already contains the admin console and the support-widget exclusion on admin routes, so the 40-file delta does not newly introduce the admin console;
- the backend migration file's PR #2 “open/draft” bullet is pre-merge historical evidence and is superseded by the later 2026-08-18 merge sequence in the same file;
- June Netlify credit/future-hosting statements, early Ketch `NO-GO` records and June Notion production assumptions remain useful historical evidence but are not current-state proof;
- current Brevo state could not be re-audited because the connector returned an account-connection error;
- no Netlify connector was available in the current ChatGPT tool surface;
- current MongoDB Atlas non-sensitive cluster metadata was readable and still shows the documented broad network-access hardening item.

## Local-Only Material Deliberately Excluded

The primary local checkout was not used as a publishing branch because it contains unrelated work:

- a pre-existing edit to `src/pages/ConversionTracking.tsx`;
- two untracked Search Console SQL source files under `reports/`;
- an unrelated untracked `pipx_shared.pth` file.

These items are not part of this continuity handoff. They must not be inferred to be approved, discarded, staged or merged. The SQL files contain query source rather than retained results, so the Search Console findings remain a documented evidence gap.

## ChatGPT Web Sources and Plugins

The owner has relevant connected ChatGPT web plugins/connectors. Use available systems read-only first and record connector limitations rather than filling gaps by assumption:

- **GitHub:** read this pack, repository history, branches, pull requests and workflow results.
- **Notion:** reconcile business-facing decisions and older operational records against Git evidence.
- **Netlify:** if a connector is available in the active tool surface, verify deploy IDs, source bindings, build state and credit implications without triggering builds. If it is unavailable, retain the latest dated GitHub evidence and mark the direct check as a gap.
- **Vercel:** verify test-project bindings, branch filters, previews and aliases without promoting deployments.
- **MongoDB Atlas:** verify only non-sensitive project/cluster/database metadata, collection counts and timestamps where necessary; never reveal values or records.
- **Brevo:** inspect configuration names, lists, attributes, workflow state, credits and exclusions without sending, enrolling or modifying contacts. If account access fails, keep current state unknown rather than relying on stale workflow assumptions.

The ATD Website and ATD MarTech ChatGPT Projects contain useful rationale and planning history. A chat in one Project may not automatically read the other Project's conversations. Use Project history as decision context, not implementation proof; move only reviewed summaries into this GitHub pack.

## Required Read Order

1. [`ATD_RESUME_HERE.md`](ATD_RESUME_HERE.md)
2. [`ATD_PROJECT_OVERVIEW.md`](ATD_PROJECT_OVERVIEW.md)
3. [`FRONTEND_PRODUCTION_VERIFICATION.md`](FRONTEND_PRODUCTION_VERIFICATION.md)
4. [`FRONTEND_RELEASE_DELTA_REVIEW.md`](FRONTEND_RELEASE_DELTA_REVIEW.md)
5. [`FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md`](FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md)
6. [`ATD_BACKEND_MIGRATION_GATE.md`](ATD_BACKEND_MIGRATION_GATE.md)
7. [`registers/GIT_REPOSITORIES_AND_BRANCHES.md`](registers/GIT_REPOSITORIES_AND_BRANCHES.md)
8. [`LEGACY_BRANCH_RECONCILIATION.md`](LEGACY_BRANCH_RECONCILIATION.md)
9. [`registers/MARTECH_INTEGRATIONS.md`](registers/MARTECH_INTEGRATIONS.md)
10. [`registers/OPEN_ITEMS.md`](registers/OPEN_ITEMS.md)
11. [`sources/SOURCE_INVENTORY.md`](sources/SOURCE_INVENTORY.md)
12. [`CHATGPT_WEB_VERIFICATION_2026-08-19.md`](CHATGPT_WEB_VERIFICATION_2026-08-19.md)
13. Detailed technical handoffs under [`../codex-handoffs`](../codex-handoffs)

## Continuation Tasks

1. Owner review/decision on draft PR #42. Do not merge it under the standing safety boundary without fresh explicit approval.
2. After PR #42 is merged, apply the agreed `main` branch protection and Production-environment reviewer settings only with explicit approval. Require the real `PR release gate`, not Vercel as the code-quality gate.
3. Run the read-only `Verify cPanel connection` workflow only with explicit workflow-dispatch approval, then decide whether a production release is wanted. A newer `main` alone is not a reason to deploy.
4. After 2026-08-25, repeat the documented read-only backend stability checkpoint before proposing archival of the legacy `backend` branch.
5. Reconcile current Brevo, GTM, GA4, Meta, Ketch and Clarity state using connected plugins where available, retaining names/status/evidence only and no private data.
6. Review the ATD Website and ATD MarTech Project discussions for rationale, contradictions and decisions missing from the pack.
7. Update the comprehensive overview only when newer evidence supersedes an existing claim. Preserve confidence labels and flag unresolved contradictions.
8. Produce the final resume sequence, owner-decision list and evidence index. Do not silently convert planned or reported work into verified implementation.

## Safety Boundary

Do not merge PRs, dispatch workflows, deploy, change hosting bindings, edit environment variables, modify Atlas access, publish GTM, change Ketch, activate Brevo workflows, register webhooks, send campaigns/messages, submit forms, create bookings, or change Notion without fresh explicit owner approval. Never expose credentials, tokens, cookies, connection strings, environment-variable values, private contacts or unredacted records.
