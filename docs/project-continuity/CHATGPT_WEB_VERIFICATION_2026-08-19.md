# ChatGPT Web Verification Reconciliation — 2026-08-19

## Purpose

This record captures the read-only continuation pass performed from ChatGPT web after `CHATGPT_WEB_HANDOFF.md` was published. It does not replace the historical handoffs. It records newer evidence, marks stale statements as superseded, and leaves an exact safe resume sequence.

Evidence labels used below:

- **Verified current implementation/state:** directly observed in the current repository or a connected system during this pass.
- **Dated historical evidence:** valid evidence for a named date/environment, but not assumed current.
- **Developer/owner claim:** a statement preserved from a handoff, issue, discussion, or operational note that was not independently reverified here.
- **Planning/discussion:** intent, recommendation, campaign/design direction, or proposed architecture; not implementation proof.
- **Unknown:** insufficient current evidence.

## Sources Successfully Accessed

### GitHub — current, read-only

Verified:

- PR #43 is open, draft, unmerged and documentation-only.
- Required continuity files on `codex/atd-continuity-handoff` were read in the prescribed order.
- Current website `main` remains `38f280d0b99a10678de455dac16a671f431d372c`.
- GitHub currently reports `main` as unprotected, with required status-check enforcement off.
- PR #42 remains open, draft, mergeable and unmerged at `3ae5c386bc28c8c86bafaadbd1e73cfd2adb9d53`.
- PR #42 production workflow code still requires `workflow_dispatch`, literal `DEPLOY`, dispatch from `main`, and a `Production` environment before the deploy job can run.
- Build and deploy jobs in PR #42 use the same recorded release SHA.
- IndexNow is best-effort after the production smoke and cannot convert an otherwise healthy deployment into a failed production result.
- PR #42 and PR #43 each received a Vercel bot result explicitly described as a **Skipped Deployment / Ignored** deployment.

### Notion — current connector access, dated content

The AlphaTrack Digital workspace was accessible read-only. Directly fetched records include:

- `ATD Internal Martech Project` — last observed update 2026-06-29.
- `ATD Notion Database Audit - 2026-06-29`.

These records are useful for decisions and launch-gate history. Their production-state statements are dated and are superseded where August Git/live evidence is stronger.

### Vercel — current, read-only

Two projects were observed:

- `atd-website-test`
- `atd-backend-test`

Frontend findings:

- PR #42 head `3ae5c386...` has a Vercel deployment record in `CANCELED`/ignored state because the branch was skipped by the configured build filter.
- PR #43 head `36fb7be5...` is likewise `CANCELED`/ignored by the filter.
- The latest retained READY frontend artifact in the inspected history is from `main@15b9febd...`; it must not be treated as proof that current website `main@38f280d0...` is on the Vercel test alias.
- Vercel is not the public frontend production host.

Backend findings:

- The `atd-backend-test` project has a READY deployment sourced from canonical backend `main@c9035d19...`.
- This corroborates repository lineage for the backend test project. It does not replace Netlify evidence for the public `alphatra-serv` production binding.

### MongoDB Atlas — current metadata, read-only

Verified without exposing credentials, connection strings, records or private values:

- one ATD Atlas project is visible;
- cluster `cluster4ATD` is running on the Free tier;
- MongoDB version is `8.0.29`;
- the cluster is healthy/idle at the time of inspection;
- a broad open-internet network access rule still exists.

The application-user privilege level and record counts were **not** re-queried in this pass. The August migration-pack counts remain dated historical evidence, not a new current observation.

### Brevo — connector present, current audit unavailable

A read-only list request returned an account-connection error. No mutation-capable action was attempted. Current Brevo workflow state, credits, exclusions, senders, attributes, webhooks and list health therefore remain **unknown for 2026-08-19** and must not be inferred from June/July evidence.

### Netlify — connector unavailable in this ChatGPT tool surface

No installable Netlify plugin was exposed in the current connector surface. The latest Netlify production/backend binding evidence therefore remains the dated 2026-08-18 GitHub continuity evidence. No build, deploy or setting was triggered.

### ChatGPT Project discussions — partial visibility only

The ATD Website Project context available in this conversation contains planning/history around Meta campaign strategy, Figma post-launch work, hosting/Netlify costs and related website decisions. The continuity source inventory also records additional Website and MarTech Project conversation titles.

