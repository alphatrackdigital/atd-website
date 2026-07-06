# Open Items For Next Agent

## 2026-07-06 Tracking Audit Lander And Meta Pilot

- Redesigned `/offer/tracking-audit` without changing the form, lead payload, anti-abuse, consent, Meta event ID, or duplicate-suppression contracts.
- Added responsive campaign reassurance and methodology content; mobile uses the established 24px ATD gutter and simplified content treatments.
- Full release gate passed: ESLint with seven existing warnings, 74/74 tests, and production client/SSR/prerender build.
- Owner explicitly approved deployment and implementation of the previously discussed campaign improvements.
- Campaign experiment specification: `docs/codex-handoffs/META_ADS_TRACKING_AUDIT_PILOT_2026-07-06.md`.
- Release evidence: `docs/codex-handoffs/evidence/tracking-audit-lander-release-2026-07-06/summary.md`.
- Paid ads must remain disabled until the production smoke, consent, form-routing, and Meta Browser/Server deduplication gates pass.

## 2026-07-01 Brevo List Organization

- Created `ATD - Website Lead Capture` and moved existing lists `#7`-`#11` into it.
- Created `ATD - Lifecycle & QA` and moved existing lists `#12`-`#14` into it.
- List names and IDs were preserved. Lists `#5 identified_contacts` and `#4 Contacts involved in conversations` remained untouched in their original folders.
- No contacts, automations/workflows, forms, API/env configuration, attributes, segments, CRM pipelines, or deployment settings were changed.
- This is operational cleanup, not a launch blocker.
- Evidence: `docs/codex-handoffs/evidence/brevo-list-organization-2026-07-01/summary.md`.

## Current Pre-Production Decisions

Cookie Policy is cleared in commit `5e11ddc` and confirmed deployed on the canonical Vercel test ground. Form submission, Brevo widget, and exit-popup/Ketch-modal blockers are cleared in commits `0db41a4` and `9ac9d60`.

1. Decide whether optional Book-a-call CRM deal/task and custom webhook proof is required before production.
2. Obtain explicit Namecheap/cPanel deployment approval.
3. Complete production six-scenario consent QA after deployment.

## 2026-07-01 Form/Widget/Popup Fix

- Root cause of "all forms failing" on the canonical Vercel test alias: `BREVO_API_KEY` and related Brevo list-ID env vars were scoped only to Production in Vercel project settings, not Preview. Extended to Production+Preview via the Vercel dashboard (values never read/typed by the agent). Contact Us, Tracking Audit, Newsletter, and Exit Popup all verified working post-fix with dataLayer events firing correctly.
- Brevo Conversations chat widget (`src/components/shared/WhatsAppWidget.tsx`) no longer gated behind analytics consent; it now loads as functional/support communication regardless of consent state, confirmed to still load under Reject All while Clarity/Meta remain correctly consent-gated.
- Exit-intent popup (`src/components/shared/ExitIntentPopup.tsx`) now has a state-based guard against opening while the Ketch consent banner/preference center is visible, with a capped retry so it still opens normally once consent UI is dismissed. Verified via automated test that it correctly stays closed during the Ketch banner/Purposes/Confirm flow and opens right after.
- `npm run lint`, `npx vitest run` (65 tests), and `npm run build` all passed.
- New Vercel preview deployed and canonical test alias `https://website-internal-test.vercel.app/` reassigned to it. No Namecheap/cPanel deployment, no GTM publish, no Ketch/GA4/Meta/Google Ads/Clarity/Brevo/Netlify/Notion dashboard changes.
- Evidence: `docs/codex-handoffs/evidence/form-widget-popup-fix-2026-06-30/summary.md`.

## 2026-06-30 Cookie Policy Resolution

