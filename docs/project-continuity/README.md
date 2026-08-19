# ATD Project Continuity Pack

Last reviewed: 2026-08-19

This folder is the restart point for the AlphaTrack Digital website and internal martech implementation. It consolidates repository, Git/GitHub, Notion, and ChatGPT Project history without treating planning conversations as proof of implementation.

## Read Order

1. [`CHATGPT_WEB_HANDOFF.md`](CHATGPT_WEB_HANDOFF.md) — self-contained GitHub-to-ChatGPT-web handoff, current verified state, plugin usage, exclusions and continuation tasks.
2. [`ATD_RESUME_HERE.md`](ATD_RESUME_HERE.md) — current pause state and the next safe actions.
3. [`ATD_PROJECT_OVERVIEW.md`](ATD_PROJECT_OVERVIEW.md) — project history, architecture, workstreams, decisions, and progress.
4. [`registers/MARTECH_INTEGRATIONS.md`](registers/MARTECH_INTEGRATIONS.md) — integrations, data flows, verification, and gaps.
5. [`LEGACY_BRANCH_RECONCILIATION.md`](LEGACY_BRANCH_RECONCILIATION.md) — file-level legacy branch coverage, risks, archive and deletion decisions.
6. [`FRONTEND_PRODUCTION_VERIFICATION.md`](FRONTEND_PRODUCTION_VERIFICATION.md) — exact live cPanel commit fingerprint and GET-only smoke evidence.
7. [`FRONTEND_RELEASE_DELTA_REVIEW.md`](FRONTEND_RELEASE_DELTA_REVIEW.md) — live-to-main release review, cPanel prerequisites, risks and safe release sequence.
8. [`registers/OPEN_ITEMS.md`](registers/OPEN_ITEMS.md) — reconciled restart backlog.
9. [`registers/GIT_REPOSITORIES_AND_BRANCHES.md`](registers/GIT_REPOSITORIES_AND_BRANCHES.md) — canonical repositories, branch evidence, cleanup and rename guidance.
10. [`sources/SOURCE_INVENTORY.md`](sources/SOURCE_INVENTORY.md) — source coverage and limitations.

Existing detailed handoffs and redacted QA evidence remain under [`../codex-handoffs`](../codex-handoffs). This pack summarizes them; it does not replace their detailed evidence.

## Evidence Rules

Claims are classified as:

- **Verified implemented** — supported by current code, Git history, tests, or retained QA evidence.
- **Historically verified** — supported by dated evidence but not rechecked on 2026-08-17.
- **Implemented, production unverified** — present in code but the current public deployment was not proven.
- **Reported external state** — documented from Notion or prior live-system review but not rechecked now.
- **Planned** — discussed or specified without implementation evidence.
- **Unknown** — insufficient evidence.

Never copy secrets, authentication material, private contact data, or unredacted lead records into this folder.
