# AlphaTrack Digital Website and Martech Project Overview

Last reviewed: 2026-08-23

## Executive Summary

AlphaTrack Digital's website project began as a website rebuild and conversion-tracking initiative and expanded into an internal martech implementation, production operations system, and reusable agency case study. The resulting system combines a protected React/cPanel frontend, a hardened Netlify backend, MongoDB-backed admin content, Brevo lead and CRM workflows, consent-aware GTM/GA4/Meta/Clarity measurement, production rollback controls, redacted QA evidence, and AI-agent continuity documentation.

The project is now **LAUNCH-READY**. Frontend and backend releases are deployed; production security boundaries and core public surfaces passed verification; Strategy Call and Tracking Audit production flows completed through CRM and analytics; and backend Issues #4, #5, and #6 are closed. Paid Tracking Audit traffic is technically cleared but has not been activated. The only time-bound operational gate is the read-only 2026-08-25 stability checkpoint before any legacy-backend retirement.

## Original Objectives

- Present ATD as a premium, measurement-first digital growth agency.
- Convert visitors through Contact, Tracking Audit, Newsletter, Exit Popup, and Strategy Call journeys.
- Preserve consent, route, offer, UTMs, click IDs, campaign context, and source lifecycle.
- Route leads into Brevo segmentation, notifications, automation, and CRM follow-up.
- Measure journeys through GTM, GA4, Meta and Clarity without bypassing consent choices.
- Maintain safe production publishing, rollback, testing, and evidence procedures.
- Turn ATD's implementation into a repeatable internal delivery model and case study.

## Current Architecture

```text
Visitor
  -> alphatrack.digital / www.alphatrack.digital
     -> static Vite + React + TypeScript site on Namecheap/cPanel
     -> Ketch consent + GTM dataLayer
        -> GA4 / Meta Pixel / Clarity / Conversion Linker as consent permits
     -> public lead and content API calls
        -> Netlify alphatra-serv
           -> hardened Netlify Functions
           -> MongoDB Atlas (admin users, blog content, captured records as designed)
           -> Brevo Contacts/Lists/DOI/Meetings/notifications
           -> Brevo CRM deals and tasks
           -> GA4 Measurement Protocol
           -> Meta CAPI

Development and QA
  -> frontend repository staging -> Vercel frontend test project
  -> backend repository staging -> Vercel backend test project
  -> Netlify frontend project -> frontend-only/manual test mirror; automatic builds stopped
```

Production is intentionally split: cPanel serves the static website and Netlify `alphatra-serv` serves the public API/backend. Vercel remains a test ground, not the live service. The canonical backend source is the separate backend repository, not the legacy website-repository backend branch.

## Production Identities

| Surface | Canonical source | Deployed/current evidence |
| --- | --- | --- |
| Frontend | `alphatrackdigital/alphatrackdigital` protected `main` | `02eadaf8949a08d46952bbea677b9e2ea212fc48`; successful protected `Release public website` run |
| Backend | `alphatrackdigital/atd-backend-test` protected `main` | `2f3941fa3a9753de327542925f870b0faeea814b`; PR #7 merge and owner-confirmed Netlify production release |
| Public frontend | Namecheap/cPanel | `https://alphatrack.digital` and `https://www.alphatrack.digital` |
| Public backend | Netlify | `alphatra-serv`; production browser origins restricted to the two canonical domains |
| Frontend test | Vercel + optional Netlify frontend mirror | `staging`; do not use production `main` for experiments |
| Backend test | Vercel | backend `staging`; keep test data and configuration isolated |

## Website Scope

The website includes the homepage, About, Services and detailed service pages, Expertise and industry pages, Results, Blog and article routes, Contact and confirmation, Book a Call and confirmation, Tracking Audit landing page, Newsletter confirmation, Privacy, Cookie, Terms, SEO/prerendered routes, sitemap, custom 404, responsive layouts, and an authenticated admin boundary for managed backend content.

The production release workflow packages an immutable reviewed SHA, rejects production source maps, creates a pre-deploy backup, performs GET-only smoke checks, rolls back automatically on immediate activation failure, emits artifacts, and submits IndexNow on a best-effort basis. A separate protected manual rollback workflow requires explicit confirmation, current release identity, Production approval, incident preservation, and post-rollback smoke checks.

