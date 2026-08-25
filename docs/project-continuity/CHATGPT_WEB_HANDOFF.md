# ChatGPT Web Continuity Handoff

Last reviewed: 2026-08-23

## Purpose

Use this file to continue ATD work from ChatGPT web, Codex, Claude Code, or a human review without attaching local files. The GitHub continuity pack is the shared source of truth; connected plugins may be used to refresh current external evidence.

## Current State

- Project status: **LAUNCH-READY**.
- Frontend production source/release: `alphatrackdigital/atd-website main@02eadaf8949a08d46952bbea677b9e2ea212fc48`.
- Backend production source/release: `alphatrackdigital/atd-backend-test main@2f3941fa3a9753de327542925f870b0faeea814b`.
- Frontend and backend `main` are protected by PR/CI controls.
- Backend PR #7 is independently reviewed, merged and deployed.
- Production root, blog, admin-auth boundary, CORS, Strategy Call and Tracking Audit gates passed.
- Backend Issues #4, #5 and #6 are closed; no backend issue remained open at the 2026-08-23 refresh.
- Paid Tracking Audit campaign is technically cleared but not activated.
- Legacy backend retirement waits for the read-only Aug 25 checkpoint.

## Start Here

1. Read [`ATD_RESUME_HERE.md`](ATD_RESUME_HERE.md).
2. Read [`AUG_25_STABILITY_CHECKPOINT.md`](AUG_25_STABILITY_CHECKPOINT.md).
3. Refresh GitHub refs/PR/issues before assuming a SHA remains current.
4. Use connected Notion/Netlify/Vercel/Brevo/MongoDB tools read-only unless the owner explicitly authorizes a mutation.
5. Record evidence in Git before updating business-facing Notion status.

## Next Work

1. On or after 2026-08-25, perform the documented read-only stability checkpoint.
2. If it passes, propose legacy-backend retirement; do not delete anything as part of the checkpoint.
3. Prepare a small backend PR removing the Meetings `?token=` fallback after confirming no ambiguous ledger state needs reconciliation.
4. Review Vercel development-adapter major-version advisories separately.
5. Activate paid traffic only on explicit owner instruction.

## Connected-System Guidance

- **GitHub:** authoritative source, PR, issue, CI and release identity.
- **Notion:** business context and operational records; several pages still contain superseded pre-launch gates and need a later evidence-backed sync.
- **Netlify:** production backend/deploy/log evidence; inspection must not trigger a build.
- **Vercel:** test-project bindings and previews; never promote to production for this architecture.
- **Brevo:** configuration, lists, workflows, CRM and logs; never send/enrol/mutate during read-only review.
- **MongoDB Atlas:** project/cluster/database metadata only unless a separately authorized database task exists.
- **ChatGPT Website/Martech Projects:** rationale and planning history, not implementation proof.

## Local Exclusions

The original local frontend checkout contains unrelated user material: a `ConversionTracking.tsx` edit, `reports/`, and `pipx_shared.pth`. This PR was updated from an isolated worktree and excludes those items.

## Safety Boundary

Do not deploy, roll back, change hosting bindings, edit environment variables, alter Atlas/Brevo/Notion production state, publish GTM/Ketch, send messages, submit forms, create bookings, activate campaigns, delete branches, or retire legacy infrastructure without fresh explicit authorization.
