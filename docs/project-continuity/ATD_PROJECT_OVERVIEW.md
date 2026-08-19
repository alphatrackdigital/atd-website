# AlphaTrack Digital Website and Martech Project Overview

Last reviewed: 2026-08-18

## Executive Summary

The ATD project began as a website rebuild and conversion-tracking initiative, then expanded into a complete internal martech implementation and operational case study. The repository now contains a production-oriented React website, multi-path Brevo lead capture, attribution and consent plumbing, GTM/GA4/Meta tracking, Ketch and Clarity integration work, extensive redacted QA evidence, and a protected cPanel release workflow.

The main implementation is substantially complete. The recurring pause point has not been a missing frontend; it has been the gap between code/test-ground readiness and proof of the current public production state, plus external-system launch gates such as Brevo exclusions/workflow state, production consent QA, and Meta event deduplication.

## Project Objectives

- Present ATD as a premium, measurement-first digital growth agency.
- Convert qualified visitors through strategy-call, contact, newsletter, exit-intent, and Tracking Audit paths.
- Capture consent, route, offer, UTMs, click IDs, and first/latest source data consistently.
- Route leads into Brevo lists, notifications, nurture, and CRM follow-up.
- Measure key journeys in GA4, Meta, and the wider GTM stack without violating consent choices.
- Use the ATD implementation as a repeatable delivery model and future case study.
- Maintain a safe production publishing and recovery process for the static cPanel website.

## Timeline

| Period | Workstream | Reconciled outcome |
| --- | --- | --- |
| 2025 planning | Early service/site planning | ChatGPT Martech history includes service structure, form options, Namecheap, Notion, and initial martech blueprints. Treat as planning unless supported later. |
| Feb 2026 | Website rebuild and measurement foundation | Vite/React site rebuilt; SEO/legal work began; GTM constitution, GA4 property, tracking strategy, Brevo setup, and booking evaluation were discussed and implemented in stages. |
| Mar–Apr 2026 | UX, performance, content, lead capture | Homepage/service templates, responsiveness, performance, contact flow, prerendering, Brevo popup/newsletter, consent sync, and DOI work advanced. |
| May 2026 | Structured delivery and production backend | PR-based page refinements; Expertise/Results added; GTM conversions and Brevo lead notification/routing expanded; `alphatra-serv` became the documented public API service. |
| Jun 2026 | Martech hardening and recovery | Campaign attributes, source lifecycle, schema normalization, CRM fallback, GA4 meeting webhook, Meta CAPI/event IDs, Ketch consent bridge, Clarity, extensive lead-flow and consent QA, Notion Agency OS, and continuity docs. |
| Jul 2026 | Launch readiness and campaign lander | Brevo list organization, Meta dedupe fixes, Tracking Audit lander redesign, test-ground release validation, campaign pilot specification; production deployment remained a key gate in dated handoffs. |
| Aug 2026 | Production publishing and discovery | Protected cPanel GitHub Actions release/rollback workflow, broader prerender/build validation, IndexNow submission, and GSC audit SQL artifacts. Asset reconstruction on 2026-08-18 verified `45043ef7` as the live cPanel build; current `main@38f280d0` is newer. |
| Aug 2026 backend migration | Backend reconciliation and controlled Netlify cutover | Canonical backend PRs #2/#3 merged; Atlas data and recovery snapshot verified; `alphatra-serv` rebound to `atd-backend-test/main@c9035d19`; repeated non-mutating smoke checks passed. |

## Website Scope

The current router includes:

- Homepage and About Us
- Services overview and detailed service pages
- Conversion Tracking, Marketing Automation, and Paid Media pages
- Expertise overview and industry detail pages
- Results
- Blog and article routes
- Contact Us and thank-you page
- Book a Call and confirmation page
- Tracking Audit campaign landing page
- Newsletter confirmation
- Privacy, Cookie, Terms, and custom 404 routes

The website uses lazy routes, shared layout/components, SEO configuration, prerendered output, a sitemap, static-host routing support, and locally hosted fonts. Blog content remains repository-backed; the older Sanity/WordPress CMS discussion is not implemented evidence.

## Architecture

```text
Visitor
  -> alphatrack.digital (static React build on Namecheap/cPanel)
     -> pages, SEO, prerendered routes, consent UI, dataLayer
     -> lead calls to approved API endpoints
        -> alphatra-serv.netlify.app (Netlify production backend)
           -> Brevo contacts/lists/DOI/notifications/CRM fallback
           -> Meta CAPI where configured
           -> GA4 Measurement Protocol for meeting confirmation
  -> GTM
     -> GA4 / Meta / Conversion Linker / Clarity according to consent
```

Repository-compatible Netlify and Vercel handlers remain alongside the cPanel frontend. This is intentional but creates configuration-drift risk: frontend endpoint variables, backend environment scope, and the deployed code version must agree.

Vercel remains the testing ground for both frontend and backend development. The Netlify frontend project is for frontend testing only; Netlify `alphatra-serv` is the production backend. The canonical backend source is now the separate `atd-backend-test/main` repository rather than the website repository's legacy `backend` branch.

