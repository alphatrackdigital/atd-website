# Protected Production Rollback

The `Roll back public website` GitHub Actions workflow is the protected recovery path for a production release that passed deployment but later shows a material post-deploy problem.

It does not replace the automatic rollback already built into `Release public website`: activation failures restore the pre-deploy backup immediately, and a failed post-activation GET-only smoke invokes the rollback script automatically.

## When to use it

Use the protected manual rollback only when all of the following are true:

- the release was activated successfully;
- the automated production smoke passed or the problem appeared after that smoke;
- a material issue is confirmed and restoring the immediately preceding production snapshot is the preferred recovery action;
- the exact 12-character release ID of the release being reversed is known.

Examples include a post-release consent regression, a mobile rendering defect, a tracking/integration regression, or another issue not covered by the automated GET-only smoke.

## Safety contract

The rollback workflow:

1. is manually triggered only;
2. requires the explicit confirmation `ROLLBACK`;
3. requires a 12-character lowercase hexadecimal release ID;
4. must be dispatched from `main`;
5. uses the same `atd-public-production` concurrency group as the release workflow, so release and rollback operations cannot overlap;
6. waits on the existing GitHub `Production` environment and its required approval;
7. validates the cPanel connection configuration and uses the pinned SSH host/key material;
8. verifies the requested backup exists and contains `index.html`;
9. verifies `~/.atd-current-release` exactly matches the requested release ID, preventing an accidental rollback of a stale or unrelated release;
10. copies the currently faulty production state to `~/.atd-rollback-incidents/<incident-id>/` before restoration;
11. executes the existing guarded `.github/scripts/rollback-cpanel-release.sh` script;
12. runs the same GET-only production smoke after restoration.

The rollback script preserves cPanel-managed `.well-known` and `cgi-bin` paths.

## Operator procedure

1. Identify the release to reverse from the successful `Release public website` workflow run. Use its 12-character release ID.
2. Confirm the issue and record a short rollback reason.
3. Open **Actions -> Roll back public website -> Run workflow** on `main`.
4. Enter `ROLLBACK` exactly.
5. Enter the 12-character release ID.
6. Enter the rollback reason.
7. Review the waiting `Production` environment request and approve only after verifying the release ID and reason.
8. Confirm all workflow steps complete successfully, including the GET-only production smoke.
9. Re-fingerprint the public frontend and run the relevant browser-level consent/tracking checks after restoration.

## Failure behavior

The workflow stops without restoring anything if the confirmation, branch, release ID, cPanel configuration, current-site checks, backup checks, or current-release marker checks fail.

If the restoration itself fails, the workflow fails and the pre-rollback incident snapshot remains available for diagnosis. If the restoration succeeds but the GET-only smoke fails, treat that as an incident requiring manual investigation; do not automatically deploy another release.

## Retention

Do not delete the matching `.atd-backups/<release-id>/` or `.atd-rollback-incidents/<incident-id>/` directories until the production incident is closed and a known-good state has been independently verified.
