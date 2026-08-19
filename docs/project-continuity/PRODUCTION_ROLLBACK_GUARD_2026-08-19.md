# Production Rollback Guard — 2026-08-19

## Scope

This record captures the rollback-safety improvement completed before any public frontend release. No production deployment or rollback was executed.

## Implemented recovery path

PR #44 (`Add protected production rollback workflow`) was opened from `codex/protected-production-rollback`, validated by the required `PR release gate`, moved out of draft, and squash-merged.

Merged `main`: `02eadaf8949a08d46952bbea677b9e2ea212fc48`.

The merge adds only:

- `.github/workflows/rollback-production.yml`;
- `docs/production-rollback.md`.

No application/frontend source changed in this merge.

## Protected rollback workflow

The new `Roll back public website` workflow:

- is `workflow_dispatch` only;
- requires explicit `ROLLBACK` confirmation;
- requires the 12-character release ID and a short reason;
- refuses dispatches not originating from `main`;
- uses the same `atd-public-production` concurrency group as the release workflow, preventing overlapping release/rollback operations;
- waits on the existing GitHub `Production` environment approval gate;
- uses the existing pinned cPanel SSH host/key configuration;
- verifies the requested `.atd-backups/<release-id>/` snapshot exists and contains `index.html`;
- verifies `~/.atd-current-release` exactly matches the requested release ID before restoration;
- snapshots the currently faulty live state under `.atd-rollback-incidents/` before restoring the pre-deploy backup;
- executes the existing guarded rollback script;
- runs the existing GET-only production smoke after restoration.

If any pre-restore validation fails, no rollback is performed. If restoration succeeds but the post-rollback smoke fails, the workflow stops for incident investigation rather than automatically deploying another release.

## Existing automatic recovery remains

The public release workflow already creates a fresh cPanel backup immediately before activation. Activation failure restores that backup automatically, and a failed post-activation smoke automatically invokes the rollback script.

The new workflow covers the separate case where a release initially passes but a material issue is discovered later.

## Validation

- PR #44 changed exactly two files: the rollback workflow and its runbook.
- Required `PR release gate` completed successfully before merge.
- `main` remains protected by the active ruleset after merge.
- No Production workflow was dispatched.
- No cPanel files, backups, environment values or public site state were changed.

## Updated release candidate

Because PR #44 moved `main`, the exact future dispatch SHA is now:

`02eadaf8949a08d46952bbea677b9e2ea212fc48`

This supersedes the earlier candidate `b1a3207ff520829085711d526f678bda53ac1421`. The difference is one commit containing only the rollback workflow and rollback documentation; no application source changed.

Any future production authorization must refer to the current protected `main` SHA and must be rechecked immediately before dispatch.
