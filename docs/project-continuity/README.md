# ATD Project Continuity Pack

Last reviewed: 2026-08-23

This folder is the durable restart point for the AlphaTrack Digital website, backend and martech implementation. Current state: **LAUNCH-READY**, with the Aug 25 stability checkpoint pending.

## Read Order

1. [`ATD_RESUME_HERE.md`](ATD_RESUME_HERE.md) — authoritative status, next action and safety boundaries.
2. [`ATD_PROJECT_OVERVIEW.md`](ATD_PROJECT_OVERVIEW.md) — comprehensive history, architecture, integrations, timeline, decisions and completion state.
3. [`AUG_25_STABILITY_CHECKPOINT.md`](AUG_25_STABILITY_CHECKPOINT.md) — pending read-only observation-window closeout.
4. [`CHATGPT_WEB_HANDOFF.md`](CHATGPT_WEB_HANDOFF.md) — compact cross-agent continuation prompt and evidence rules.
5. [`registers/GIT_REPOSITORIES_AND_BRANCHES.md`](registers/GIT_REPOSITORIES_AND_BRANCHES.md) — canonical repositories, environments and cleanup constraints.
6. [`registers/MARTECH_INTEGRATIONS.md`](registers/MARTECH_INTEGRATIONS.md) — integration and lead-flow map.
7. [`registers/DECISION_LOG.md`](registers/DECISION_LOG.md) — durable architectural and operating decisions.
8. [`registers/OPEN_ITEMS.md`](registers/OPEN_ITEMS.md) — remaining non-launch-blocking work.
9. [`sources/SOURCE_INVENTORY.md`](sources/SOURCE_INVENTORY.md) — evidence hierarchy, source coverage and limitations.

## Historical Evidence

- [`FRONTEND_PRODUCTION_RELEASE_2026-08-20.md`](FRONTEND_PRODUCTION_RELEASE_2026-08-20.md)
- [`FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md`](FRONTEND_RELEASE_GOVERNANCE_2026-08-19.md)
- [`PRODUCTION_ROLLBACK_GUARD_2026-08-19.md`](PRODUCTION_ROLLBACK_GUARD_2026-08-19.md)
- [`ATD_BACKEND_MIGRATION_GATE.md`](ATD_BACKEND_MIGRATION_GATE.md)
- [`LEGACY_BRANCH_RECONCILIATION.md`](LEGACY_BRANCH_RECONCILIATION.md)
- [`../codex-handoffs`](../codex-handoffs)

Historical documents preserve how decisions were reached. When their status conflicts with `ATD_RESUME_HERE.md`, the newer reviewed entry point wins.

## Evidence Labels

- **Verified current:** tied to current Git/GitHub or dated live-system evidence.
- **Owner-confirmed production evidence:** reported from the controlled release/QA pass and tied to a release SHA.
- **Historically verified:** reliable dated evidence not repeated in the latest pass.
- **Implemented:** present in current source/tests but not necessarily re-exercised live.
- **Planned/unknown:** insufficient implementation or current-state evidence.

Never store secrets, environment values, connection strings, private contacts, authentication material, password hashes, or unredacted customer records in this pack.