## Lead and Martech Model

| Journey | Website surface | Primary destination | Key evidence |
| --- | --- | --- | --- |
| Contact inquiry | `/contact-us` | Brevo contact list 8 + notification/CRM handling | Code, tests, June QA evidence |
| Tracking Audit | `/offer/tracking-audit` | Brevo list 11 + campaign attribution + CRM handling | Code, tests, July release evidence |
| Newsletter | Footer/newsletter surfaces | Brevo list 9 and DOI/fallback path | Code, tests, June QA evidence |
| Exit popup | Shared exit-intent component | Brevo/default list 10 | Code, tests, June QA evidence |
| Strategy call | `/book-a-call` and Brevo Meetings | Strategy-call list/meeting webhook/GA4 | Code and partial historical live proof; CRM/webhook completeness remains a decision |

Brevo mappings explicitly preserve consent, source, route, offer, campaign metadata, and attribution. `SERVICE_INTEREST` must remain an array and `MONTHLY_BUDGET` must remain in Brevo categories `1`–`4`.

## Tracking and Consent

- The frontend pushes normalized events to the GTM dataLayer.
- GA4 conversion and route-view handling was historically verified in staging/test environments.
- Meta CAPI handlers and browser event-ID propagation exist for Lead/Subscribe deduplication.
- Ketch consent is bridged to the real Google Consent Mode update API.
- Clarity was historically installed through GTM under analytics consent.
- Brevo Conversations was classified as a functional/support widget rather than analytics/ad tracking in the July fix.
- Google Ads remained largely at Conversion Linker/audience-source readiness; conversion delivery was deferred.

Historical test-ground evidence is strong, but production drift is possible and should be rechecked before paid traffic.

## Git and Delivery History

The repository moved from direct/bot-generated changes to a more controlled PR workflow. Significant merge groups include:

- PRs 1–4: global foundation, SEO, performance, exit-intent popup.
- PRs 5–23: Brevo consent, mobile refinements, newsletter/footer, About, Services, service details, Expertise, and Results.
- PR 24: Brevo campaign attributes.
- PRs 31, 33, 35: Meta CAPI readiness and browser deduplication fixes.
- PRs 36–38: Tracking Audit lander and release evidence.
- August direct commits: protected production publishing and IndexNow.

Frontend `main` and backend-repository `main` are the two canonical production branches, with matching `staging` branches for test-ground work. The website repository's obsolete `deploy` and `vercel-backend` branches were removed on 2026-08-18 after their exact tips were preserved as verified archive tags. The legacy `backend` branch remains temporarily for rollback context through the Netlify stability window.

## Notion and ChatGPT Roles

Notion evolved into the business-readable Agency OS with projects, campaigns, tasks, playbooks, SOPs, evidence, tools, and weekly reviews. Its strongest current records distinguish implementation-complete work from launch-gated work.

The ChatGPT Projects preserve rationale and exploration:

- **ATD Website**: profile/website alignment, hosting/Netlify credits, booking-page customization, Figma/post-launch design, Meta campaign strategy, design references.
- **ATD Martech**: original stack blueprint, GTM constitution/strategy, Brevo setup/API/workflows/campaigns/attributes, Ketch, Clarity, Notion operations, tools and agent continuity.

These conversations explain intent but are lower-confidence than repository and retained QA evidence.

## Completed Versus Paused

### Completed or strongly evidenced

- Full website information architecture and major page redesigns.
- Lead capture and Brevo routing code with targeted tests.
- Consent, attribution, campaign metadata, and source lifecycle plumbing.
- Tracking Audit lander and campaign specification.
- GTM/GA4/Meta/Ketch/Clarity test-ground work with retained evidence.
- Notion Agency OS and agent-continuity process.
- Protected static production publishing workflow and release artifact validation.

### Paused or requiring re-verification

- Review and approve the `45043ef7..38f280d0` production delta before using the protected release workflow to bring cPanel up to current `main`.
- Current production consent matrix after the latest build.
- Current Brevo workflows, active contacts, exclusions, credits, webhooks, and deliverability.
- Current GA4 and Meta production event/deduplication state.
- Optional Book-a-call CRM deal/task and custom webhook proof.
- Controlled Meta Tracking Audit campaign launch.
- CMS decision/implementation and case-study publication.

## Main Risks

- Documentation contains historical contradictions, especially around Netlify/Vercel/cPanel roles and old launch dates.
- Code presence can be mistaken for deployed behaviour.
- External platform configuration may drift independently of Git.
- Test/QA contacts may pollute Brevo reporting or workflow sends without explicit exclusions.
- Multiple compatible backend copies can diverge.
- The working tree contains unrelated user changes that must be preserved.

## Current Recommendation

Resume from production-state verification, not from another redesign. Once the deployed commit and protected release workflow are confirmed, repeat the production consent/tracking and approved lead-path gates. Only then decide whether to launch the Meta pilot, refine content, or continue platform expansion.
