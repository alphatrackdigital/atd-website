# Source Inventory and Coverage

Last reviewed: 2026-08-19

## Evidence Hierarchy

1. Current live-system verification tied to a date and environment.
2. Current repository, tests, and retained QA evidence.
3. Git/GitHub history.
4. Notion decisions and operational records.
5. ChatGPT Project discussions.

## Repository and Git

- Current audited remote production-source commit: `38f280d0b99a10678de455dac16a671f431d372c`.
- Draft release-hardening source: PR #42 at `3ae5c386bc28c8c86bafaadbd1e73cfd2adb9d53`; remote refs and public PR metadata were rechecked on 2026-08-19.
- History inspected from initial template/rebuild through the 2026-08-19 continuity handoff.
- Branches, remotes, merge commits, release workflows, API handlers, routes, tests, environment names, and handoff/evidence documentation were reviewed.
- Existing local changes were preserved.

Primary detailed sources:

- `README.md`
- `docs/production-publishing.md`
- `docs/codex-handoffs/ATD_MASTER_CODEX_WORKLOG.md`
- `docs/codex-handoffs/WEBSITE_AND_TRACKING_STATE.md`
- `docs/codex-handoffs/BREVO_CURRENT_STATE.md`
- `docs/codex-handoffs/OPEN_ITEMS_FOR_NEXT_AGENT.md`
- `docs/codex-handoffs/EVIDENCE_ARCHIVE_INVENTORY.md`
- `docs/codex-handoffs/TECHNICAL_CHANGELOG.md`
- Redacted evidence below `docs/codex-handoffs/evidence/`

## GitHub

Repository identity was resolved from local Git as `alphatrackdigital/alphatrackdigital`. Local merge history provides PR coverage through PR 38, including the page-redesign sequence, Brevo campaign attributes, Meta readiness/deduplication, and Tracking Audit release work. The connected GitHub metadata calls were slow/partial during this pass, so issue comments and closed-item metadata were not treated as exhaustive.

## Notion

Connected workspace: **AlphaTrack Digital**.

Pages directly searched/fetched include:

- [ATD Internal Martech Project](https://app.notion.com/p/38217ea57b558119a27eef8311960555)
- [ATD Command Center](https://app.notion.com/p/38e17ea57b558191bd49e7437be514ce)
- [ATD Notion Database Audit — 2026-06-29](https://app.notion.com/p/38e17ea57b5581139c1ae15771f6b088)
- [Ketch Consent Readiness — 2026-06-24](https://app.notion.com/p/38917ea57b5581739dede8fc2c13a640)
- [Conversion Tracking Service](https://app.notion.com/p/26317ea57b5581c48f90f8a27a1826ad)
- Brevo campaign readiness, workflow/handoff, deployment, measurement-plan, and Agency OS search results.

Notion’s current-plan database-query limits meant this was a targeted search/direct-fetch review rather than a complete relational database export. No Notion content was modified.

## ChatGPT Project — ATD Website

Project ID observed in the web UI: `g-p-698ca7a5b63081919eec993b7e77faa4`.

Visible history inventoried during this pass:

- Meta Ads Campaign Strategy (two conversations)
- Figma Design Post Launch / Post-Launch
- Netlify Credits Issue
- ATD Profile and Website Alignment
- GPT-5.5 and ATD Development
- Brevo Booking Page Customization
- Codex and AVIF Support
- Design Reference Images

These titles confirm the project’s hosting, visual, positioning, booking, and campaign workstreams. Repository/Notion evidence was used for implementation claims.

## ChatGPT Project — ATD Martech

Project ID observed in the web UI: `g-p-6880faf59b948191bb84400d2e23ea2d`.

The visible history spans:

- Martech Stack Blueprint and service structure
- Conversion Tracking Strategy and GTM Constitution
- ATD GTM Batch Deployment
- GA4/GTM/Notion setup and tasks
- Brevo setup, API/MCP, campaigns, workflows, attributes, booking, and campaign operations
- Ketch setup/dashboard and Microsoft Clarity integration
- Notion database audit and operational organization
- Namecheap, forms, privacy, Trustpilot, Tally, user metrics, and tool/agent continuity discussions

This history is valuable for intent and decision rationale. It is not assumed to prove that every discussed configuration was applied.

## Known Coverage Gaps

- The current public cPanel commit was verified as `45043ef7` by byte-identical reconstruction. The later protected workflow run at `4fdcec59` succeeded historically but is not the current public fingerprint.
- External martech platforms were not re-audited live on 2026-08-17.
- ChatGPT conversations were inventoried by project/title; this pack does not reproduce every transcript.
- GitHub issue/PR comments were not exhaustively exported.
- Notion databases were not fully queried because of plan/tool limits.
- Search Console SQL source files were identified but their query results were not present in the audited `reports/` folders. The local report files were deliberately excluded from this GitHub handoff.

These gaps are reflected as open items rather than silently inferred.