Full cross-Project transcript access is not available through the current connector set. Project discussions are therefore used as rationale/planning evidence only unless corroborated by GitHub, live-system evidence or Notion.

## Contradictions and Stale Claims Reconciled

### 1. PR #42 Vercel “preview passed” wording

**Stale/incorrect wording:** earlier continuity text said the draft PR produced a successful Vercel frontend preview or that “Vercel preview checks passed.”

**Current evidence:** GitHub/Vercel show **Skipped Deployment / Ignored** for PR #42. The GitHub Vercel commit status can be green/successful even though no preview build was produced.

**Reconciled state:** PR #42 has retained local release-gate evidence and a successful *Vercel integration status*, but **no Vercel preview artifact was built for the PR branch**.

### 2. Backend PR #2 “open, draft” statement

`ATD_BACKEND_MIGRATION_GATE.md` retains a pre-merge candidate-evidence bullet saying PR #2 was open/draft/mergeable. The same document later records the newer sequence: PR #2 was marked ready and merged on 2026-08-18, then PR #3 was merged and canonical backend `main@c9035d19...` became the current source.

**Reconciled state:** the “open, draft” line is **dated pre-merge evidence**, not current status.

### 3. June Netlify credit blocker / “future live target” statements

June handoffs record Netlify deployment credits as blocked and, in some sections, describe Netlify as a future website live target.

**Reconciled state:** those are historical. The August operating model is:

- public frontend: Namecheap/cPanel static site;
- public API backend: Netlify `alphatra-serv`;
- Vercel: controlled test ground;
- Netlify frontend project: retained test mirror with automatic builds stopped.

### 4. Ketch June `NO-GO` versus later consent evidence

Early June 24–25 preview QA recorded real pre-consent failures and a `NO-GO / BLOCKED` result. Later June 29–30 evidence records GTM Version 9, corrected Consent Mode propagation, Clarity gating, and passing test-ground consent scenarios.

**Reconciled state:** the early `NO-GO` remains valid historical failure evidence; it is superseded for the test ground by later remediation. It does **not** prove current production consent behavior. Production consent QA remains open.

### 5. Notion June “confirm corrected production build is live”

The June 29 Notion project still lists confirmation of the corrected Namecheap/cPanel build as a current focus.

**Reconciled state:** August byte-identical reconstruction now establishes the public frontend as `45043ef7...` with high confidence. Current repository `main@38f280d0...` is newer and is **not verified live**.

### 6. WordPress / Next.js / older hosting assumptions

Older planning and prompt material referenced WordPress, Next.js, or different hosting targets.

**Reconciled state:** repository evidence establishes a Vite + React + TypeScript frontend, with cPanel static production and a separate API backend. No current managed CMS implementation is evidenced.

### 7. Legacy website `backend` branch as production source

Historical documents and Notion records point to the legacy website `backend` branch as the production backend source.

**Reconciled state:** the public backend was migrated on 2026-08-18 to canonical repository `alphatrackdigital/atd-backend-test` `main@c9035d19...`; the legacy deployment is retained only as rollback evidence during the stability window.

## Current Evidence-Backed Website and Martech State

