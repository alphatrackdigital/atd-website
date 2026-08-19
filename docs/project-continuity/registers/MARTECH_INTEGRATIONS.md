# ATD Martech Integration Register

Last reviewed: 2026-08-19

| System | Role | Implementation state | Last retained evidence | Resume action |
| --- | --- | --- | --- | --- |
| Brevo Contacts/Lists | Lead storage and segmentation | Verified implemented; external state historically reviewed | June–July code/tests and redacted QA | Read-only audit lists 7–14, fields, credits, exclusions, and current routing |
| Brevo DOI | Newsletter consent confirmation | Verified implemented with fallback | Code/tests and June evidence | Confirm template, redirect, sender/domain, and live behaviour before campaign use |
| Brevo Meetings | Booking | Implemented/partial live proof | Booking/list/email historically verified; CRM/webhook proof incomplete | Decide whether another controlled booking is required |
| Brevo Conversations | Support chat widget | Verified implemented | July test-ground evidence | Confirm current production load and privacy classification |
| Brevo CRM fallback | Deal/task handoff | Verified implemented in handlers | Code/docs; external outcomes partially verified | Confirm pipeline/owner/rules and prevent duplicates |
| Brevo transactional webhook | Email event ingestion | Handler implemented, production registration historically incomplete | Code/tests/docs | Confirm endpoint and auth behaviour before registration |
| GTM `GTM-MVXWCTZ8` | Tag orchestration | Reported published as Version 9; code-side contract verified | June consent evidence | Read-only container/workspace comparison and production preview |
| GA4 | Page and conversion analytics | Historically verified; current production unknown | June test-ground/realtime evidence | Verify route views and agreed conversions after deployed commit is confirmed |
| GA4 Measurement Protocol | Meeting confirmation | Verified implemented | Meeting-webhook tests and docs | Confirm production secret/debug mode and approved live event proof |
| Meta Pixel | Browser events | Implemented with consent and late-readiness handling | July tests/evidence | Verify production Lead/Subscribe behaviour |
| Meta CAPI | Server events and dedupe | Verified implemented; production configuration requires proof | Code/tests and July readiness docs | Confirm environment scope and Browser/Server event-ID match |
| Ketch | CMP and consent signal | Historically verified on test ground | June multi-scenario evidence | Repeat production consent matrix; inspect policy/config drift read-only |
| Microsoft Clarity | Behaviour analytics | Reported installed through GTM under analytics consent | June test-ground evidence | Confirm current project/tag, masking, recordings, and consent gate |
| Google Ads | Conversion readiness/audiences | Partial; Conversion Linker and GA4-linked audience source | June read-only evidence | Keep conversions/billing deferred until campaign decision |
| Vercel | Frontend/backend test ground | Both canonical repositories have controlled `staging` branches; stable test domains and Git build filters are pinned to `staging` | 2026-08-18 binding/isolation verification; PR #42 frontend preview passed | Keep test branches controlled; avoid real submissions while Preview shares Production integrations |
| Netlify frontend | Frontend test mirror | Connected to website `staging`; automatic builds stopped; current deploy retained | 2026-08-18 binding/deploy evidence | Use an explicit draft deploy only when Netlify-specific validation is necessary; avoid credit-consuming automatic builds |
| `alphatra-serv` Netlify | Public API backend | Live from canonical `atd-backend-test/main@c9035d19`; repeated non-mutating smoke passed; `9b782887` retained as rollback | 2026-08-18 migration and Atlas reconciliation | Hold configuration stable and run the closing read-only checkpoint no earlier than 2026-08-25 |
| Namecheap/cPanel | Public static frontend | Current architecture | README and August release workflow | Verify deployed commit and protected workflow prerequisites |
| GitHub Actions | Release control | Implemented; code-level hardening prepared in draft PR #42 | Commits `3ad4f10`, `4fdcec5`; PR #42 at `3ae5c386` | Review PR #42, tighten governance where supported, then run the read-only connection check before any release |
| IndexNow | Post-release URL notification | Implemented; non-blocking failure semantics prepared in draft PR #42 | Commit `4fdcec5`; PR #42 | Confirm behaviour in the next explicitly approved production release |
| Search Console | Search performance/indexing | SQL audit artifacts exist | `reports/gsc-*` | Review findings and connect them to the next SEO backlog |
| Notion Agency OS | Operational source of truth | Verified present | Connected workspace audit | Sync only reviewed, evidence-backed status changes |

## Lead Data Contract

Every priority lead path should retain, where applicable:

- Explicit consent status and timestamp
- Lead source plus first/latest source lifecycle
- Website route and offer
- UTM parameters and supported click IDs
- Campaign/source/medium/content/term metadata
- Meta browser/server event ID
- Service interest as an array
- Monthly budget as category `1`–`4`
- QA/test identity flags or exclusion mechanism

## Environment Variables

Document names and purpose only; never values. The main families are:

- `BREVO_*`: API access, lists, DOI, consent fields, webhooks, meetings.
- `GA4_*`: measurement ID, Measurement Protocol secret/debug/event configuration.
- `GTM_CONTAINER_ID`.
- `META_*`: pixel, CAPI token/version/test code.
- `VITE_LEADS_ENDPOINT`, `VITE_BREVO_SUBSCRIBE_ENDPOINT`, `VITE_SITE_URL`.
- Optional Supabase variables retained in the frontend integration.

Before production use, verify environment scope on the actual runtime. A July failure occurred because required Brevo variables existed for Vercel Production but not Preview.
