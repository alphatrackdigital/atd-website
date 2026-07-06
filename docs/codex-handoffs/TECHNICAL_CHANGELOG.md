# Technical Changelog

## 2026-07-06 Tracking Audit Campaign Lander

- Reworked `/offer/tracking-audit` into a campaign-focused landing page with structured reassurance, audit coverage, deliverables, process, qualification, methodology, FAQ, and a standard service-close CTA.
- Preserved `tracking-audit-form`, `#claim`, `tracking_audit_offer`, `tracking_audit_submit`, Meta `event_id` pairing, duplicate suppression, form validation, anti-abuse timing, consent, canonical URL, and SEO behavior.
- Added desktop continuation guidance and a mobile-specific compact hierarchy using the existing 24px service-page gutter.
- Added the July 2026 pilot experiment and launch-gate specification.
- Validation passed: 74 tests, production client/SSR/prerender build, and ESLint with seven existing warnings.

## 2026-06-29 Ketch Ad Consent Propagation Correction

- Owner Tag Assistant evidence showed a mismatch: `atd_consent_update` contained granted advertising fields while GTM's actual Consent state retained them as denied.
- Replaced the plain-array Ketch update with `gtag("consent", "update", consentUpdate)`.
- The update explicitly carries `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`, then emits `atd_consent_update`.
- Added a regression test and a reusable GTM runtime-consent/network matrix runner.
- Corrected Vercel preview: `https://atd-website-test-o6l381b8e-alphatrackdigitals-projects.vercel.app`.
- GTM Version 9 remains unchanged and published. Production-ready commit is `9d5b8eaa175bf0a857a63bfb1bf117b1606b5e79`.
- Dev deployment uses Git pull from `main` and the existing Namecheap/cPanel workflow. `atd-production-dist-ad-consent-fix-9d5b8ea.zip` is fallback/reference only; `atd-production-dist-c0f6343.zip` is superseded.

Last updated: 2026-06-24.

## 2026-06-29 Ketch / GTM / Clarity Publish

- Added deterministic `atd_consent_update` emission to the Ketch bridge after Consent Mode updates.
- Microsoft Clarity project `xbn6g2k18j` remains GTM-only and requires `analytics_storage`.
- Published GTM workspace 9 as Version 9, `ATD Ketch Consent + Clarity Analytics Gating - 2026-06-29`.
- Fresh visit and Accept All passed on preview `https://atd-website-test-4g37aalfr-alphatrackdigitals-projects.vercel.app`; remaining production consent scenarios are pending owner verification.

## Repo State Reviewed

- Branch: `main`
- Tracking: `origin/main`
- Initial status before docs: clean, no modified files reported.
- Current HEAD: `a9cfce7 feat: preserve Brevo lead source lifecycle`
- Git warning observed: unable to access `C:\Users\Kenny Dabiri/.config/git/ignore`; did not block status/log inspection.

## Branches Reviewed

| Branch | Notes |
| --- | --- |
| `main` | Current branch, matches `origin/main` at `a9cfce7` |
| `backend` | Local worktree path shown; tracks `origin/backend`; separate backend branch history exists |
| `backend-sync-tracking` | Behind `origin/backend` by 18 at inspection |
| `codex/complete-tracking-setup` | Remote/local branch present |
| `martech/brevo-campaign-attributes` | PR #24 branch, merged into main |
| `origin/vercel-backend` | Vercel backend port branch present |

## Recent Commit Highlights

| Commit | Summary | Files / areas |
| --- | --- | --- |
| `a9cfce7` | Preserve Brevo lead source lifecycle | API and Netlify handlers, contact form, tests, docs |
| `d3d2f51` | Add Meta event IDs to exit popup leads | exit popup, subscribe handlers, tests |
| `3a7c20f` | Add AI agent rules and refine contact form | `AGENTS.md`, `CLAUDE.md`, contact form |
| `5299bcc` | Enhance Brevo integration with service interest and budget normalization | lead handlers, docs, tests |
| `b233323` | Inject Meta event ID into Pixel calls | `src/lib/tracking.ts`, tests |
| `de4ee2e` | Expose Meta event ID to browser tags | newsletter/audit/tracking events |
| `c64e894` | Add Meta Conversions API tracking | API handlers, attribution, tests |
| `53e4490` | Finalize Brevo campaign readiness plumbing | attribution, transactional webhook, docs, tests |
| `450e9b9` | Align Vercel Brevo CRM handlers | Vercel-style `api/` handlers |
| `03470e5` | Add Brevo CRM API handoff fallback | Netlify functions and tests |

## Repo Files / Areas Changed Historically

Key files touched by recent martech work:

- `api/leads.ts`
- `api/brevo-subscribe.ts`
- `api/brevo-meeting-webhook.ts`
- `api/idempotency.ts`
- `netlify/functions/leads.mjs`
- `netlify/functions/brevo-subscribe.mjs`
- `netlify/functions/brevo-meeting-webhook.mjs`
- `netlify/functions/brevo-transactional-webhook.mjs`
- `netlify/functions/lib/idempotency.mjs`
- `src/lib/attribution.ts`
- `src/lib/leads.ts`
- `src/lib/tracking.ts`
- `src/lib/conversionSession.ts`
- `src/lib/apiEndpoints.ts`
- `src/pages/ContactUs.tsx`
- `src/pages/TrackingLandingPage.tsx`
- `src/components/shared/ExitIntentPopup.tsx`
- `src/components/shared/NewsletterSection.tsx`
- `src/components/shared/TrackingEvents.tsx`
- tests under `src/test/*`
- docs under `docs/*.md`

## Tracking / Analytics Changes

- 2026-06-24 Ketch CMP migration prep: `index.html` now sets Google Consent Mode v2 denied defaults before GTM, loads the Ketch Smart Tag before GTM, preserves container `GTM-MVXWCTZ8`, and removes the expired Consently injector.
- 2026-06-24 Ketch preview QA: Vercel preview deployment succeeded, but production readiness is blocked by Ketch purpose misconfiguration and pre-consent GA4/Brevo/Meta/Google Ads activity. No production deploy, GTM publish, or Clarity install was performed.
- 2026-06-24 Ketch remediation: `src/components/shared/WhatsAppWidget.tsx` now gates Brevo Conversations behind analytics/measurement consent and `src/test/whatsapp-widget.consent.test.tsx` verifies no pre-consent chat script injection. Repeat Vercel preview deployment `dpl_5QuDEghwXXvgQmB1Qznj6GyuDwRs` still failed production readiness because public Ketch config exposes only `targeted_advertising`, leaves Cookie Policy blank, maps `analytics_storage` to missing `analytics___measurement`, and GA4/Meta/Google Ads still fire before consent.
- 2026-06-24 strict GTM gate: `index.html` now observes `dataLayer` and only inserts GTM after an explicit optional Consent Mode grant. The GTM noscript iframe was removed because it could load GTM before Ketch consent. Vercel preview deployment `dpl_EG6Gcc6D3z5syrVeGoi48piH4o3T` verified no GTM/GA4/Meta/Google Ads/LinkedIn/Brevo Conversations/Clarity pre-consent requests in checked flows; Ketch dashboard purpose/mapping issues remain.
- 2026-06-24 GTM consent follow-up: Codex Chrome extension access was restored and signed-in Chrome opened GTM container `GTM-MVXWCTZ8` in workspace mode. Consent Overview was used to configure draft-only additional consent checks. GA4 config/event tags: 14 tags require `analytics_storage`. Meta Custom HTML tags: 7 tags require `ad_storage`, `ad_personalization`, and `ad_user_data`. Google Ads Conversion Linker: 1 tag requires `ad_storage`, `ad_personalization`, and `ad_user_data`. Workspace Changes showed `22`; no GTM publish occurred. GTM Templates showed no tag or variable templates, so no Ketch GTM template is installed. GTM Preview connected to the Vercel preview URL, but Tag Assistant timeline inspection was blocked by Chrome's extension UI automation guard. LinkedIn was not visible; Clarity was not installed.
- 2026-06-25 GTM-consent preview follow-up: `index.html` now releases GTM after either analytics consent or targeted-advertising consent and adds a narrow GA transport guard that blocks `google-analytics.com/collect` and `google-analytics.com/g/collect` while `analytics_storage` is not granted. Vercel preview deployment `dpl_Fj3xYipZUf7hdqsw52xGrNeYm2vL` at `https://atd-website-test-bizccowc5-alphatrackdigitals-projects.vercel.app` passed the automated consent matrix. No production deploy, GTM publish, or Clarity install occurred.
- 2026-06-25 final pre-production Ketch rerun: fresh automated page/network QA passed on `https://atd-website-test-bizccowc5-alphatrackdigitals-projects.vercel.app`; evidence saved to `docs/codex-handoffs/evidence/ketch-final-gtm-consent-2026-06-25/browser-consent-matrix-rerun-2026-06-25.json` with runner `run-preview-consent-matrix-2026-06-25.mjs`. Confirmed denied defaults, no optional requests before consent, Reject All denied analytics/ad consent, Accept All granted analytics/ad consent, Analytics-only allowed GA4/Brevo Conversations while ads stayed blocked, Targeted Advertising-only kept GA collect blocked, saved choices persisted, and `Show Preferences` reopened preferences. Tag Assistant timeline capture remains outstanding because non-interrupting Chrome extension control failed before attach and the active Chrome instance had no remote-debugging port. No production deploy, GTM publish, or Clarity install occurred.
- 2026-06-25 Ketch production approval pack: `KETCH_FINAL_PREVIEW_QA_2026-06-24.md` now includes the final `NO-GO / BLOCKED` production go/no-go table and launch checklist. Production remains blocked until GTM Preview / Tag Assistant timeline proof, Google Ads/Meta/LinkedIn delivery confirmation after consent only, Ketch Cookie Policy resolution or approved workaround, explicit GTM publish approval, and explicit production deploy approval are complete. No production deploy, GTM publish, or Clarity install occurred.
- 2026-06-25 Ketch final verification continuation: automated page/network QA was rerun and passed again on the approved preview, updating `browser-consent-matrix-rerun-2026-06-25.json` with latest timestamp `2026-06-25T21:38:51.615Z`. Added sanitized blocker record `final-verification-blockers-2026-06-25.json`. Public Ketch config still lacks a Cookie Policy URL while Privacy Policy and Terms URLs are present; website legal pages return `200`. Local Chrome checks showed Chrome running and the Codex Chrome Extension/native host installed/enabled, but non-interrupting Chrome control still failed before attach and no remote-debugging port was available, so GTM Tag Assistant timeline proof and private Ketch dashboard remediation remain blocked without explicit foreground-browser authorization. No production deploy, GTM publish, or Clarity install occurred.
- 2026-06-25 Chrome retry for Ketch/GTM: after Codex restart, Chrome browser control attached successfully. GTM container `GTM-MVXWCTZ8` opened in workspace `9` with `Workspace Changes: 22`; Tag Assistant connected to the approved preview URL and opened a `gtm_debug` site tab, but connected timeline automation was blocked by a Chrome extension UI overlay on the Tag Assistant page. Ketch dashboard access worked; Cookie Policy document remains `Undeployed`, URL `https://www.alphatrack.digital/cookie-policy`, current type `Privacy Policy`, and available types are `Privacy Policy`, `Terms of Service`, `DPIA`, `DPA`, `MSA`, and `Other` only. Evidence saved to `chrome-retry-ketch-cookie-policy-2026-06-25.json`. No production deploy, GTM publish, or Clarity install occurred.
- SPA route events push `atd_route_view`.
- Conversion route events include `generate_lead`, `meeting_booking_redirect`, and `contact_form_submit`.
- Direct lead submissions push `tracking_audit_submit`, `newsletter_subscribe`, and `exit_popup_success`.
- Meta standard events map to `Lead` for contact, audit, booking, and exit popup; `Subscribe` for newsletter.
- Browser payloads include `event_id` and `eventID`; Meta Pixel wrapper injects matching `eventID`.
- Server-side Meta CAPI sends `Lead` or `Subscribe` using matching event IDs where configured.
- Brevo Meetings webhook sends GA4 Measurement Protocol booking events when GA4 env vars are configured.

