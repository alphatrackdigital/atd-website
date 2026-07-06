# Tracking Audit Lander Release

Date: 2026-07-06

## Scope

- Redesigned `/offer/tracking-audit` as a focused campaign landing page.
- Preserved the existing form schema, validation, anti-abuse controls, submission payload, Meta event ID contract, duplicate suppression, consent field, canonical URL, and SEO metadata.
- Added audit coverage, deliverables, process, qualification, methodology, FAQ, and closing CTA sections.
- Added a desktop continuation cue and a simplified mobile-specific presentation.
- Standardized the mobile content gutter to the 24px pattern used by ATD service pages.
- Kept the measurement-service link on desktop and removed it from mobile to reduce competing actions.

## Campaign Implementation

The experiment structure, qualification standard, measurement contract, decision rules, and launch gates are recorded in:

`docs/codex-handoffs/META_ADS_TRACKING_AUDIT_PILOT_2026-07-06.md`

## Validation

The pre-deployment gate passed:

- ESLint: passed with seven pre-existing Fast Refresh warnings and no errors.
- Vitest: 20 files, 74 tests passed.
- Production build: client, SSR bundle, and homepage prerender passed.
- Existing bundle-size advisory remains non-blocking.

## Repository And Test Deployment

- Pull request: `#36`
- Merged `main` commit: `1c96427`
- Vercel deployment: `dpl_F4jm6kbXyFiA9CQPwpK4ozDihJdR`
- Vercel state: `READY`
- Canonical test alias: `https://website-internal-test.vercel.app`

Deployed verification:

- `/offer/tracking-audit`, the homepage, Conversion Tracking service, Privacy Policy, Cookie Policy, and Terms routes returned `200`.
- `/api/leads` returned `204` to the preflight request.
- Mobile and desktop checks found no horizontal overflow.
- Mobile hid the secondary measurement link; desktop retained it and the continuation cue.
- The offer route exposed the expected canonical URL, form ID, headings, and campaign sections.
- Vercel error-log query returned no errors.

## Consent And Lead Smoke

The deployed offer route passed the four-scenario consent runner:

- fresh visit and Reject All: no GTM, GA, Ads, Meta, or Clarity requests before optional consent;
- Accept All: GTM, advertising/Meta, and Clarity requests allowed;
- Analytics-only: advertising and Meta remained blocked while Clarity was allowed;
- Targeted Advertising-only: Meta/Ads were allowed while Clarity remained blocked.

The runner did not observe a GA collection request in this pass. This is not a
lander-code regression, but GA route-event delivery should remain part of final
production observability.

One controlled Tracking Audit request was submitted on the canonical Vercel
test alias. Verification confirmed:

- visible `Request received` success state;
- contact created in Brevo list 11;
- source `tracking_audit_offer`;
- all five campaign UTMs persisted;
- website route and landing page persisted;
- one linked CRM follow-up task and deal created.

No duplicate submission was made.

## Production Deployment Status

The public cPanel site still serves the older Tracking Audit JavaScript chunk.
The merged GitHub change did not auto-deploy.

The approved manual deployment was attempted, but the available Chrome session
reached the Namecheap login screen and had no authenticated cPanel session.
No credentials were requested, entered, or exposed. Production upload/pull and
the post-cPanel smoke remain pending authenticated hosting access.

The existing Miro campaign board was also identified, but the Miro MCP
connection required renewed OAuth authorization. No duplicate board was created
and no Miro content was changed.

## Safety

- No secrets or environment values were added to source control.
- No GTM, Ketch, Brevo, Meta, GA4, Clarity, Netlify, or cPanel configuration was changed while implementing the page.
- Paid campaigns were not enabled.
- Production form submissions and Meta Test Events remain post-deployment controlled checks.