- Tightened the existing Cookie Policy content (`src/content/legal/cookie-policy.md`, route `src/pages/CookiePolicy.tsx`) per owner-supplied Section 4/5 text. Removed inactive provider mentions (LinkedIn Ads/Insight Tag), explicit tool naming (GTM, Google Ads as a named tool), and the "cookie scanner table" reference. "Last Updated" date moved to June 30, 2026.
- No GTM container/tag IDs, account IDs, audience sizes, internal QA history, or Cookiebot mentions exist in the public page. Cookie Policy <-> Privacy Policy cross-links and footer links were already correctly wired; no changes needed there.
- `npm run lint` and `npm run build` (client+server+prerender) both passed.
- No Ketch dashboard, GTM publish, or other live service settings were changed.
- Cookie Policy content blocker is now cleared. Namecheap/cPanel deployment remains conditional pending Book-a-call CRM/webhook decision, explicit deployment approval, and full production consent QA.
- Evidence: `docs/codex-handoffs/evidence/cookie-policy-resolution-2026-06-30/summary.md`.

## 2026-06-30 Google Ads Audience Source Check

- Google Ads website-visitor audience source already exists and is already populated via the linked GA4 property (not a separate Google Ads website tag). Segments observed: "All Users of AlphaTrack Digital" (48 members, below minimum size to serve ads), "Purchasers of AlphaTrack Digital" (0 members), and an auto-generated "AdWords optimized list".
- GTM `GTM-MVXWCTZ8` still has only the Conversion Linker for Google Ads; no separate Google Ads base/audience gtag exists or was added. Owner decided this is sufficient for future remarketing readiness; no GTM change was made.
- Google Ads campaigns, conversion actions, conversion tags, enhanced conversions, and billing remain untouched/deferred. Two pre-existing conversion actions were observed read-only only (status "No recent conversions").
- Evidence: `docs/codex-handoffs/evidence/google-ads-audience-source-setup-2026-06-30/summary.md`.

## 2026-06-30 Final Test-Ground QA

- Consent matrix passed on the canonical test deployment: Accept All, Reject All, Analytics-only, and Targeted Advertising-only.
- GA4 virtual route page views, Meta PageView, Clarity collection, and Conversion Linker behavior were observed in their allowed consent states.
- GTM Version 9 remains published; Default Workspace 10 is clean with `0` changes. No GTM fix or publish was needed.
- Google Ads conversion tracking is deferred until Google Ads launch. Conversion Linker remains configured and consent-gated; no delivery/conversion tags were created.
- No repeat forms, bookings, or webhooks were submitted because existing lead-flow evidence was sufficient.
- Remaining launch decisions: whether Book-a-call CRM deal/task and custom webhook proof are mandatory before production; explicit Namecheap/cPanel approval; production six-scenario consent QA after deployment.
- Namecheap/cPanel recommendation: **conditional**.
- Evidence: `docs/codex-handoffs/evidence/final-test-ground-qa-2026-06-30/summary.md`.

## 2026-06-30 Canonical Vercel Test Ground

- Canonical test URL: `https://website-internal-test.vercel.app/`.
- A clean Vercel preview was deployed from commit `470696ba949da22464b95f5fe76b4ea1ecac511e`, and the test-only canonical alias was reassigned to it.
- The alias previously served an older deployment tied to `c0f6343`; this explains the stale consent-bridge mismatch observed there.
- The new deployment contains the real `gtag("consent", "update", consentUpdate)` call and all four optional consent fields.
- Accept All loaded GTM and Clarity without console errors. GA4, Meta, and Ads/DoubleClick were not observed; manual Tag Assistant consent-registry proof remains open.
- Evidence: `docs/codex-handoffs/evidence/test-ground-deployment-consent-retest-2026-06-30/summary.md`.
- No Vercel production promotion, Namecheap/cPanel deployment, form submission, or webhook test occurred.

## 2026-06-30 GTM Analytics/Ads Diagnostic

- GTM and Clarity loaded after Accept All, so container release and analytics consent are working.
- Meta non-firing on the untouched homepage is most likely trigger-context related: the base tag uses an allowed-hostnames page-view trigger, while conversion tags require events that were not exercised.
- Google Ads/DoubleClick delivery is not configured beyond Conversion Linker; delivery requests are therefore not expected from the homepage check.
- GA4 remains unresolved. Tag Assistant listed the domain as active but its injected badge reported `Tag Assistant Not Connected`, blocking tag-level trigger and exception inspection.
- Evidence: `docs/codex-handoffs/evidence/gtm-ga4-meta-ads-diagnostic-2026-06-30/summary.md`.
- No fixes were applied, no live services changed, and no forms or webhooks were submitted.