## Lead and CRM Journeys

| Journey | Entry point | Processing and evidence state |
| --- | --- | --- |
| Contact inquiry | `/contact-us` | Contact/list capture, attribution, notification and qualified CRM handling implemented and tested |
| Tracking Audit | `/offer/tracking-audit` | Live production QA passed: request accepted, backend completed, Brevo deal and follow-up task created, no old duplicate-list warning or CRM quota failure |
| Newsletter | Site newsletter surfaces | Brevo DOI/fallback, list routing, consent and Subscribe tracking implemented |
| Exit popup | Shared exit-intent UI | Brevo capture, attribution, consent, notification and tracking implemented |
| Strategy Call | `/book-a-call` + Brevo Meetings | Live header-auth webhook passed: contact processed, Demo scheduled deal and prep task created, GA4 event sent, Meta and notification ledger steps completed |

The Brevo contract preserves explicit consent and source metadata. `SERVICE_INTEREST` remains an array and `MONTHLY_BUDGET` remains a category value `1`-`4`. Test/QA identities must remain excluded from live reporting and sends.

## Backend Security and Reliability

Backend PR #7 completed the production-security boundary:

- production-aware CORS and explicit rejection of supplied hostile/preview origins before writes;
- preserved no-Origin server-to-server/webhook behavior;
- hardened admin/authentication and regression coverage;
- removal of redundant Brevo list-add calls;
- CRM quota resilience without turning successful capture into a failed submission;
- structured, sanitized provider logging;
- durable per-step Meetings processing for contact, CRM deal, CRM task, GA4, Meta, and notification;
- definite-versus-ambiguous provider outcome classification that prevents automatic replay of potentially committed CRM creates;
- supported header authentication with the historical Meetings query-token fallback temporarily retained;
- backend CI covering tests and TypeScript type-check.

The installed Netlify Blobs client does not expose a supported conditional-write/CAS primitive. A simultaneous first-delivery race remains a documented residual limitation. Ambiguous started steps fail closed and require reconciliation rather than automatic replay.

## Tracking, Consent and Martech

- **Ketch:** consent-management source; bridged to Google Consent Mode.
- **GTM:** orchestration and normalized dataLayer contract.
- **GA4:** page/conversion analytics plus Measurement Protocol for confirmed Meetings.
- **Meta Pixel/CAPI:** browser/server events with shared event IDs and prior deduplication proof.
- **Clarity:** behavior analytics gated under the intended consent category.
- **Google Ads:** linkage/audience readiness; paid activation remains an owner decision.
- **Brevo:** contacts, lists, DOI, Meetings, automation templates/workflows, notifications, CRM and operational handoff.
- **MongoDB Atlas:** canonical backend datastore after migration from the developer's earlier personal account to the ATD-controlled project.
- **Notion:** business-readable Agency OS, tasks, evidence and case-study records.

The earlier Meta browser/server deduplication test remains accepted. Meta was not returned to Test Events for the final release because the temporary code was intentionally removed and another production lead was not justified.

## Reconciled Timeline

| Period | Phase | Outcome |
| --- | --- | --- |
| 2025 planning | Service and stack exploration | Early website, Namecheap, form, CRM, tracking and Notion plans established; planning only where later evidence is absent |
| Feb 2026 | Rebuild and measurement foundation | Vite/React site, SEO/legal work, GTM constitution, GA4 strategy, Brevo and booking foundations |
| Mar-Apr 2026 | UX, performance and lead capture | Responsive templates, service content, performance, contact/newsletter/popup flows, consent synchronization and prerendering |
| May 2026 | Structured delivery | PR-led page refinements, Expertise/Results, conversions, notifications and `alphatra-serv` public API direction |
| Jun 2026 | Martech hardening | Campaign attributes, source lifecycle, schema normalization, CRM API fallback, GA4 Meetings, Meta CAPI/event IDs, Ketch bridge, Clarity, extensive QA and Notion Agency OS |
| Jul 2026 | Campaign readiness | Brevo organization, Meta dedupe fixes, Tracking Audit lander, test-ground release evidence and pilot specification |
| Aug 10-19 2026 | Production governance | Protected cPanel packaging/deploy workflow, PR release gate, `Protect main`, source-map controls, IndexNow and protected rollback |
| Aug 19-20 2026 | Frontend release | Protected frontend `main@02eadaf8` successfully deployed to cPanel |
| Aug 18-20 2026 | Backend reconciliation and hardening | Canonical backend separated, MongoDB ownership reconciled, Netlify production rebound, PR #7 reviewed and merged |
| Aug 20 2026 | Single-pass launch verification | Backend `2f3941fa` deployed; root/blog/admin/CORS, Strategy Call and Tracking Audit production gates passed; Issues #4-#6 closed |
| Aug 21-24 2026 | Observation window | Hold production configuration stable and retain legacy backend |
| Aug 25 2026 | Pending stability checkpoint | Recheck health read-only; only then decide legacy retirement and change status to launched/stable |

