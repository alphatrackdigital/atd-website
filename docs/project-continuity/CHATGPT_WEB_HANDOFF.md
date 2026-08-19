# ChatGPT Web Continuity Handoff

Last reviewed: 2026-08-20

## Purpose

This is the self-contained entry point for continuing the AlphaTrack Digital website and martech continuity project in ChatGPT web. The companion files in this directory contain the evidence-backed project overview, environment map, branch reconciliation, integration register, production verification and restart backlog.

The objective is to maintain a comprehensive evidence-backed overview from the beginning of the project through the current pause point, reconcile contradictions across GitHub, Notion and the two ChatGPT Projects, and leave an exact safe resume sequence. Project history is decision context; implementation claims must be corroborated by current evidence.

## Authoritative Snapshot

| Concern | Verified state |
| --- | --- |
| Website repository | `alphatrackdigital/alphatrackdigital` |
| Repository production source | protected `main@02eadaf8949a08d46952bbea677b9e2ea212fc48` |
| Website test source | controlled `staging@38f280d0b99a10678de455dac16a671f431d372c` unless newer evidence supersedes it |
| Current cPanel frontend release | protected release ID `02eadaf8949a`, full SHA `02eadaf8949a08d46952bbea677b9e2ea212fc48`, successful `Release public website #2` on 2026-08-20 |
| Previous byte-identical cPanel fingerprint | `45043ef7b62890f5b8d0057eeef473e4610af44e`; superseded operationally by the successful protected release, but a new independent byte-identical fingerprint has not yet been reconstructed |
| Public frontend | `https://alphatrack.digital` |
| Public API backend | Netlify `alphatra-serv`, sourced from `alphatrackdigital/atd-backend-test` `main@c9035d19e16e77badefaaf1257be5837bc694476` based on latest continuity evidence |
| Backend rollback | legacy Netlify deploy/source retained through the documented backend stability window |
| Frontend release hardening | PR #42 merged; protected release workflow, immutable SHA pinning, production sourcemap rejection, rollback-on-smoke-failure and best-effort IndexNow are in `main` |
| PR CI / branch governance | active `Protect main` ruleset; PRs required, `PR release gate` required, conversation resolution required, force pushes and branch deletion blocked; GitHub reports `main` protected |
| Protected manual rollback | PR #44 merged; `Roll back public website` available on `main` with explicit confirmation, release-ID/current-marker validation, Production approval, shared concurrency, incident-state preservation and GET-only post-rollback smoke |
| cPanel connectivity | fresh read-only verification passed after Production approval on 2026-08-19 |
| Production release | `Release public website #2` succeeded after build/package validation and Production approval; artifacts `cpanel-package-02eadaf8949a` and `deployable-site-02eadaf8949a` were produced |
| Production martech readiness | **OPEN/HOLD** pending browser-level consent/tracking verification and current Brevo evidence |
| Continuity publication | draft PR #43, `codex/atd-continuity-handoff`; documentation-only |

## 2026-08-19/20 Continuation Results

The initial read-only reconciliation is captured in [`CHATGPT_WEB_VERIFICATION_2026-08-19.md`](CHATGPT_WEB_VERIFICATION_2026-08-19.md).

The release-governance sequence is captured in [`FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md`](FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md).

The protected post-deploy rollback guard is captured in [`PRODUCTION_ROLLBACK_GUARD_2026-08-19.md`](PRODUCTION_ROLLBACK_GUARD_2026-08-19.md).

The successful protected production release is captured in [`FRONTEND_PRODUCTION_RELEASE_2026-08-20.md`](FRONTEND_PRODUCTION_RELEASE_2026-08-20.md).

Key current conclusions:

- PR #42 merged after a successful real `PR release gate`;
- the owner created the active `Protect main` ruleset and GitHub reports `main` protected;
- the fresh read-only cPanel verification passed;
- PR #44 added the protected manual rollback workflow and passed the required PR gate before merge;
- protected `main` is now `02eadaf8949a08d46952bbea677b9e2ea212fc48`;
- `Release public website #2` built, packaged and deployed that release successfully after Production approval;
- the successful release supersedes the older production state operationally, but this session has not reconstructed a new byte-identical public fingerprint;
- a later ChatGPT web fetch reached the public AlphaTrack marketing homepage, which is supporting reachability evidence rather than byte-level deployment proof;
- deployment success does not prove Ketch/GTM/GA4/Meta/Clarity/Brevo consent-state correctness;
- current Brevo state remains unresolved because a usable Brevo connector is not available in the current session;
- no Netlify connector is available in the current ChatGPT tool surface;
- MongoDB Atlas broad network-access hardening remains a documented later infrastructure item;
- paid Tracking Audit traffic remains on hold until the production martech/consent gates are explicitly green or residual gaps are accepted by the owner.

## Local-Only Material Deliberately Excluded

Earlier local continuity evidence recorded unrelated/unapproved material that must remain separate from this pack unless specifically reviewed:

- a pre-existing edit to `src/pages/ConversionTracking.tsx`;
- Search Console SQL source files under `reports/` without retained query-result evidence;
- an unrelated `pipx_shared.pth` file.

Do not infer these items to be approved, discarded, staged or merged.

## ChatGPT Web Sources and Plugins

Use available systems read-only first and record connector limitations rather than filling gaps by assumption:

- **GitHub:** repository history, branches, pull requests, workflow evidence and this continuity pack.
- **Notion:** reconcile business-facing decisions and older operational records against Git evidence.
- **Netlify:** if a connector becomes available, verify deploy IDs, source bindings, build state and credit implications without triggering builds.
- **Vercel:** verify test-project bindings, branch filters, previews and aliases without promoting deployments.
- **MongoDB Atlas:** verify only non-sensitive project/cluster/database metadata, collection counts and timestamps where necessary; never reveal values or records.
- **Brevo:** inspect configuration names, lists, attributes, workflow state, credits and exclusions without sending, enrolling or modifying contacts. If account access fails, keep current state unknown.

The ATD Website and ATD MarTech ChatGPT Projects contain useful rationale and planning history. Use Project history as decision context, not implementation proof; move only reviewed summaries into this GitHub pack.

## Required Read Order

1. [`ATD_RESUME_HERE.md`](ATD_RESUME_HERE.md)
2. [`ATD_PROJECT_OVERVIEW.md`](ATD_PROJECT_OVERVIEW.md)
3. [`FRONTEND_PRODUCTION_VERIFICATION.md`](FRONTEND_PRODUCTION_VERIFICATION.md)
4. [`FRONTEND_RELEASE_DELTA_REVIEW.md`](FRONTEND_RELEASE_DELTA_REVIEW.md)
5. [`FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md`](FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md)
6. [`PRODUCTION_ROLLBACK_GUARD_2026-08-19.md`](PRODUCTION_ROLLBACK_GUARD_2026-08-19.md)
7. [`FRONTEND_PRODUCTION_RELEASE_2026-08-20.md`](FRONTEND_PRODUCTION_RELEASE_2026-08-20.md)
8. [`ATD_BACKEND_MIGRATION_GATE.md`](ATD_BACKEND_MIGRATION_GATE.md)
9. [`registers/GIT_REPOSITORIES_AND_BRANCHES.md`](registers/GIT_REPOSITORIES_AND_BRANCHES.md)
10. [`LEGACY_BRANCH_RECONCILIATION.md`](LEGACY_BRANCH_RECONCILIATION.md)
11. [`registers/MARTECH_INTEGRATIONS.md`](registers/MARTECH_INTEGRATIONS.md)
12. [`registers/OPEN_ITEMS.md`](registers/OPEN_ITEMS.md)
13. [`sources/SOURCE_INVENTORY.md`](sources/SOURCE_INVENTORY.md)
14. [`CHATGPT_WEB_VERIFICATION_2026-08-19.md`](CHATGPT_WEB_VERIFICATION_2026-08-19.md)
15. Detailed technical handoffs under [`../codex-handoffs`](../codex-handoffs)

## Current Safe Resume Sequence

1. Treat the frontend release/governance gate as passed; do not redeploy merely to repeat the release.
2. Run the browser-level production consent/tracking matrix: fresh visit, reject all, accept all, analytics-only, targeted-only and persistence.
3. Verify Ketch consent state and GTM consent-mode behavior for each scenario.
4. Verify GA4, Meta, Clarity, Conversion Linker and Brevo Conversations only fire under intended consent states.
5. Verify the Tracking Audit landing page on desktop and mobile, including campaign-UTM loading, without submitting forms unless separately approved.
6. Restore/read current Brevo evidence when connector access is available: lists 7–14, nurture/workflow state, exclusions/suppression, sender/domain status, trigger/exit conditions, credits and webhook registration.
7. Verify Meta Browser/Server `event_id` matching and deduplication only if a controlled conversion submission is separately approved; avoid unnecessary duplicate live submissions.
8. Decide whether another controlled Book-a-call proof is necessary; otherwise retain the accepted evidence gap.
9. On/after the documented backend stability checkpoint date, repeat the read-only backend gate before proposing legacy-backend archival.
10. Reconcile Search Console evidence and build an evidence-backed SEO backlog.
11. Refresh Notion only from verified current state.
12. Launch controlled Tracking Audit Meta pilot only after production consent/tracking, Brevo and Meta gates are explicitly green or the owner accepts remaining gaps.
13. Keep the protected `Roll back public website` workflow available for post-release regressions; do not use it without explicit incident evidence and owner approval.

## Safety Boundary

Do not dispatch another production release or rollback, change hosting bindings, edit environment variables, modify Atlas access, publish GTM, change Ketch, activate Brevo workflows, register webhooks, send campaigns/messages, submit forms, create bookings, or change Notion without fresh explicit owner approval. Never expose credentials, tokens, cookies, connection strings, environment-variable values, private contacts or unredacted records.