## 2026-06-30 Clarity Test-Ground QA

- **Passed:** Ketch behavior, GTM Consent Mode updates, and Microsoft Clarity project `xbn6g2k18j` consent-gating on the non-production test ground. Clarity loaded only when `analytics_storage` was granted.
- **Still open:** GA4 network/event proof, Meta Pixel/event proof, and Google Ads/DoubleClick proof. None fired in any tested state, including Accept All.
- **Root cause:** Unknown / needs GTM Preview and tag-firing inspection. Do not change GTM while diagnosing.
- **Still pending/incomplete:** Book-a-call CRM deal/task and custom webhook proof decision; Namecheap/cPanel deployment approval and execution; production six-scenario consent QA after deployment. The Cookie Policy blocker was cleared on 2026-06-30.
- Evidence: `docs/codex-handoffs/evidence/clarity-test-ground-qa-2026-06-30/summary.md`.
- No live services were changed, no forms were submitted, and no webhook tests were run during this QA.

## 2026-06-29 Codex to Claude Code Continuity Handoff

- Codex hit its usage limit mid-task while updating documentation. Claude Code took over to inspect the working tree and finish the documentation-only task safely.
- See `docs/codex-handoffs/AI_AGENT_CONTINUITY_PROTOCOL.md` for the agent roles, mandatory startup/handoff routine, reusable continuation prompts, and safety boundaries that now govern Codex/Claude Code handoffs in this repo.
- No live tools were touched during this handoff. No source code was changed. Only documentation files were updated.

## 2026-06-29 Ad Consent Propagation Fix

- Owner Tag Assistant evidence found that the diagnostic event reported advertising consent granted while GTM's Consent tab retained denied ad fields.
- The repo bridge used a plain dataLayer array for the Ketch-derived consent update. It now calls the real `gtag("consent", "update", state)` API with all four optional fields before `atd_consent_update`.
- Corrected preview `https://atd-website-test-o6l381b8e-alphatrackdigitals-projects.vercel.app` passed GTM runtime-consent and network verification for fresh visit, Reject All, Accept All, Analytics-only, and Targeted Advertising-only.
- GTM Version 9 remains published; no GTM or Ketch setting changed.
- Dev deployment workflow: pull latest `main` and deploy commit `9d5b8eaa175bf0a857a63bfb1bf117b1606b5e79` through the existing Namecheap/cPanel process.
- `atd-production-dist-ad-consent-fix-9d5b8ea.zip` is fallback/reference only. `atd-production-dist-c0f6343.zip` is superseded and must not be used.
- Manual cPanel deployment approval/execution and owner production QA remain pending. Cookie Policy is cleared. Clarity funnels, smart events, first-recording masking review, and later AI Visibility evaluation are post-deployment follow-ups, not launch blockers.

Last updated: 2026-06-25.

## Current Deployment Context

- Vercel is the current development/testing environment for working site and server verification.
- Netlify is the future live deployment target after ATD purchases/subscribes to the paid Netlify plan.
- Working updates should later be mirrored to Netlify and deployed live only after the paid Netlify plan is ready and the user explicitly approves deployment.
- Do not treat Netlify paid deployment as the immediate blocker for current testing. The next safe technical step is Vercel development/server verification unless the user explicitly decides to handle Netlify subscription and deployment readiness first.
- Active Vercel testing URL: `https://website-internal-test.vercel.app`. Avoid stale URL `https://atd-website-test.vercel.app` unless separately fixed.

## Priority 1: Urgent Blockers