## Key Decisions

1. **cPanel remains the production frontend.** Vercel and Netlify frontend are test surfaces.
2. **Netlify `alphatra-serv` is the production backend.** Vercel is the backend test ground.
3. **Canonical production branches are protected `main`; testing uses `staging`.**
4. **The separate backend repository is canonical.** The website repository's legacy backend is retained only through the stability checkpoint.
5. **Production browser origins are allowlisted, not inferred from CORS headers alone.**
6. **Meetings retries fail closed on ambiguous non-idempotent writes.** Duplicate CRM creation is less acceptable than an operator reconciliation step.
7. **The Meetings query-token fallback is now obsolete but removed only in a later isolated PR.** Live header authentication has been proven.
8. **Paid Tracking Audit traffic is technically cleared but never activated implicitly.** Activation is a business decision.
9. **Historical Notion/ChatGPT records explain intent; current Git and live QA govern implementation claims.**
10. **Legacy cleanup follows observation, tagging and binding verification.** It is not bundled with release work.

See [`registers/DECISION_LOG.md`](registers/DECISION_LOG.md) for the durable decision register.

## Current Completion State

| Workstream | State |
| --- | --- |
| Development | Complete |
| Security hardening | Complete |
| Frontend production deployment | Complete |
| Backend production deployment | Complete |
| Brevo/CRM | Complete for launch gate |
| Strategy Call | Complete |
| Tracking Audit | Complete |
| Launch verification | Complete |
| Paid campaign | Cleared, awaiting owner activation |
| Legacy backend retirement | Pending Aug 25 checkpoint |

## Remaining Non-Blocking Work

1. Perform the Aug 25 read-only stability checkpoint.
2. Remove the Meetings `?token=` fallback in a small reviewed backend PR after the checkpoint/reconciliation window.
3. Review Vercel development-adapter dependency/toolchain advisories separately because remediation involves major-version changes.
4. Sync Notion's older launch-gate records from this evidence after the GitHub continuity PR is reviewed.
5. Continue the internal case study and operational reporting cadence as growth work, not launch remediation.

## Ownership and Access Dependencies

- The owner controls campaign activation, Production approvals and destructive cleanup decisions.
- Hosting administration and any cPanel-only action may still require the external developer unless access changes.
- Netlify, Vercel, MongoDB Atlas, Brevo, Notion and GitHub access must be revalidated at the time of any later mutation.
- No agent may infer permission to submit leads, send messages, mutate CRM/database records, deploy, or retire infrastructure from read-only access.

## Evidence and Confidence

- GitHub repository state, workflow runs, PRs, issues and SHAs were refreshed on 2026-08-23.
- The final production/QA state is based on the owner-approved single-pass release report tied to backend `2f3941fa` and the successful frontend workflow release.
- Connected Notion pages were searched and fetched read-only. They remain valuable historical/operational sources but contain superseded pre-launch gates.
- ChatGPT Website/Martech project inventories provide rationale but are not treated as deployment proof.

## Resume Point

Resume with [`ATD_RESUME_HERE.md`](ATD_RESUME_HERE.md). Do not begin new production work until the Aug 25 checkpoint result is recorded or the owner explicitly changes priority.