## Brevo / CRM / Vercel / Netlify Changes

- Contact/audit/newsletter handlers write Brevo contacts, list membership, source lifecycle, attribution, consent, and campaign metadata.
- Exit popup handler writes separate Brevo contact/list fields and Meta CAPI event.
- CRM fallback creates deals/tasks for contact form, tracking audit, and meeting bookings where configured.
- Transactional webhook receiver exists in repo but must not be registered until deployed.
- `src/lib/apiEndpoints.ts` routes static/nonlocal hosts to `https://alphatra-serv.netlify.app` by default; local/Vercel-like hosts use same-origin API paths.
- Netlify redirects `/api/*` to Netlify functions.
- Vercel SPA rewrite sends non-API routes to `/index.html`.

## Environment Variable Names

Values are redacted. Variable names observed in `.env.example`, `.env.local` names, and code:

| Variable | Purpose |
| --- | --- |
| `BREVO_API_KEY` | Brevo API access for contact/email/CRM calls |
| `BREVO_LIST_ID` | Exit popup/default list ID |
| `BREVO_CONTACT_LIST_ID` | Contact Us list ID |
| `BREVO_AUDIT_LIST_ID` | Tracking Audit list ID |
| `BREVO_NEWSLETTER_LIST_ID` | Newsletter list ID |
| `BREVO_STRATEGY_CALL_LIST_ID` | Strategy Call list ID |
| `BREVO_DOI_TEMPLATE_ID` | Newsletter DOI template |
| `BREVO_DOI_REDIRECT_URL` | Newsletter DOI confirmation redirect |
| `BREVO_CONSENT_ATTRIBUTE` | Optional custom consent attribute |
| `BREVO_CONSENT_TIMESTAMP_ATTRIBUTE` | Optional custom consent timestamp attribute |
| `BREVO_MEETING_WEBHOOK_SECRET` | Brevo Meetings webhook auth secret |
| `BREVO_MEETING_WEBHOOK_URL` | Local env name observed; purpose likely webhook endpoint reference |
| `BREVO_TRANSACTIONAL_WEBHOOK_SECRET` | Transactional webhook auth secret |
| `GA4_MEASUREMENT_ID` | GA4 Measurement ID |
| `GA4_MEASUREMENT_PROTOCOL_API_SECRET` | GA4 MP API secret |
| `GA4_MEASUREMENT_PROTOCOL_DEBUG_MODE` | Temporary DebugView mode; should be false outside debug |
| `GA4_MEETING_BOOKED_EVENT_NAME` | Optional booking event override |
| `GA4_BOOKING_PAGE_LOCATION` | Optional booking page URL override |
| `GA4_PROPERTY_ID` | GA4 Admin/Data property ID |
| `GA4_ADMIN_CREDENTIALS` | Local GA4 admin credential path |
| `GOOGLE_APPLICATION_CREDENTIALS` | Local Google credential path |
| `GTM_CONTAINER_ID` | GTM container ID |
| `META_PIXEL_ID` | Meta pixel ID for CAPI |
| `META_CAPI_ACCESS_TOKEN` | Meta CAPI token |
| `META_GRAPH_API_VERSION` | Meta Graph API version |
| `META_CAPI_TEST_EVENT_CODE` | Meta test events code; remove/disable for production |
| `VITE_LEADS_ENDPOINT` | Frontend lead endpoint override |
| `VITE_BREVO_SUBSCRIBE_ENDPOINT` | Frontend exit-popup endpoint override |
| `VITE_SITE_URL` | Canonical site URL |
| `VITE_SUPABASE_URL` | Supabase project URL if enabled |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |

## Deployment Status

- Production frontend decision in docs: Namecheap/cPanel static host.
- Backend API service: `https://alphatra-serv.netlify.app`.
- Netlify deploy to `alphatra-serv` was documented as blocked by account credit usage exceeded.
- Current production transactional webhook was documented as `404`; do not register in Brevo yet.
- Current production meeting webhook was documented as `405` on GET, meaning a receiver path exists but latest upgrade still needs deployment validation.
- This pass did not deploy or check live endpoints.

## Testing Performed

No tests were run during this documentation-only pass.

Previously documented validation includes focused tests, full test suite, lint, and production build passing during 2026-06-15/2026-06-16 readiness work. Treat those as historical until rerun after the next code or deploy change.

2026-06-24 Ketch remediation validation:

- `npx vitest run src/test/whatsapp-widget.consent.test.tsx`
- `npm run build:client`

## Debug / Cleanup Risks

- Confirm `GA4_MEASUREMENT_PROTOCOL_DEBUG_MODE=false` in production.
- Remove/disable `META_CAPI_TEST_EVENT_CODE` outside Meta Events Manager test sessions.
- Confirm latest contact schema fixes are deployed before live QA.
- Confirm newsletter alert routing matches approved `marketing@` map.
- Confirm no secret values are committed or copied to Notion.

## 2026-06-29 Ketch/GTM Production Readiness

- Added `docs/codex-handoffs/evidence/ketch-final-production-readiness-2026-06-29/`.
- Re-ran the full eight-route consent matrix; all existing matrix checks passed.
- Added focused `/book-a-call/thank-you` delivery QA. Meta Pixel resources loaded under Analytics-only consent while all advertising consent fields were denied.
- Corrected the Meta status audit: all seven tags have the required three ad consent checks, but no visible pause or malware warning exists. Hidden repeated GTM accessibility text caused the earlier false classification.
- Identified `Meta | CONV | Lead | booking_confirmation | web` as the Analytics-only leak path through `generate_lead` and the sequenced Meta base tag.
- Added a fail-closed Meta transport guard to `index.html`.
- Deployed preview `dpl_CPkCiBDpW2oEqgzu56ykqVGDyeZx` and reran the matrices. Analytics-only now produces zero Meta requests on `/book-a-call/thank-you`; advertising-only and Accept All allow Meta after all ad fields grant.
- Confirmed no LinkedIn tag, Google Ads conversion/remarketing tag, or Clarity tag exists. Google Ads has only a Conversion Linker.
- Rechecked deployed Ketch public config: Analytics and Targeted Advertising remain opt-in; Privacy Policy and Terms links exist; Cookie Policy link remains absent.
- No GTM publish, production deploy, Ketch document mutation, or Clarity installation occurred.
- 2026-06-29: Verified Microsoft Clarity project `xbn6g2k18j` and observed Balanced masking, cookies on, bot detection on, one AlphaTrack admin, and incomplete installation. Saved GTM tag `Clarity | BASE | analytics_measurement | all_pages | web` with the standard loader, All Pages trigger, and additional consent `analytics_storage`. Pre-publish QA stopped because Chrome blocked the connected Tag Assistant timeline while another extension UI was open. No GTM publish or production deploy occurred.
