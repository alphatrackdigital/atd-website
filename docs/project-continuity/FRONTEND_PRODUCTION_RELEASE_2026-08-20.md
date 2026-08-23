# Frontend Production Release — 2026-08-20

Status reconciled: 2026-08-23

## Scope

This record captures the first protected cPanel production release after the 2026-08-19 release-hardening, branch-ruleset and rollback-workflow work. It records only evidence available from GitHub, the owner-supplied GitHub Actions screenshots, and limited external reachability checks. It does not treat deployment success as proof of consent-state or downstream martech correctness.

## Release identity

- Repository: `alphatrackdigital/alphatrackdigital`
- Protected branch: `main`
- Full dispatch/release SHA: `02eadaf8949a08d46952bbea677b9e2ea212fc48`
- Release ID used by the cPanel workflow: `02eadaf8949a`
- Workflow: `Release public website`
- Workflow run shown by the owner: `#2`
- Release reason: `Publish reviewed SEO, hydration, performance and cPanel release-hardening updates`

## Pre-release gates

Before dispatch:

- PR #42 release hardening had been reviewed, validated and merged;
- the real `PR release gate` was active and required by the `Protect main` ruleset;
- GitHub reported `main` protected;
- fresh read-only cPanel SSH/release-prerequisite verification had passed;
- PR #44 added the protected post-deploy rollback workflow and passed the required `PR release gate` before merge;
- the release candidate was re-locked to `02eadaf8949a08d46952bbea677b9e2ea212fc48` after PR #44 because that merge changed only rollback workflow/documentation files.

## GitHub Actions release evidence

Owner-supplied screenshots of `Release public website #2` show:

- the workflow was manually triggered from `main` at commit prefix `02eadaf`;
- `Validate and package main` completed successfully;
- two release artifacts were created;
- the deploy job paused at the `Production` environment gate before activation;
- the owner approved the `Production` deployment after the package gate passed;
- `Approve and deploy to cPanel` completed successfully;
- overall workflow status is `Success`;
- total workflow duration shown was 2m 58s;
- artifact names are `cpanel-package-02eadaf8949a` and `deployable-site-02eadaf8949a`;
- the workflow UI links the deployment job to `https://alphatrack.digital`.

The screenshots also show nine non-blocking annotations. They are warnings, not failed checks. Visible examples include the GitHub Actions Node.js 20 deprecation notice and pre-existing Fast Refresh lint warnings in shared UI component files.

## Backup and rollback posture

The release workflow creates a pre-deploy backup before activation, restores that backup automatically if activation fails, and invokes the rollback script automatically if the immediate GET-only production smoke fails.

A separate protected `Roll back public website` workflow is now present on `main` for regressions discovered after the immediate smoke window. It requires explicit `ROLLBACK` confirmation, a matching 12-character current release ID, the existing `Production` environment approval gate, shared production concurrency, incident-state preservation, and post-rollback GET-only smoke.

Because `Release public website #2` completed with overall `Success`, there is no evidence that the automatic rollback path ran during this deployment.

## External production observation

A later ChatGPT web fetch reached `https://alphatrack.digital/` and returned the expected AlphaTrack Digital marketing homepage content. This is supporting reachability evidence only. The web fetch surface does not provide the byte-level artifact fingerprint or a real browser session, so it is not sufficient to prove the deployed files are byte-identical to the GitHub artifact or that consent-gated tags behave correctly.

The previous verified live fingerprint `45043ef7b62890f5b8d0057eeef473e4610af44e` is therefore superseded operationally by the successful protected release of `02eadaf8949a...`, but a new byte-identical external fingerprint has not yet been independently reconstructed in this ChatGPT session.

## Current production status

Frontend deployment gate: **PASS**.

Current production release identity: **`02eadaf8949a` / `02eadaf8949a08d46952bbea677b9e2ea212fc48`**, based on the successful protected GitHub release evidence.

Post-deploy website/backend/tracking/CRM gate: **PASS**, superseded by the controlled single-pass release verification recorded in the 2026-08-23 continuity update. Strategy Call and Tracking Audit production QA passed, the prior Meta browser/server dedup proof remains accepted, and paid Tracking Audit traffic is technically cleared. Campaign activation was not performed and remains an explicit owner decision.

The observation window remains open through the read-only 2026-08-25 stability checkpoint. Do not retire the legacy backend before that checkpoint.

## Safety note

No rollback was triggered, no additional form submission or booking was performed, and no martech configuration was modified while recording this release evidence.
