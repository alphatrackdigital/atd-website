# ATD Backend Migration Gate

> Status reconciliation, 2026-08-23: the migration and production-security gate is complete. Backend PR #7 merged as `2f3941fa3a9753de327542925f870b0faeea814b`, was deployed to Netlify `alphatra-serv`, and production root/blog/admin/CORS, Strategy Call and Tracking Audit checks passed. This file is retained as historical procedure. Only the read-only 2026-08-25 stability checkpoint remains before any legacy-backend retirement.

Last reviewed: 2026-08-18

## Current State

- Live backend: Netlify project `alphatra-serv`.
- Live source binding: `alphatrackdigital/atd-backend-test`, branch `main`.
- Live Netlify deploy: `6a84a21d4d72f10008e50a31` at `c9035d19e16e77badefaaf1257be5837bc694476`, published 2026-08-18 18:19:45 UTC.
- Retained rollback deploy/reference: `6a28859001e02f0008d0faf7` at `9b78288742bcca9e9c74ce15edfb48e9aa0b5c1a`; old binding was `alphatrackdigital/alphatrackdigital`, branch `backend`.
- Canonical backend repository: `alphatrackdigital/atd-backend-test`.
- Canonical backend: `main@c9035d19e16e77badefaaf1257be5837bc694476` after PR #2 plus the Netlify example-value fix in PR #3.
- MongoDB readiness status: **GO with existing Netlify secret preserved**. Live-admin counts/timestamps exactly match `cluster4ATD` / `alphatrack`; the developer reportedly moved the database and settings to the ATD account.
- Migration status: **DEPLOYED AND NON-MUTATING SMOKE GATE PASSED**. No webhook registration, form submission, admin login, environment-secret change or canonical database write occurred during cutover.
- Stability status: **INITIAL CHECKPOINT PASSED; WINDOW REMAINS OPEN.** A second read-only checkpoint on 2026-08-18 confirmed the same ready production deploy and rollback, root `200`, public blog `200` with 12 posts, unauthenticated admin `401`, approved-origin preflight `204` with the correct allow-origin value, and denied-origin preflight without an allow-origin header.

## Verified Candidate Evidence

- GitHub reports PR #2 open, draft, and mergeable.
- Vercel status and Vercel Preview Comments passed for `3922c5a`.
- Initial local test gate: 7 files and 32 tests passed at `3922c5a`.
- Provider-error sanitization follow-up: committed and pushed as `de4a5a1`; 7 files and 33 tests passed; TypeScript and diff checks passed.
- GitHub REST verification confirms draft PR #2 points to `de4a5a1`; Vercel status and Vercel Preview Comments passed for the new commit.
- PR #2 was marked ready and merged on 2026-08-18 as `00d66ab5267007c5fb0321bfb2bdbab68d5403f6`; the resulting Vercel main deployment passed.
- The first Netlify production build of `00d66ab` failed before publication because secret scanning matched the real GA4 measurement ID committed in `.env.example`. The previous live deploy remained published.
- PR #3 replaced only that example value with a neutral placeholder. Its Netlify deploy preview and Vercel check passed; PR #3 merged as `c9035d19e16e77badefaaf1257be5837bc694476`.
- Netlify published `c9035d19` as deploy `6a84a21d4d72f10008e50a31` and retained the existing environment configuration.
- Local TypeScript gate: `tsc --noEmit` passed.
- `git diff --check main...HEAD` passed.
- The Vercel Preview shares several Production integration variables. Isolation is deferred as an accepted temporary risk; keep the branch controlled and do not use it for real submissions.

## Direct MongoDB Atlas Evidence (Read Only, 2026-08-18)

