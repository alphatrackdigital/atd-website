# Reconciled Open Items

Last reviewed: 2026-08-19

## P0 — Establish the True Production State

| Item | Why it matters | Completion evidence |
| --- | --- | --- |
| Review existing local changes | Prevents loss or accidental bundling of user work | Ownership/purpose recorded for `ConversionTracking.tsx` and `reports/` |
| **Completed 2026-08-18:** verify deployed frontend commit | Separates repository readiness from public behaviour | Prerendered homepage plus seven critical asset hashes match `45043ef7` exactly; current `main@38f280d0` is not live. See `../FRONTEND_PRODUCTION_VERIFICATION.md`. |
| Complete protected cPanel release hardening | Prevents source disclosure, moving-branch artifacts and ambiguous post-deploy failures | Draft PR #42 at `3ae5c386` implements source-map exclusion plus validation, one immutable SHA across jobs and non-blocking IndexNow; 86 tests and the full local release gate passed. Review/merge remains pending. Tighten branch/reviewer policy where supported, then rerun the read-only connection workflow before any release. |
| **Completed 2026-08-18:** run production static smoke | Confirms core public surface | Repository GET-only smoke passed for homepage, offer, legal pages, sitemap and 404; fingerprinted critical assets returned `200`. |
| Observe `alphatra-serv` stability after migration | Confirms the new canonical backend remains healthy before cleanup | Live binding is `atd-backend-test/main`; deploy `6a84a21d4d72f10008e50a31` at `c9035d19` is ready; initial and follow-up read-only smoke gates passed on 2026-08-18; `9b782887` rollback retained. Run the closing checkpoint no earlier than 2026-08-25. |

## P1 — Reconfirm Launch Gates

| Item | Why it matters | Completion evidence |
| --- | --- | --- |
| Production consent matrix | Paid traffic must respect Ketch choices | Six-scenario matrix recorded against current production SHA |
| GTM/GA4/Clarity/Meta production check | Test-ground success may not equal production | Network/tag evidence with consent states |
| Brevo read-only audit | Workflows, credits and exclusions can drift | Current lists, fields, workflow status, active contacts, exclusions, senders and credits documented |
| Meta deduplication proof | Prevents double-counted Leads/Subscribes | Matching Browser/Server event IDs in Events Manager |
| Book-a-call proof decision | Avoids unnecessary live bookings while closing a known gap | Owner decision; controlled evidence only if required |

## P2 — Operational Readiness

- Confirm `GA4_MEASUREMENT_PROTOCOL_DEBUG_MODE` is false in production.
- Confirm `META_CAPI_TEST_EVENT_CODE` is disabled outside testing.
- Verify transactional webhook endpoint before any Brevo registration.
- Verify suppression/blocklist and test-lead exclusions before workflow activation.
- Review Brevo profile-update and unsubscribe pages.
- No earlier than 2026-08-25, repeat the documented read-only backend gate. If it passes and no operational failure has been reported, create `archive/legacy-backend-2026-06-16` at `backend@60adfd9d`, verify the tag remotely, and only then request deletion of `backend`. The separate `deploy` and `vercel-backend` cleanup was completed safely on 2026-08-18.
- Disable Netlify deploy previews for the backend if supported; Vercel remains the backend test ground and the migration PR preview consumed avoidable Netlify credit.
- Refresh the Vercel frontend test deployment from approved website `main`; the current alias is at `15b9febd` while remote `main` is `38f280d0`.
- Make the Netlify frontend test project technically frontend-only by excluding backend functions, or explicitly accept the duplicate function surface; do not change this during backend stability observation.
- Decide whether to retire or retain the errored GitHub Pages site for `website-internal-test` before archiving that legacy repository.
- Review Search Console audit SQL/results and create a prioritized SEO backlog.
- Update Notion records that still reference superseded June deployment assumptions.
- Keep Vercel Preview environment isolation as an accepted temporary risk: controlled branches only, no untrusted PR code, and no real form/webhook submissions until isolation or test resources are available.
- Replace the interim in-memory login throttle with a platform-level or shared-store rate limit if admin traffic, attack risk or operational requirements justify distributed enforcement.
- Replace the broad Atlas `atlasAdmin` application access with a dedicated least-privilege database user after the migration is stable.
- Review the Atlas open-internet network rule and design a narrower serverless-compatible access approach before changing it.
- Establish an off-cluster MongoDB backup/export or upgrade from Free tier after the backend migration is stable; the pre-cutover same-cluster snapshot protects against application mistakes, not cluster loss.

## P3 — Growth and Product Follow-up

- Launch the controlled Tracking Audit Meta pilot only after P0/P1 gates.
- Complete the internal case study using verified evidence.
- Decide whether a managed CMS is still needed; no current CMS implementation is evidenced.
- Build a lightweight monitoring/readout cadence for forms, tracking, campaigns, and deploys.
- Review Clarity funnels, smart events, masking, and recordings after sufficient production data.

## Superseded Items

- The June Ketch `NO-GO` assessment was superseded by later Version 9/test-ground consent evidence and legal-page fixes.
- Early plans treating WordPress as the website implementation were superseded by the Vite/React repository.
- Early Vercel/Netlify production recommendations were superseded by the current cPanel frontend plus separate API architecture unless a new hosting decision is made.
- Old February/April/June campaign dates are historical and must not be reused as current commitments.
