# Reconciled Open Items

Last reviewed: 2026-08-23

There is no current launch blocker from the website/backend/tracking/CRM readiness perspective.

## Pending Gate

| Priority | Item | Status / completion evidence |
| --- | --- | --- |
| P0 | Aug 25 stability checkpoint | Pending by date. Run [`../AUG_25_STABILITY_CHECKPOINT.md`](../AUG_25_STABILITY_CHECKPOINT.md) read-only. Keep the legacy backend intact until it passes. |

## Non-Blocking Security and Maintenance

| Priority | Item | Constraint |
| --- | --- | --- |
| P1 | Remove Meetings `?token=` fallback | Live `x-atd-webhook-secret` authentication is proven. Use a later small backend PR; do not combine with dependency or infrastructure work. |
| P1 | Review Vercel adapter advisories | Proposed remediation includes major-version changes; test compatibility separately and do not treat it as a Netlify production incident. |
| P1 | Decide legacy-backend retirement | Only after Aug 25 pass, exact tag/ref verification and explicit deletion approval. |
| P2 | MongoDB least privilege/network/backup | Design separately; do not disrupt the stable production connection during the checkpoint window. |
| P2 | Notion status sync | Update superseded pre-launch project/task/case-study states from reviewed Git evidence. |
| P2 | Operational monitoring | Establish lightweight reporting for forms, CRM, analytics, workflow health and campaign performance. |

## Growth Decisions

- Paid Tracking Audit campaign is technically cleared and awaits explicit owner activation.
- Continue the internal case study using redacted verified evidence.
- Review Search Console results and create a prioritized SEO backlog.
- Revisit managed CMS needs only if a concrete publishing requirement emerges.

## Completed/Superseded

- Frontend release hardening, branch protection, protected deploy and rollback are complete.
- Backend production-security hardening PR #7 is merged and deployed.
- Strategy Call and Tracking Audit production QA are complete.
- Backend Issues #4, #5 and #6 are closed; no backend issue was open at the review.
- The prior production consent/tracking/CRM launch hold is superseded by the owner-approved single-pass launch verification.
- WordPress, Vercel-production and Netlify-frontend-production proposals are historical, not current architecture.
- Earlier launch dates and June task states must not be reused as current commitments.