- Confirmed Atlas project `Project 0` and cluster `cluster4ATD` with the owner before inspection.
- Cluster is running (`IDLE`, not paused) on MongoDB 8.0.29.
- A read-only inspection connection succeeded.
- Database `alphatrack` exists with the expected Mongoose collections: `adminusers`, `blogposts`, and `contacts`.
- Non-sensitive counts: 1 admin user, 12 blog posts, and 43 contacts.
- Freshness snapshot: admin latest update `2026-04-17T16:42:17.618Z`; blog latest update `2026-04-17T13:11:47.980Z`; contact latest update `2026-07-18T23:42:45.836Z`.
- Live-admin comparison on 2026-08-18 matched the Atlas snapshot: 43 contacts with the newest displayed as 2026-07-19 00:42 Africa/Lagos (the same instant as `2026-07-18T23:42:45.836Z`), and 12 blog posts last updated 2026-04-17. Personal details visible in the evidence were not transcribed into continuity documentation.
- Result: `cluster4ATD` / `alphatrack` is accepted as the current canonical dataset with high confidence. The previous-host comparison is no longer required before cutover unless new Production writes occur after this evidence timestamp.
- Recovery snapshot `alphatrack_backup_20260818_pre_cutover` was created in the same Atlas cluster with `adminusers`, `blogposts`, and `contacts`; counts and latest timestamps exactly match the canonical collections. This protects against application-level cutover mistakes but is not off-cluster disaster recovery and does not preserve secondary indexes.
- All counted records satisfy the candidate models' required field/type checks: 1/1 admin user, 12/12 blog posts, and 43/43 contacts.
- Expected lookup indexes exist for admin email and blog slug.
- The project has one database user with project-wide `atlasAdmin` access. This is sufficient but broader than least privilege; a dedicated scoped application user is a post-migration security improvement, not a prerequisite for this controlled migration.
- Atlas network access contains an open-internet rule. This should permit Netlify Functions to connect, but it is broader than desirable and should be tightened only through a separately planned change that accounts for serverless egress.
- No credentials, hashes, document contents, connection strings or access-list entries were exposed. The only MongoDB write was the additive, verified pre-cutover snapshot database; canonical collections and Atlas access settings were not changed.

## Correction to Earlier URI Assessment

- The earlier claimed Netlify/Atlas hostname mismatch was invalid. Netlify returned a 20-character redacted placeholder, not the URI; treating that placeholder as a hostname comparison produced a false negative.
- The actual `MONGODB_URI`, credentials and hostname were never displayed or extracted. A guarded attempt to prepare a replacement aborted before creating a user or changing Netlify when it detected the redacted value.
- Live-admin counts and timestamps exactly matching Atlas, combined with the owner's report that the developer moved the database and settings, provide high-confidence non-secret evidence that the current live backend uses the migrated ATD dataset.
- Preserve the existing Netlify `MONGODB_URI`; do not rotate it merely to resolve the superseded mismatch claim. Least-privilege credential rotation remains a separately planned post-stability improvement.
- Netlify has no `MONGODB_DATABASE` override and the reconciled candidate correctly defaults to `alphatrack`.
- `cluster4ATD` is an Atlas Free cluster. MongoDB's official documentation states that Atlas Cloud Backup is unavailable for Free clusters: <https://www.mongodb.com/docs/atlas/backup/cloud-backup/overview/>.

## Review Items Before Merge

1. **Resolved in `de4a5a1`:** Brevo upstream response text is no longer returned in Netlify lead-handler `502` responses. The public message is generic, diagnostic detail remains server-side, and a regression test verifies the provider detail is absent from the response.
2. **Accepted as an interim safeguard on 2026-08-17:** the login throttle is an in-memory, per-function-instance guard. It improves warm-instance behaviour but is not represented as a durable distributed rate limit. A platform-level or shared-store limit is deferred until traffic/risk justifies it.
3. **Resolved for application rollback:** the verified same-cluster pre-cutover snapshot preserves the three application collections. Off-cluster backup remains a P2 operational improvement because Free tier has no Atlas Cloud Backup.

## Cutover Boundary

Completed:

- Review code, diffs, configuration names and existing evidence.
- Run local tests with mocks and local type/diff checks.
- Merge validated PR #2 and verify the resulting Vercel main deployment.
- Create and verify the additive pre-cutover Atlas snapshot.
- Rebind `alphatra-serv` to `alphatrackdigital/atd-backend-test`, production branch `main`.
- Publish and verify Netlify deploy `6a84a21d4d72f10008e50a31` at `c9035d19`.
- Pass non-mutating checks for the static status page, public blog read (12 total posts), unauthenticated admin rejection, approved-origin CORS, denied-origin CORS and recent function error logs.

Still prohibited without separate approval:

- Exercise Vercel Preview routes that share Production MongoDB, Brevo, Meta, GA4 or webhook configuration.
- Submit forms, register webhooks, create/update/delete database records, or perform an admin login test.

## Netlify Configuration Gate

Verify names, scopes and Production contexts without exposing values.

Required for existing live functionality:

- `MONGODB_URI`
- `JWT_SECRET`
- `BREVO_API_KEY`
- Relevant Brevo list/template/redirect variables
- `BREVO_MEETING_WEBHOOK_SECRET`
- `GA4_MEASUREMENT_ID`
- `GA4_MEASUREMENT_PROTOCOL_API_SECRET`
- `ALLOWED_ORIGINS`

