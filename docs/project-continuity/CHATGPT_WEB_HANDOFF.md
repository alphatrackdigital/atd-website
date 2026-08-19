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
| Frontend release hardening | Draft PR [#42](https://github.com/alphatrackdigital/alphatrackdigital/pull/42), branch `codex/harden-cpanel-release`, head `3ae5c386bc28c8c86bafaadbd1e73cfd2adb9d53` |
| PR #42 verification | Open, draft, mergeable/clean on 2026-08-19; full local release gate passed; Vercel preview checks passed |
| Production effect of PR #42 | None. It has not been merged and no cPanel production workflow was dispatched. |

## PR #42 Evidence

PR #42:

- disables public production source maps;
- adds a release validation failure if `.map` files enter the production assets;
- requires production workflow dispatch from `main`;
- pins build and deploy jobs to the same immutable dispatch SHA;
- makes the optional post-deploy IndexNow call non-blocking while retaining a visible warning;
- updates the publishing contract documentation.

Validation completed before publication:

- `npm run release:prepare` passed;
- 22 test files and 86 tests passed;
- production validation passed for 39 sitemap routes and the static 404;
- generated production assets contained zero `.map` files;
- workflow YAML parsing and explicit workflow-invariant checks passed;
- ESLint returned no errors and seven pre-existing warnings.

Opening the draft PR automatically produced a successful Vercel frontend preview. No Netlify build ran, no Netlify credit was consumed, and no live site was changed.

## Local-Only Material Deliberately Excluded

The primary local checkout was not used as a publishing branch because it contains unrelated work:

- a pre-existing edit to `src/pages/ConversionTracking.tsx`;
- two untracked Search Console SQL source files under `reports/`;
- an unrelated untracked `pipx_shared.pth` file.

These items are not part of this continuity handoff. They must not be inferred to be approved, discarded, staged or merged. The SQL files contain query source rather than retained results, so the Search Console findings remain a documented evidence gap.

## ChatGPT Web Sources and Plugins

The owner has relevant connected ChatGPT web plugins, including GitHub, Notion, Netlify, Vercel, MongoDB Atlas and Brevo. Use them read-only first:

- **GitHub:** read this pack, repository history, branches, pull requests and workflow results.
- **Notion:** reconcile business-facing decisions and older operational records against Git evidence.
- **Netlify:** verify deploy IDs, source bindings, build state and credit implications without triggering builds.
- **Vercel:** verify test-project bindings, branch filters, previews and aliases without promoting deployments.
- **MongoDB Atlas:** verify only non-sensitive project/cluster/database metadata, collection counts and timestamps where necessary; never reveal values or records.
- **Brevo:** inspect configuration names, lists, attributes, workflow state, credits and exclusions without sending, enrolling or modifying contacts.

The ATD Website and ATD MarTech ChatGPT Projects contain useful rationale and planning history. A chat in one Project may not automatically read the other Project's conversations. Use Project history as decision context, not implementation proof; move only reviewed summaries into this GitHub pack.

## Required Read Order

1. [`ATD_RESUME_HERE.md`](ATD_RESUME_HERE.md)
2. [`ATD_PROJECT_OVERVIEW.md`](ATD_PROJECT_OVERVIEW.md)
3. [`FRONTEND_PRODUCTION_VERIFICATION.md`](FRONTEND_PRODUCTION_VERIFICATION.md)
4. [`FRONTEND_RELEASE_DELTA_REVIEW.md`](FRONTEND_RELEASE_DELTA_REVIEW.md)
5. [`ATD_BACKEND_MIGRATION_GATE.md`](ATD_BACKEND_MIGRATION_GATE.md)
6. [`registers/GIT_REPOSITORIES_AND_BRANCHES.md`](registers/GIT_REPOSITORIES_AND_BRANCHES.md)
7. [`LEGACY_BRANCH_RECONCILIATION.md`](LEGACY_BRANCH_RECONCILIATION.md)
8. [`registers/MARTECH_INTEGRATIONS.md`](registers/MARTECH_INTEGRATIONS.md)
9. [`registers/OPEN_ITEMS.md`](registers/OPEN_ITEMS.md)
10. [`sources/SOURCE_INVENTORY.md`](sources/SOURCE_INVENTORY.md)
11. Detailed technical handoffs under [`../codex-handoffs`](../codex-handoffs)

## Continuation Tasks

1. Review PR #42 and its preview read-only. Confirm the release workflow still requires explicit dispatch and Production approval and cannot deploy merely because the PR is merged.
2. Recommend exact `main` branch protection and Production-environment reviewer settings based on checks that genuinely exist. Do not apply them without approval.
3. After 2026-08-25, repeat the documented read-only backend stability checkpoint before proposing archival of the legacy `backend` branch.
4. Reconcile current Brevo, GTM, GA4, Meta, Ketch and Clarity state using connected plugins where available, retaining names/status/evidence only and no private data.
5. Review the ATD Website and ATD MarTech Project discussions for rationale, contradictions and decisions missing from the pack.
6. Update the comprehensive overview only when newer evidence supersedes an existing claim. Preserve confidence labels and flag unresolved contradictions.
7. Produce the final resume sequence, owner-decision list and evidence index. Do not silently convert planned or reported work into verified implementation.

## Safety Boundary

Do not merge PRs, dispatch workflows, deploy, change hosting bindings, edit environment variables, modify Atlas access, publish GTM, change Ketch, activate Brevo workflows, register webhooks, send campaigns/messages, submit forms, create bookings, or change Notion without fresh explicit owner approval. Never expose credentials, tokens, cookies, connection strings, environment-variable values, hashes, private contacts or unredacted records.