| Area | Classification | Current conclusion |
| --- | --- | --- |
| Public frontend commit | Verified current live state | cPanel public site strongly fingerprints to `45043ef7...`; current `main@38f280d0...` is not verified live. |
| Frontend source | Verified current repository state | `main` and controlled `staging` are at `38f280d0...`. |
| Frontend release hardening | Verified current repository state | Draft PR #42 contains the hardening; it has no production effect while unmerged/undispatched. |
| Backend source | Verified current repository/Vercel lineage + dated Netlify evidence | Canonical backend is `atd-backend-test/main@c9035d19...`; public Netlify binding was verified on 2026-08-18. |
| Backend stability | Dated live evidence / still observing | Initial and follow-up read-only gates passed 2026-08-18; closing checkpoint is intentionally not due before 2026-08-25. |
| Website stack | Verified implementation | Vite, React, TypeScript, React Router, Tailwind and shadcn/Radix. |
| Admin/CMS | Verified implementation + known product gap | Admin/blog backend exists, but public blog still uses repository data; no completed managed-CMS/public-admin publishing path is evidenced. |
| Lead capture | Verified implementation; dated QA | Contact, Tracking Audit, Newsletter, Exit Popup and Strategy Call handlers/routes exist; June/July controlled QA exists. Do not treat that as current production flow proof. |
| Brevo contacts/lists/workflows | Implementation verified; current external state unknown | Code/contracts exist and dated Brevo QA exists. Current connector audit failed; exclusions/workflow state must be rechecked before launch. |
| GTM | Implementation + dated external evidence | Container contract exists; Version 9 was reported/published and test-ground evidence passed later June checks. Current production state still needs verification. |
| GA4 | Implementation + dated external evidence | Browser route/conversion contract and meeting Measurement Protocol implementation exist; dated Realtime/test evidence exists. Current production conversion delivery remains open. |
| Meta Pixel/CAPI | Verified implementation; current external proof open | Browser/server event-ID pairing and CAPI handlers exist. Production Events Manager deduplication proof remains open. |
| Ketch | Verified implementation + dated test evidence | Consent bridge/remediation exists; production six-scenario matrix remains open. |
| Clarity | Dated external evidence | Reported/published through GTM under analytics consent; current production load/masking/settings need verification. |
| Google Ads | Partial readiness | Conversion Linker / GA4-linked audience source evidence exists; paid conversion setup and billing remain intentionally deferred. |
| Atlas | Current metadata verified | Free cluster running; broad network access remains. Least privilege/network/backup hardening belongs after migration stability. |
| Search Console | Evidence gap | SQL source files exist locally; retained result output was not present in the continuity pack. |
| Notion Agency OS | Dated operational source | Workspace/pages exist, but June production assumptions require evidence-backed refresh before being treated current. |
| Meta pilot | Planning + implementation prep | Tracking Audit campaign/lander work exists. Paid launch remains gated by production release, consent, Brevo and Meta verification. |

## PR #42 Release-Safety Verification

The current PR #42 workflow cannot deploy merely because the pull request is merged:

1. production release starts only from manual `workflow_dispatch`;
2. the confirmation input must be exactly `DEPLOY`;
3. the workflow rejects a dispatch whose ref is not `main`;
4. the build records one immutable release SHA;
5. the deploy job checks out that exact recorded SHA;
6. the deploy job is bound to the GitHub `Production` environment;
7. production smoke failure triggers rollback;
8. IndexNow failure is non-blocking after the smoke.

This is code-level verification only. Environment reviewer rules were not independently re-read through the current GitHub connector, so the prior continuity record describing one reviewer and self-review allowed remains **dated evidence**, not a newly verified setting.

## Exact Branch-Protection Recommendation

Do not apply these settings without owner approval.

For `main`:

1. Enable branch protection / ruleset protection.
2. Require pull requests before merge.
3. Require at least one approval where team staffing makes this practical.
4. Dismiss stale approvals when new commits are pushed.
5. Require conversation resolution for review threads.
6. Block force pushes and branch deletion.
7. Restrict direct pushes to the smallest practical maintainer set.
8. Do **not** make the current `Vercel` context a required code-quality/build check: PR #42 and PR #43 prove it can report success while the deployment is intentionally skipped.
9. First add a genuine repeatable GitHub Actions PR CI check (for example install, lint, tests and production/release validation), then require that named CI check.
10. Require branches to be up to date before merge only after the required CI is stable enough that this does not create avoidable deadlocks.

For the `Production` environment:

1. Keep production deployment restricted to `main`.
2. Require at least one reviewer.
3. Prefer a reviewer other than the dispatch initiator.
4. Enable prevention of self-review only when another eligible reviewer is reliably available; do not create a solo-operator deadlock.
5. Keep production secrets/variables scoped to the environment and never duplicate values into repository documentation.

## Evidence Gaps Remaining

- Current Netlify account/deploy binding could not be independently re-read because no Netlify connector is available in this tool surface.
- Current Brevo account state could not be re-read because the connector returned an account-connection error.
- Current GTM, GA4, Meta, Ketch and Clarity live dashboards were not directly available in this connector set.
- Production six-scenario consent QA has not been rerun against the fingerprinted cPanel production build.
- Current Meta Browser/Server deduplication in Events Manager remains unverified.
- Current Brevo exclusions, workflow state, credits, domains/senders and transactional webhook registration remain unverified.
- Search Console query results remain absent from the retained GitHub pack.
- Full ATD Website and ATD MarTech ChatGPT Project transcripts are not directly readable cross-Project through the current tools; only visible context, title inventory and mirrored GitHub/Notion summaries can be reconciled here.
- GitHub `Production` environment reviewer/self-review settings were not independently re-read during this pass.
- Atlas application-user privilege level and production collection counts were not re-queried; the 2026-08-18 migration evidence remains the last retained proof.