Required only when the corresponding capability is activated:

- `BREVO_TRANSACTIONAL_WEBHOOK_SECRET` before webhook registration
- `META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN` before Meta CAPI is treated as active
- `META_GRAPH_API_VERSION` only to override the code default

Keep GA4 debug mode false and Meta test-event code absent outside controlled tests.

## Controlled Migration — Completed 2026-08-18

1. Existing Netlify secrets and the verified Atlas snapshot were preserved.
2. The prior `9b782887` deploy and old repository binding were recorded for rollback.
3. `alphatra-serv` was rebound to `alphatrackdigital/atd-backend-test`, production branch `main`, with `main` as the allowed branch.
4. The initial `00d66ab` build failed before publication; the previous deploy stayed live. PR #3 removed the scanner match from `.env.example`, its preview passed, and the production retry published `c9035d19`.
5. No webhooks were registered and no public forms or admin credentials were submitted.
6. Follow-up: disable Netlify deploy previews for this backend if the dashboard supports it while retaining Vercel as the backend test ground.

## Pre-Deployment Test Gate

Complete now without external writes or Production integration traffic:

- `npm test` in the isolated backend worktree; all mocked unit/function tests must pass.
- `npm run type-check` must pass.
- `git diff --check main...HEAD` must pass.
- Worktree must remain clean and `HEAD` must equal the reviewed PR SHA.
- GitHub/Vercel checks for that SHA must remain successful before merge.

Still deferred pending separate approval:

- Any database connectivity, admin-login or persisted CRUD check.
- Any live Brevo, Meta, GA4, webhook or form test.
- Any mutating Production integration test.

## Non-Mutating Post-Deploy Gate

- **Passed:** deployed SHA `c9035d19` and deploy ID `6a84a21d4d72f10008e50a31` confirmed.
- **Passed:** root/service response returned 200.
- **Passed:** public blog `GET` returned 200 with 12 total posts; output retained only counts, not content.
- **Passed:** unauthenticated contacts-admin `GET` returned 401.
- **Passed:** approved-origin preflight returned 204 with the expected allow-origin header; an unapproved origin received no allow-origin header.
- **Passed:** recent Netlify function error-log query showed no errors after these checks.
- Invalid-method and unsigned-webhook checks were not sent because they were unnecessary to establish initial health and would add Production invocation noise.
- Confirm webhook endpoints reject unsigned requests.
- Confirm CORS headers only for approved frontend origins.
- Review function logs for configuration, bundling or database errors.

A real lead, booking or webhook event requires a separate explicit approval and a controlled QA identity.

## Stability Window Decision

- Recommended minimum observation window: seven calendar days after the 2026-08-18 cutover, ending no earlier than 2026-08-25.
- During the window, do not rebuild merely to prove stability; retain production deploy `6a84a21d4d72f10008e50a31`, rollback deploy `6a28859001e02f0008d0faf7`, and website branch `backend@60adfd9d`.
- At the end of the window, repeat the same GET/OPTIONS gate and confirm the production deploy ID, branch and commit remain expected.
- If the final checkpoint passes and no operational failure has been reported, create and verify `archive/legacy-backend-2026-06-16` at `60adfd9d` before requesting deletion of the legacy branch.
- This observation and final read-only gate consume no Netlify build credits. Ordinary production function requests may still count toward platform request/compute usage under the account plan.

## Rollback

If any initial gate fails:

1. Stop further testing and do not register external webhooks.
2. Restore/publish retained deploy `6a28859001e02f0008d0faf7` at `9b78288742bcca9e9c74ce15edfb48e9aa0b5c1a`.
3. If needed for future rollback builds, restore `alphatrackdigital/alphatrackdigital`, branch `backend`, functions directory `netlify/functions`, allowed branch `backend`, and GitHub installation `113742843`.
4. Re-run only non-mutating health checks.
5. Record the failed deploy ID, observed error and rollback evidence.

Do not delete the old branch, repository or deploy references until the new backend has passed the agreed stability window.

## Usage Estimate

- Planning, GitHub review and local validation: zero Netlify credits.
- Actual migration usage: one failed Production build, one successful deploy-preview build, one successful Production build, plus a small number of read-only API/function requests. Netlify determines the exact credit charge.
- Avoid further Netlify previews for backend work; Vercel is the intended test ground. Verify the billing dashboard before any additional build.