| Item | Next step | Verify before live changes |
| --- | --- | --- |
| Analytics delivery partially verified | GA4 Realtime showed recent `generate_lead`, `meeting_booked_confirmed`, and `meeting_booking_redirect` after the approved booking test; GTM container was visible; Meta event/deduplication proof remains missing | Do not change tags, triggers, pixels, datasets, conversions, or settings |
| Historical Ketch consent QA | The 2026-06-25 `NO-GO / BLOCKED` assessment was superseded by GTM Version 9 publish, final test-ground consent proof, and the Cookie Policy fix in `5e11ddc`. | Retain as historical evidence; current gates are the three items in `Current Pre-Production Decisions` above. |
| Tracking Audit Nurture paused; active contacts still visible | User approved pausing only Tracking Audit Nurture on 2026-06-24; Brevo status showed `Paused`, but active contacts still appeared in workflow steps after the pause; user declined removing/stopping those active contacts | Do not reactivate or edit without approval; review workflow internals before any future reactivation |
| Book-a-call CRM/webhook proof incomplete | One approved booking was completed and Brevo list #7 plus confirmation email delivery were verified; CRM deal/task and custom meeting webhook delivery were not verified | Do not book another meeting or POST to webhook without separate approval |
| Newsletter and Exit Popup frontend success text partial | Brevo downstream routing is verified, but saved DOM samples did not capture success text | Do not repeat submissions unless explicitly approved; consider non-submitting UI/screenshot review only |
| Brevo transactional webhook not live | Register only after the final live endpoint returns expected auth behavior | `BREVO_TRANSACTIONAL_WEBHOOK_SECRET` set by name only, endpoint not `404` |
| Brevo Meetings validation pending | Test controlled booking only after active test/live server target is confirmed and approved | Webhook secret and endpoint configured by name only |
| Suppression/blocklist uncertainty | Run controlled QA before live campaign traffic | Lists #13/#14 and workflow exclusions |
| Netlify future deployment readiness | Keep as future live-deployment item until paid plan purchase | Paid Netlify plan, mirrored updates, approved deploy path |

## Priority 2: Important Cleanup

- Verify Brevo source lifecycle custom attributes exist and have correct types.
- Verify contact attribute grouping in Brevo UI without deleting or renaming attributes.
- Newsletter internal notification delivery has Brevo SMTP log evidence; human inbox review remains out of scope.
- Confirm profile update and unsubscribe pages are acceptable for launch.
- Confirm `GA4_MEASUREMENT_PROTOCOL_DEBUG_MODE=false` and Meta test-event code disabled outside tests.
- Confirm `SERVICE_INTEREST` and `MONTHLY_BUDGET` schema fixes remain deployed after future code changes.
- Review `EVIDENCE_ARCHIVE_INVENTORY.md` and `EVIDENCE_REVIEW_QUEUE.md` before adding new proof records.
- Add or review evidence records for the 2026-06-23 remaining lead-flow QA folders; keep QA identity details redacted.
- Decide whether Contact Us CRM notes are required; none were found during read-only Brevo verification.
- Update Notion only after reviewing `NOTION_SYNC_SUMMARY.md`.
- Use `KETCH_CONSENT_READINESS_2026-06-24.md` as the current CMP migration handoff before any Ketch/GTM/Clarity work.
- Use `KETCH_PREVIEW_QA_2026-06-24.md` for the current failed/blocked preview QA findings.
- Use `KETCH_REMEDIATION_PREVIEW_QA_2026-06-24.md` for the current remediation preview findings and the required Ketch/GTM dashboard changes.
- Use `KETCH_GTM_STRICT_PREVIEW_QA_2026-06-24.md` for the strict GTM-gated preview result.
- Use `KETCH_FINAL_PREVIEW_QA_2026-06-24.md` for the current final preview result and GTM browser-control blocker.

## Priority 3: Nice-To-Have Improvements

- Add a small launch monitoring dashboard or daily report template.
- Add a nonsecret environment variable inventory page to repo docs.
- Add a clear "production deployment status" section to `README.md`.
- Consider consolidating older Brevo docs once this handoff pack is accepted.
- Add a scripted safe health check for deployed API paths without sending leads.
- Add an `Evidence Update Log` entry when new evidence is created or verified.

## Exact Next Steps

