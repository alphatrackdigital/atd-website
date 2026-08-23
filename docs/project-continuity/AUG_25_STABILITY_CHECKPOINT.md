# Aug 25 Production Stability Checkpoint

Status: **PENDING — do not execute before 2026-08-25**

## Purpose

Confirm that the launched frontend/backend and verified lead paths remained healthy through the observation window before declaring the project launched and stable or retiring legacy backend assets.

## Safety Scope

This checkpoint is read-only. Do not deploy, roll back, submit a form, create a booking, send an email, activate a campaign, change an environment variable, mutate a contact/CRM/database record, or delete/archive a branch.

## Required Evidence

- [ ] Refresh frontend and backend remote refs; record current protected `main` SHAs.
- [ ] Confirm frontend production remains reachable on root, Tracking Audit, Blog, and admin-auth boundary.
- [ ] Confirm backend root/health behavior and expected unauthenticated rejection at protected admin/API boundaries.
- [ ] Confirm canonical browser origins remain accepted and preview/hostile origins remain rejected using non-mutating requests.
- [ ] Review Netlify production deploy state and recent Function logs for new errors, retry storms, duplicate CRM activity, quota failures, secret-scan failures, or abnormal 5xx patterns.
- [ ] Review available Brevo/CRM evidence for duplicate Strategy Call or Tracking Audit deals/tasks since launch; do not open private record content unnecessarily.
- [ ] Confirm no unresolved launch-blocking GitHub issue or failed required CI check exists.
- [ ] Confirm the owner has not observed a production incident during the window.

## Pass Criteria

The checkpoint passes when:

1. Production surfaces remain healthy.
2. No launch-blocking error or security regression is observed.
3. No duplicate CRM side effect or retry storm is indicated.
4. Protected branch/CI/release controls remain in force.
5. No incident requires the retained legacy backend or rollback artifact.

## Decision After a Pass

- Update `ATD_RESUME_HERE.md`, `ATD_PROJECT_OVERVIEW.md`, and `registers/OPEN_ITEMS.md` to **LAUNCHED AND STABLE**.
- Record exact evidence, date, SHAs, deployment IDs, and confidence.
- Prepare—not execute—the legacy-backend archive/deletion proposal with exact target refs and hosting-binding verification.
- Prepare the small Meetings query-token-fallback removal PR separately.

## Decision After a Failure

- Keep legacy assets intact.
- Record the failing evidence and severity.
- Open a focused issue/PR only for the confirmed defect.
- Do not redeploy, roll back, or mutate external systems without explicit incident authorization.

## Result

Pending.
