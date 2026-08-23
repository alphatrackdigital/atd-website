# Source Inventory and Coverage

Last reviewed: 2026-08-23

## Evidence Hierarchy

1. Dated production verification tied to a release/environment.
2. Current repository, tests, required CI and retained QA evidence.
3. Git/GitHub PR, issue, workflow and branch-protection history.
4. Owner-confirmed controlled release/QA report.
5. Notion decisions and operational records.
6. ChatGPT Website/Martech discussions and planning history.

## Current Git/GitHub Evidence

- Frontend remote `main`: `02eadaf8949a08d46952bbea677b9e2ea212fc48`.
- Frontend PR #42 merged: protected release hardening.
- Frontend PR #44 merged: protected manual rollback.
- Successful `Release public website` workflow at frontend `02eadaf8...`.
- Frontend active `Protect main` ruleset and required `PR release gate`.
- Backend remote `main`: `2f3941fa3a9753de327542925f870b0faeea814b`.
- Backend PR #7 merged on 2026-08-20 with merge commit `2f3941fa...`.
- Backend open-issue query returned no results on 2026-08-23; Issues #4-#6 are recorded closed/completed.
- Existing documentation-only draft PR #43 was reused rather than creating a competing PR.

## Owner-Confirmed Production Evidence

The controlled single-pass release report records:

- backend `2f3941fa...` deployed to production;
- root, blog, admin-auth boundary and origin/CORS checks passed;
- Netlify production secrets isolated and rotated configuration loaded;
- Brevo Meetings header authentication active;
- Strategy Call contact, CRM deal/task, GA4, Meta and notification processing completed;
- live Tracking Audit capture and CRM handoff completed without prior warnings/quota failure;
- no paid campaign was enabled or changed;
- project state is LAUNCH-READY pending Aug 25 stability observation.

## Repository Documentation

Primary sources include:

- `README.md`
- `docs/production-publishing.md`
- `docs/production-rollback.md`
- `docs/codex-handoffs/ATD_MASTER_CODEX_WORKLOG.md`
- `docs/codex-handoffs/WEBSITE_AND_TRACKING_STATE.md`
- `docs/codex-handoffs/BREVO_CURRENT_STATE.md`
- `docs/codex-handoffs/EVIDENCE_ARCHIVE_INVENTORY.md`
- redacted evidence under `docs/codex-handoffs/evidence/`
- historical files in this continuity folder.

## Notion Sources

Connected AlphaTrack Digital workspace pages searched/fetched read-only:

- [ATD Internal Martech Project](https://app.notion.com/p/38217ea57b558119a27eef8311960555)
- [ATD Command Center](https://app.notion.com/p/38e17ea57b558191bd49e7437be514ce)
- [ATD Website Completion & Operations](https://app.notion.com/p/3bf17ea57b55816692daddbb73402731)
- [Finalize Brevo CTMA nurture and handoff workflow](https://app.notion.com/p/37a17ea57b558199aaabf5d8821bb7f6)
- [Activate controlled Meta Ads pilot](https://app.notion.com/p/37a17ea57b558190b649e5ce55564feb)
- [ATD Internal Conversion Tracking and Marketing Automation Implementation](https://app.notion.com/p/38217ea57b558143a990f5f33316e9e3)

These pages substantiate original objectives, operating rules, launch gates, workflow design and case-study intent. Several properties/content blocks still reflect pre-launch state and are marked for a later sync. No Notion page was modified in this pass.

## ChatGPT Project Coverage

- **ATD Website** preserves hosting, profile/positioning, design, booking, Netlify-credit and campaign discussions.
- **ATD Martech** preserves stack blueprint, GTM/GA4 strategy, Brevo setup/workflows/attributes, Ketch, Clarity, Notion operations and agent-continuity rationale.

Conversation history is decision context. It is not treated as proof that a discussed configuration was applied.

## Known Limitations

- The Aug 25 stability result cannot exist before its observation date and is intentionally pending.
- Notion databases were researched selectively rather than exported in full.
- ChatGPT conversations were inventoried/summarized, not reproduced.
- Search Console SQL/result work remains local and excluded from this PR.
- External platform state can drift after the review date; recheck read-only when a future decision depends on it.
- The Netlify Blobs simultaneous-first-delivery race remains a documented backend limitation because the installed client exposes no supported conditional-write/CAS primitive.

## Privacy/Secret Exclusions

This pack excludes credentials, environment values, connection strings, password hashes, private contacts, customer records and unredacted production payloads.