1. Read `ATD_MASTER_CODEX_WORKLOG.md`, `BREVO_CURRENT_STATE.md`, and `TECHNICAL_CHANGELOG.md`.
2. Read `EVIDENCE_ARCHIVE_INVENTORY.md` and `EVIDENCE_REVIEW_QUEUE.md`.
3. Run `git status`.
4. Confirm whether the user wants Vercel development/server checks, evidence review, live connector/UI checks, or repo-only work.
5. If live checks are approved, inspect Vercel/Brevo/Netlify read-only first and avoid mutations.
6. Do not activate, send, deploy, commit, push, or update Notion without explicit approval.
7. If Vercel testing is approved, verify env variable names only; never print values.
8. Do not repeat Contact Us, Tracking Audit, Newsletter, or Exit Popup submissions unless the user explicitly approves another controlled test.
9. After any approved deploy in the future, run controlled endpoint checks before test submissions.
10. After test submissions, record evidence in repo docs first.
11. Prepare a Notion sync proposal; wait for approval before updating Notion.
12. Treat the 2026-06-25 Ketch `NO-GO / BLOCKED` checklist as superseded historical context. GTM Version 9 and final test-ground consent proof are complete, and Cookie Policy is cleared. Do not change Ketch or publish GTM without new owner approval.

## What To Verify Before Any Live Change

- The exact target account/workspace/site.
- The exact workflow/template/list/contact/attribute ID.
- The current active/inactive state.
- The rollback or stop condition.
- Whether the action can send email or mutate contacts.
- Whether any secret value would be exposed in logs or docs.

## Warnings

- Do not use the available Brevo DOI contact-creation tool for inspection; it can send a confirmation email.
- Do not treat Codex transcripts as documentation source text; summarize only safe metadata and verified outcomes.
- Do not rely on repo implementation as production behavior until deployed commit is verified.
- Do not assume the prompt's Next.js note is correct; repo evidence shows Vite React.
- Do not rebuild the evidence archive from scratch unless the user explicitly asks; update only relevant records.
- Do not install Microsoft Clarity project `xbn6g2k18j` until Ketch consent behavior and GTM consent updates are verified.

## Immediate Ketch/GTM Blockers - 2026-06-29

1. Previous malware/paused classification was false; visible GTM evidence shows normal Meta Custom HTML tag status.
2. Keep the existing PageView/Lead event intent and triggers.
3. Keep advanced matching and PII inputs disabled.
4. Preserve `ad_storage`, `ad_user_data`, and `ad_personalization` requirements on all seven Meta tags.
5. Corrected preview QA passes: Analytics-only produces zero Meta requests; Targeted Advertising-only and Accept All allow Meta after ad consent.
6. GTM workspace `9` is ready for explicit publish approval, but remains unpublished.
7. After any approved publish, rerun the full matrix before production.
8. Obtain explicit approval for the website Cookie Policy workaround, or resolve the missing Ketch Cookie Policy attachment through Ketch support.

Evidence: `docs/codex-handoffs/evidence/ketch-final-production-readiness-2026-06-29/`.

## Evidence Archive Status

