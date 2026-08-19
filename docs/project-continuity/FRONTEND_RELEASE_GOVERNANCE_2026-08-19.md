# Frontend Release Governance Continuation — 2026-08-19

## Scope

This record captures the ChatGPT web continuation of Steps 1–4 from the ATD continuity plan plus the owner's subsequent authorization to merge PR #42, apply the agreed GitHub governance controls where possible, run the read-only cPanel verification, add a protected manual rollback workflow, and finally authorize the protected cPanel production release.

## 1. PR #42 Review, Correction and Merge

PR #42 (`codex/harden-cpanel-release`) was reviewed file-by-file before merge.

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

One small scope mismatch was corrected during review: the first draft set `sourcemap: false` for every Vite mode although the policy is production-only. The merged change preserves development-mode maps with `sourcemap: mode !== "production"` while production remains map-free.

The genuine PR CI gate completed successfully on reviewed head `3a46d0cc256e3afda98059aa78c222e574b198fe` before merge.

Owner authorization was received on 2026-08-19. GitHub initially rejected the merge because PR #42 was still marked draft. It was changed to Ready for Review and then squash-merged successfully.

PR #42 merge commit: `b1a3207ff520829085711d526f678bda53ac1421`.

## 2. Genuine Pull-Request CI

The merged workflow is:

- path: `.github/workflows/pr-release-gate.yml`;
- trigger: `pull_request` targeting `main`;
- permissions: `contents: read` only;
- no Production environment and no production secrets;
- Node.js 22 + `npm ci`;
- executes the existing `npm run release:prepare` gate;
- concurrency cancels superseded runs for the same PR.

The workflow is named `PR release gate` and is the appropriate required CI check. The existing Vercel context must not be used as the repository's code-quality gate because the configured Vercel branch filter can report a successful integration status for an intentionally skipped deployment.

## 3. Main/Production Governance

The owner created an active `Protect main` ruleset in GitHub with the agreed settings:

- default branch targeted;
- repository-admin bypass limited to pull requests only;
- branch deletion restricted;
- pull requests required before merging;
- required approval count kept at zero to avoid solo-owner lockout;
- required status check is `PR release gate` from GitHub Actions;
- conversation resolution required;
- branches-not-up-to-date requirement left off for now;
- force pushes blocked.

GitHub subsequently reported `main` as `protected: true`. The legacy branch-protection subobject can still show checks disabled because the active protection comes from a ruleset rather than the older branch-protection mechanism.

The Production environment is demonstrably enforcing an approval gate: both the read-only cPanel verification and the later production release paused for owner review before their Production jobs ran.

## 4. Read-Only cPanel Connection Verification

The connected GitHub tool did not expose a new `workflow_dispatch` action, so a safe equivalent was used: re-run the previously successful `Verify SSH and release prerequisites` job from workflow run `31538950711`.

The re-run created fresh job `96118609574`. The owner approved the existing Production-environment gate on 2026-08-19, after which the job completed successfully.

Fresh verification result: **PASS**.

Successful steps:

- validate connection configuration;
- configure the pinned SSH host and key in the GitHub runner;
- verify read-only cPanel prerequisites;
- complete the job.

This confirmed current-day SSH authentication/release prerequisites for the configured cPanel environment without uploading or activating a release.

## 5. Protected Manual Rollback Guard

Before production release, PR #44 added a dedicated `Roll back public website` workflow plus operator documentation.

PR #44:

- passed the required `PR release gate`;
- changed only `.github/workflows/rollback-production.yml` and `docs/production-rollback.md`;
- was squash-merged to `main` as `02eadaf8949a08d46952bbea677b9e2ea212fc48`.

The rollback workflow requires explicit `ROLLBACK`, a 12-character release ID, dispatch from `main`, the existing `Production` approval gate, and the same `atd-public-production` concurrency lock used by deploys. It verifies the requested backup and current-release marker match, preserves the faulty live state under `.atd-rollback-incidents/`, restores the pre-deploy backup with the existing guarded rollback script, and runs GET-only production smoke afterward.

## 6. Protected Production Release — 2026-08-20

After the rollback guard was in place, the owner explicitly authorized production release.

Exact production dispatch/release SHA:

`02eadaf8949a08d46952bbea677b9e2ea212fc48`

Release ID:

`02eadaf8949a`

Release reason:

`Publish reviewed SEO, hydration, performance and cPanel release-hardening updates`

The connected GitHub tool could not create a brand-new `workflow_dispatch`, so the owner manually started `Release public website #2` from `main` with the required confirmation and reason.

Owner-supplied GitHub Actions screenshots show:

- `Validate and package main` completed successfully;
- two release artifacts were created;
- the deployment paused at the `Production` environment gate;
- the owner approved Production after the package gate passed;
- `Approve and deploy to cPanel` completed successfully;
- overall workflow status is `Success`;
- total duration shown was 2m 58s;
- artifacts are `cpanel-package-02eadaf8949a` and `deployable-site-02eadaf8949a`.

Because the overall release workflow succeeded, there is no evidence that its automatic rollback path ran during this deployment.

A later ChatGPT web fetch reached the public AlphaTrack marketing homepage. That supports post-release reachability only; the current tool surface did not reconstruct a byte-identical external fingerprint or run an interactive browser consent test.

See `FRONTEND_PRODUCTION_RELEASE_2026-08-20.md` for the dedicated release record.

## 7. Current Production State

Protected repository `main`: `02eadaf8949a08d46952bbea677b9e2ea212fc48`.

Current cPanel production release identity: `02eadaf8949a` / full SHA above, based on the successful protected GitHub release evidence.

The older byte-identical live fingerprint `45043ef7b62890f5b8d0057eeef473e4610af44e` is superseded operationally by this successful release. A new independent byte-identical external fingerprint has not yet been reconstructed in this ChatGPT session.

## Current Recommendation

**Frontend release/governance: PASS. Post-deploy martech readiness: HOLD.**

Remaining gates before paid Tracking Audit traffic:

1. browser-level production consent/tracking matrix;
2. confirm Ketch consent state and GTM consent-mode behavior;
3. verify GA4, Meta, Clarity, Conversion Linker and Brevo Conversations under intended consent states;
4. verify Tracking Audit landing-page behavior on desktop/mobile;
5. verify Meta Browser/Server event-ID matching and deduplication only if a controlled conversion test is separately approved;
6. restore/read current Brevo configuration when connector access becomes available;
7. explicitly green-light residual gaps before paid traffic.

No rollback, form submission, booking or martech mutation was performed while recording this state.
