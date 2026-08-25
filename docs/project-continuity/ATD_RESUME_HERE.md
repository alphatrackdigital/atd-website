# ATD Resume Here

Last reviewed: 2026-08-23

## Authoritative Status

**Project state: LAUNCH-READY.** Development, security hardening, production deployment, Brevo/CRM verification, Strategy Call QA, Tracking Audit QA, and launch verification are complete. Paid campaign activation is cleared from the website/backend/tracking/CRM perspective and remains an explicit owner decision.

| Concern | Current state |
| --- | --- |
| Production frontend | `https://alphatrack.digital`, released from protected frontend `main@02eadaf8949a08d46952bbea677b9e2ea212fc48` through the cPanel workflow |
| Production backend | Netlify `alphatra-serv`, running merged backend `main@2f3941fa3a9753de327542925f870b0faeea814b` |
| Frontend repository | `alphatrackdigital/atd-website`; protected `main`, required PR gate, protected manual rollback |
| Backend repository | `alphatrackdigital/atd-backend-test`; protected `main`, required PR/CI; PR #7 merged |
| Browser-origin boundary | Production accepts only `https://alphatrack.digital` and `https://www.alphatrack.digital`; preview and hostile origins are rejected |
| Strategy Call | Live webhook, contact capture, Demo scheduled deal, prep task, GA4 event, Meta step, and notification step completed |
| Tracking Audit | Live production request accepted; Brevo contact/CRM deal/task completed without the old duplicate-list warning or CRM quota failure |
| Backend issues | Issues #4, #5, and #6 closed; no open backend issues as of this review |
| Paid campaign | Cleared technically; not activated or changed |
| Legacy backend | Retain until the pending 2026-08-25 stability checkpoint |

## Immediate Next Action

Do not restart development or repeat production submissions. The next required operation is the **read-only Aug 25 stability checkpoint** in [`AUG_25_STABILITY_CHECKPOINT.md`](AUG_25_STABILITY_CHECKPOINT.md).

If that checkpoint passes:

1. Record the result and change project state from **LAUNCH-READY** to **LAUNCHED AND STABLE**.
2. Decide whether to archive the legacy website-repository backend branch and retained rollback references.
3. Open a separate small backend PR removing the now-obsolete Meetings `?token=` authentication fallback.
4. Review Vercel development-adapter dependency/toolchain advisories separately; major-version remediation is not part of the production release.

## What Not to Reopen

- Do not repeat the Strategy Call or Tracking Audit production submissions solely for evidence.
- Do not repeat the earlier Meta browser/server CAPI dedup test; it remains valid and temporary test-event configuration was intentionally removed.
- Do not redeploy frontend or backend merely to reconfirm the release.
- Do not delete/archive the legacy backend before the Aug 25 checkpoint.
- Do not enable paid traffic without the owner's explicit activation decision.

## Safe Restart Protocol

1. Run `git status` before touching either repository and preserve unrelated local work.
2. Read this file, then [`ATD_PROJECT_OVERVIEW.md`](ATD_PROJECT_OVERVIEW.md), [`registers/OPEN_ITEMS.md`](registers/OPEN_ITEMS.md), and [`AUG_25_STABILITY_CHECKPOINT.md`](AUG_25_STABILITY_CHECKPOINT.md).
3. Refresh remote refs before relying on a SHA.
4. Treat live-system claims as time-bound evidence; verify read-only when a later decision depends on them.
5. Use `staging` for test-ground work. Production work requires a reviewed PR, CI, and an explicitly approved deployment.
6. Never copy secrets, environment values, private contacts, connection strings, or authentication material into docs or chat.

## Preserved Local Work

The original local frontend checkout still had unrelated material when this documentation branch was prepared:

- `src/pages/ConversionTracking.tsx` modification;
- untracked `reports/` material;
- untracked `pipx_shared.pth`.

This continuity PR was updated from an isolated worktree. Those items were not staged, edited, deleted, or interpreted as approved work.

## Evidence Confidence

- **High confidence:** Git/GitHub commit, PR, issue, workflow, and protection state; owner-confirmed production QA tied to the merged backend release.
- **Medium confidence over time:** external platform configuration after the observation date; recheck only when a decision depends on it.
- **Historical context only:** older Notion and ChatGPT planning records that conflict with the launch-ready evidence.

## Safety Boundary

This pack authorizes documentation continuity only. It does not authorize a deploy, rollback, campaign activation, form submission, booking, email, workflow change, environment-variable change, database mutation, branch deletion, or legacy-system retirement.