## Timing Constraint: Backend Stability

Today is 2026-08-19. The documented closing backend checkpoint must **not** be treated as due before 2026-08-25. No legacy-backend archive/deletion step should be proposed as completed before that checkpoint passes and no operational failure has been reported.

## Exact Resume Sequence

1. Review PR #42 as a code/documentation change; treat its Vercel result as a skipped deployment, not a preview build.
2. Add/agree a genuine PR CI check, then decide and apply `main` protection and Production reviewer hardening only with explicit approval.
3. Do not release current `main` merely to “catch up.” If a production release is wanted, first decide whether the 40-file delta and admin/CMS product gap are acceptable for that release.
4. Before paid traffic, perform a current read-only Brevo audit when connector access is restored: lists 7–14, test/suppression exclusions, workflow statuses/internals, sender/domain state, credits and webhook registration.
5. Re-run the production consent/tracking matrix against the confirmed public build: Ketch choices, GTM, GA4, Meta, Clarity and Conversion Linker behavior.
6. Verify Meta Browser/Server event-ID matching and deduplication for the agreed conversion path without unnecessary duplicate live submissions.
7. Make the owner decision on whether another controlled Book-a-call proof is required; do not book merely to fill a documentation gap.
8. On or after 2026-08-25, run the documented read-only backend stability checkpoint. Only after a pass should legacy backend archival/deletion be considered.
9. Review Search Console retained query results when available and turn only evidenced findings into an SEO backlog.
10. Refresh Notion only with evidence-backed status changes after the technical state is settled.
11. Launch the controlled Tracking Audit Meta pilot only after production, consent, Brevo and Meta gates are green.
12. Convert verified work into the internal case study/SOP; retain unknowns as unknowns.

## Owner Decisions Still Required

- Whether to merge PR #42 after review.
- Which genuine CI check should become required before `main` merges.
- Whether Production must prevent self-review given the available reviewer pool.
- Whether/when to release the current frontend delta to cPanel.
- Whether the Book-a-call CRM/custom-webhook proof gap warrants another controlled booking.
- Whether to retain or retire the separate Netlify frontend mirror and the legacy GitHub Pages test site.
- Whether a managed CMS/public-admin publishing path is still a product requirement.
- After the 2026-08-25 checkpoint, whether to archive/delete the legacy website `backend` branch.
- When paid Meta pilot traffic may start after all launch gates are evidenced.

## Evidence Index

Primary current continuity sources:

- `CHATGPT_WEB_HANDOFF.md`
- `ATD_RESUME_HERE.md`
- `ATD_PROJECT_OVERVIEW.md`
- `FRONTEND_PRODUCTION_VERIFICATION.md`
- `FRONTEND_RELEASE_DELTA_REVIEW.md`
- `ATD_BACKEND_MIGRATION_GATE.md`
- `LEGACY_BRANCH_RECONCILIATION.md`
- `registers/GIT_REPOSITORIES_AND_BRANCHES.md`
- `registers/MARTECH_INTEGRATIONS.md`
- `registers/OPEN_ITEMS.md`
- `sources/SOURCE_INVENTORY.md`

Detailed historical/technical sources used in this continuation include:

- `../codex-handoffs/ATD_MASTER_CODEX_WORKLOG.md`
- `../codex-handoffs/WEBSITE_AND_TRACKING_STATE.md`
- `../codex-handoffs/BREVO_CURRENT_STATE.md`
- `../codex-handoffs/OPEN_ITEMS_FOR_NEXT_AGENT.md`
- `../codex-handoffs/TECHNICAL_CHANGELOG.md`

External read-only evidence used during this pass:

- GitHub PR #42, PR #43, current `main`, PR comments and release workflow source.
- Vercel frontend/backend project and deployment history.
- Notion `ATD Internal Martech Project` and `ATD Notion Database Audit - 2026-06-29`.
- MongoDB Atlas non-sensitive cluster/network metadata.

No external system was modified while collecting this evidence.
