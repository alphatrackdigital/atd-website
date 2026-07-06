# Codex Handoffs

This folder contains local handoff documentation for AlphaTrack Digital / ATD MarTech work. It is repo-side source material for future Codex, ChatGPT, Claude, or human review before anything is copied into Notion or used for live operations.

Current release work: the Tracking Audit campaign lander redesign and Meta pilot operating specification were completed on 2026-07-06. Validation passed with 74 tests and a production build. Deployment status and post-deployment evidence are tracked in `OPEN_ITEMS_FOR_NEXT_AGENT.md` and `evidence/tracking-audit-lander-release-2026-07-06/summary.md`.

Meta CAPI launch readiness is documented in
`META_CAPI_LAUNCH_READINESS_2026-07-01.md`. The current cPanel build calls the
Vercel `atd-backend-test` project, not Netlify; launch remains blocked until the
Vercel backend has the required Meta variables, is redeployed, and Browser +
Server deduplication is proven.

The current campaign experiment specification is
`META_ADS_TRACKING_AUDIT_PILOT_2026-07-06.md`.

Read first:

1. `AI_AGENT_CONTINUITY_PROTOCOL.md` (agent roles, startup/handoff routine, safety boundaries)
2. `ATD_MASTER_CODEX_WORKLOG.md`
3. `OPEN_ITEMS_FOR_NEXT_AGENT.md`
4. `BREVO_CURRENT_STATE.md`
5. `KETCH_CONSENT_READINESS_2026-06-24.md`
6. `KETCH_PREVIEW_QA_2026-06-24.md`
7. `KETCH_REMEDIATION_PREVIEW_QA_2026-06-24.md`
8. `KETCH_GTM_STRICT_PREVIEW_QA_2026-06-24.md`

Future agents should update this folder after major work with what changed, what was verified, blockers, risks, and exact next steps. Keep verified facts separate from unverified notes.

Never include secrets, token values, webhook secrets, API keys, passwords, cookies, auth headers, private transcript text, or credential values. Document environment variables by name and purpose only.

Do not activate Brevo workflows, send campaigns or test messages, deploy, commit, push, merge, publish, or change live services without explicit user approval.