- Initial evidence archive inventory completed on 2026-06-18.
- Initial evidence review queue completed on 2026-06-18.
- Vercel visual screenshot evidence was added on 2026-06-19.
- Controlled Contact Us redacted form-test evidence was added on 2026-06-22.
- Redacted read-only Brevo verification for the Contact Us QA submission was added on 2026-06-23.
- Vercel hydration fix console verification was added on 2026-06-23. Deployed commit `6a623a1977d8cb34d891f7c073ac6871c5b03e07` was verified on `https://website-internal-test.vercel.app`; React `#418`/`#423`, hydration errors, and new app runtime errors were absent on checked routes.
- Vercel GET-only final sanity evidence was added on 2026-06-23 for 11 key routes on `https://website-internal-test.vercel.app`; all returned `200`, rendered visible content, attempted no non-GET/HEAD requests, and showed no hydration-related errors.
- Contact Us evidence verifies frontend submission, redirect, visible success state, Brevo contact/list #8/source attributes, CRM deal/task, and internal notification log. GA4/GTM/Meta, automation/workflow behavior, and human inbox review remain unverified.
- Remaining lead-flow QA evidence was added on 2026-06-23. Tracking Audit, Newsletter, and Exit Popup were submitted once; Book-a-call UI/iframe was inspected without booking; Brevo read-only verification confirmed list/source-history routing, Tracking Audit CRM deal/task, Tracking Audit and Newsletter notification delivery evidence, and templates `19`-`30`.
- Brevo workflow UI state was verified read-only on 2026-06-23: five visible lead-flow workflows were active, including Tracking Audit Nurture. Workflow triggers/steps/suppression internals were not opened. GA4/GTM/Meta delivery, human inbox review, and real booking behavior remain unverified.
- Brevo workflow detail review was added on 2026-06-24. Tracking Audit Nurture is the highest-risk item: it is active, starts from list `#11`, sends five visible emails with waits, no configured exit/suppression condition was visible, and recent logs showed first nurture email delivery plus wait-state entry for a redacted contact.
- User approved pausing only Tracking Audit Nurture on 2026-06-24. It was paused successfully; Exit Popup Workflow, Newsletter Workflow, General Enquiry Workflow, and Strategy Call Workflow remained active. Active contacts still appeared in Tracking Audit Nurture after pause, consistent with Brevo's pause behavior, and the user declined removing/stopping those contacts.
- Ketch repo-side implementation was added on 2026-06-24: Consently removed, Ketch Smart Tag added, Consent Mode v2 defaults added before GTM, GTM preserved, Clarity not activated. Preview QA was completed against Vercel deployment `dpl_EJzFbvDGGMPzB3tBnMNfZqVMaYEK` and production is blocked until Ketch purposes and GTM consent/tag gating are corrected and retested.
- Ketch strict preview was added on 2026-06-24: GTM now waits for explicit optional Consent Mode grants, so pre-consent QA observed no GTM, GA4, Meta, Google Ads, LinkedIn, Brevo Conversations, Consently, Cookiebot, or Clarity requests in the checked flows. Production remains blocked because Ketch dashboard purposes and Consent Mode mappings are still wrong.
- Final launch-readiness QA evidence was added on 2026-06-24. One approved Book-a-call booking was completed; Brevo list `Website - Strategy Call Bookings #7` and Strategy Call confirmation email sent/delivered were verified. Booking CRM deal/task and custom meeting webhook delivery remain unverified.
- GA4 Realtime showed recent `generate_lead`, `meeting_booked_confirmed`, and `meeting_booking_redirect` events after the approved booking test. GTM container `GTM-MVXWCTZ8` was visible. Meta dataset was accessible, but recent event rows and browser/server deduplication proof were not verified.
- Book-a-call attribution follow-up: visible Brevo contact fields showed `SOURCE` as `Strategy Call Booking`, but `LEAD_SOURCE` and first/latest lifecycle fields still showed the earlier Exit Popup state for the reused QA contact.
- Ketch final GTM draft follow-up was added on 2026-06-24. Repo-side Ketch QA passed on `https://atd-website-test-n96vt528s-alphatrackdigitals-projects.vercel.app`. GTM container `GTM-MVXWCTZ8` was updated in workspace only with consent checks for GA4, Meta, and Google Ads Conversion Linker. GTM Templates showed no Ketch template installed. GTM Preview connected, but Tag Assistant timeline inspection was blocked by Chrome extension UI automation guard. No GTM publish, production deploy, or Clarity install occurred.
- Ketch GTM-consent preview follow-up was added on 2026-06-25. Preview `https://atd-website-test-bizccowc5-alphatrackdigitals-projects.vercel.app` passed the automated consent matrix after the repo-side GTM release update and GA transport guard. Evidence is in `docs/codex-handoffs/evidence/ketch-final-gtm-consent-2026-06-25/`. No production deploy, GTM publish, or Clarity install occurred.
- Ketch final pre-production rerun was added on 2026-06-25. Fresh automated page/network QA passed on the same preview URL and saved `docs/codex-handoffs/evidence/ketch-final-gtm-consent-2026-06-25/browser-consent-matrix-rerun-2026-06-25.json`. Tag Assistant timeline capture remains outstanding because non-interrupting Chrome extension control failed and the active Chrome instance had no remote-debugging port.
- Ketch production approval pack was added on 2026-06-25 in `KETCH_FINAL_PREVIEW_QA_2026-06-24.md`. It marks production `NO-GO / BLOCKED`, adds the final go/no-go table, and lists the launch checklist. No GTM publish, production deploy, or Clarity install occurred.
- Ketch final verification blocker evidence was added on 2026-06-25 at `docs/codex-handoffs/evidence/ketch-final-gtm-consent-2026-06-25/final-verification-blockers-2026-06-25.json`. This is historical evidence superseded by the later GTM publish, final test-ground proof, and Cookie Policy clearance.
- Ketch Chrome retry evidence was added on 2026-06-25 at `docs/codex-handoffs/evidence/ketch-final-gtm-consent-2026-06-25/chrome-retry-ketch-cookie-policy-2026-06-25.json`. It records that Chrome control attached, GTM and Ketch dashboards were accessible, Tag Assistant connected but timeline automation was blocked by a Chrome extension UI overlay, and Ketch has no dedicated Cookie Policy document type.
- Ketch Cookie Policy public-config check was added on 2026-06-25. Ketch public config includes Privacy Policy and Terms of Service URLs but no Cookie Policy URL; website legal pages all return `200`. Treat dedicated Cookie Policy attachment as a Ketch dashboard/vendor support item unless the user explicitly approves the live website Cookie Policy link as the production workaround.
- Future evidence updates should be incremental and should add an `Evidence Update Log` entry.

