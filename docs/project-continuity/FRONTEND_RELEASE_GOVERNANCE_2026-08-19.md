# Frontend Release Governance Continuation — 2026-08-19

## Scope

This record captures the ChatGPT web continuation of Steps 1–4 from the ATD continuity plan plus the owner's subsequent authorization to merge PR #42, apply the agreed GitHub governance controls where the connected tool supports them, and run only the read-only cPanel connection verification. No production release was dispatched and no cPanel site files were changed.

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

The genuine PR CI gate completed successfully on the reviewed head `3a46d0cc256e3afda98059aa78c222e574b198fe` before merge.

Owner authorization was received on 2026-08-19. GitHub initially rejected the merge because PR #42 was still marked draft. It was changed to Ready for Review and then squash-merged successfully.

Current repository `main`: `b1a3207ff520829085711d526f678bda53ac1421`.

Production effect: **none**. Merging PR #42 did not dispatch the manually triggered production workflow.

## 2. Genuine Pull-Request CI

The merged workflow is:

- path: `.github/workflows/pr-release-gate.yml`;
- trigger: `pull_request` targeting `main`;
- permissions: `contents: read` only;
- no Production environment and no production secrets;
- Node.js 22 + `npm ci`;
- executes the existing `npm run release:prepare` gate;
- concurrency cancels superseded runs for the same PR.

The workflow is named `PR release gate` and is the appropriate future required CI check. The existing Vercel context must not be used as the repository's code-quality gate because the configured Vercel branch filter can report a successful integration status for an intentionally skipped deployment.

## 3. Main/Production Governance

### Intended `main` policy

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

### Intended `Production` environment policy

1. keep deployment branches restricted to `main`;
2. keep at least one required reviewer;
3. prefer a reviewer other than the dispatch initiator;
4. enable prevention of self-review only if another eligible reviewer is reliably available;
5. keep all cPanel credentials and configuration values scoped to the environment.

### 2026-08-19 execution result

Immediately after the PR #42 merge, GitHub still reported `main` as `protected: false` with required status checks disabled.

The connected GitHub action surface does not expose branch-protection/ruleset or Production-environment mutation endpoints. The project container also has no authenticated GitHub CLI/token session, and no additional installable plugin providing those operations was found. Therefore these governance mutations were **authorized but not applied** rather than silently approximated through a less-safe change.

The Production environment is demonstrably enforcing an approval gate: the authorized read-only cPanel verification re-run waited for owner approval before running.

## 4. Read-Only cPanel Connection Verification

The connected GitHub tool does not expose a new `workflow_dispatch` action. A safe equivalent was used: re-run the previously successful `Verify SSH and release prerequisites` job from workflow run `31538950711`.

The re-run request created fresh job `96118609574`. The owner approved the existing Production-environment gate on 2026-08-19, after which the job completed successfully.

Fresh verification result: **PASS**.

Successful steps:

- validate connection configuration;
- configure the pinned SSH host and key in the GitHub runner;
- verify read-only cPanel prerequisites;
- complete the job.

This confirms current-day SSH authentication/release prerequisites for the configured cPanel environment without uploading or activating a release. No production release workflow was dispatched and no site files were changed.

## 5. Verified Live-to-Main Release Delta

The verified live cPanel source remains `45043ef7b62890f5b8d0057eeef473e4610af44e` until a later production release is independently verified.

Before PR #42 merged, GitHub comparison from live `45043ef7` to `main@38f280d0b99a10678de455dac16a671f431d372c` showed the reviewed product/release delta was 4 commits / 40 files. PR #42 then added the reviewed release-hardening/CI changes to repository `main@b1a3207f...`; it has not changed the public site.

The earlier admin clarification remains valid: the verified live commit `45043ef7` already contains the admin console and the fix that prevents the Brevo support widget from loading on admin routes. The reviewed product delta did not newly introduce the admin console.

## Current Release Recommendation

**Code/release hardening: merged. cPanel connection verification: PASS. Production: HOLD.**

Remaining gates before any public release:

1. apply the agreed `main` branch protection/ruleset using an authenticated GitHub settings surface;
2. review whether to change Production self-review behavior based on actual reviewer availability;
3. confirm the exact production release SHA and release reason;
4. complete the remaining production martech/consent readiness checks before paid campaign traffic;
5. only with separate explicit production-release approval, dispatch `Release public website`;
6. re-fingerprint the public site and run post-release GET-only verification.

No production release is necessary merely because repository `main` is newer than the current public fingerprint.
