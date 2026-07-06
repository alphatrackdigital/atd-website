# Meta Ads Tracking Audit Pilot

Date: 2026-07-06

## Commercial Experiment

The pilot is a focused demand-validation experiment, not a broad awareness campaign.

- Offer: Free Conversion Tracking Audit
- Destination: `/offer/tracking-audit`
- Objective: Website Leads
- Primary event: `Lead`
- Budget: $15-$20 per day
- Duration: 10-14 days
- Primary KPI: qualified Tracking Audit requests
- Secondary diagnostics: CTR, landing-page conversion rate, cost per lead, and lead quality

Traffic should go directly to the offer page. `/service/conversion-tracking` remains a secondary reassurance route for organic, warm, or research-led visitors.

## Campaign Structure

- Campaign: `ATD | Meta | Tracking Audit Pilot | July 2026`
- Ad Set 1: `Broad | Business Owners + Marketers | Ghana-Nigeria`
- Ad Set 2: `Interest | Ads + Marketing + Ecommerce | Ghana-Nigeria`
- Keep placements and delivery settings consistent across the two ad sets so audience strategy is the primary variable.
- Do not add further audience segmentation during the initial pilot unless delivery is materially constrained.

Creative angles:

1. Your ads may not be the problem. Your tracking might be.
2. Before you scale your ads, check your tracking.
3. Do your ad reports match your actual leads?
4. Running Meta, Google, or TikTok Ads?

## Qualification Standard

A qualified request should have:

- a valid business website;
- active advertising or a defined near-term launch;
- a measurable conversion action;
- a plausible tracking, attribution, or reporting problem;
- enough context to support a useful diagnostic response.

Lead quality should be reviewed manually after seven days. Raw lead volume is not the success definition.

## Measurement Contract

Required UTMs:

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=tracking_audit_pilot_jul2026
utm_content={{ad.name}}
utm_term={{adset.name}}
```

Reporting filter:

```text
LEAD_SOURCE = tracking_audit_offer
AND IS_TEST_LEAD is not true
AND UTM_SOURCE = meta
AND UTM_MEDIUM = paid_social
AND UTM_CAMPAIGN = tracking_audit_pilot_jul2026
```

Newsletter, exit-popup, contact-form, and scheduling events are secondary signals. The pilot optimizes only for Tracking Audit `Lead`.

## Decision Rules

| Signal | Action |
| --- | --- |
| Low CTR and no leads | Replace the creative or message angle |
| High CTR and no leads | Inspect landing-page and form friction |
| Leads with poor quality | Tighten qualification copy and targeting |
| Good leads with high CPL | Continue while optimizing creative and conversion rate |
| Good leads with stable CPL | Increase budget by 20-30% |
| Duplicate or unreliable events | Pause scaling and fix measurement first |

Avoid daily structural changes. Make the first formal optimization review on days 4-7 and the scale/iterate/pause decision after day 14.

## Launch Gates

Paid delivery remains disabled until all of the following are true:

- latest approved frontend is live on Namecheap/cPanel;
- production smoke URL returns the redesigned offer page;
- production form capture reaches Brevo list 11 and the expected CRM handoff;
- Browser and Server Meta `Lead` use the same `event_id`;
- Meta Test Events reports one deduplicated conversion;
- `META_CAPI_TEST_EVENT_CODE` is removed after the controlled test window;
- production consent behavior passes the required matrix.

Smoke URL:

```text
https://alphatrack.digital/offer/tracking-audit?utm_source=meta&utm_medium=paid_social&utm_campaign=tracking_audit_pilot_jul2026&utm_content=post_cpanel_deploy_smoke&utm_term=broad_test
```