## Suggested Prompt For Next Session

```text
Continue the AlphaTrack Digital / ATD MarTech handoff from repo docs under docs/codex-handoffs/. Start by reading ATD_MASTER_CODEX_WORKLOG.md, BREVO_CURRENT_STATE.md, TECHNICAL_CHANGELOG.md, WEBSITE_AND_TRACKING_STATE.md, EVIDENCE_ARCHIVE_INVENTORY.md, EVIDENCE_REVIEW_QUEUE.md, and OPEN_ITEMS_FOR_NEXT_AGENT.md. Do not make live changes unless I explicitly approve. Verify current git status, then help me decide the next safe step for Vercel development/server verification, evidence review, Brevo QA, Meta/GA4 verification, future Netlify readiness, or Notion sync. Never expose secrets or copy raw transcripts.
```
- 2026-06-29 Clarity continuation: project `xbn6g2k18j` was verified and the GTM Clarity tag was saved with All Pages plus additional consent `analytics_storage`. Tag Assistant opened the approved preview, but Chrome blocked automation of the connected timeline while another extension UI was open. Dismiss that UI, rerun the full matrix, and publish only if every scenario passes.
- Repository cleanup remains incomplete. Historical screenshots and intermediate evidence must be curated before any commit; do not stage the entire handoff/evidence tree.
- Clarity QA failure: GTM debug fallback showed no Clarity loader after Accept All plus Confirm, although GTM and Brevo Conversations loaded. Inspect the saved Clarity Custom HTML tag's firing status/configuration in GTM before rerunning the matrix. Do not publish the current workspace.
- Follow-up fix applied: Clarity now also uses custom event trigger `gtm.consentUpdate` (`TR | CONSENT | analytics_granted | gtm.consentUpdate | global`) and still requires `analytics_storage`. Start a fresh Preview session and rerun all six scenarios before publishing.

## 2026-06-29 Owner-Approved Publish

- GTM workspace 9 was published as Version 9: `ATD Ketch Consent + Clarity Analytics Gating - 2026-06-29`.
- Clarity project `xbn6g2k18j` requires `analytics_storage` and uses the deterministic repo-side `atd_consent_update` post-consent event.
- Fresh visit and Accept All passed on the non-production preview before publish.
- The owner approved publish and production deployment with the remaining six-scenario production matrix to be completed manually afterward.
- Cookie Policy blocker was cleared in commit `5e11ddc`; the live website policy is the approved launch treatment.
