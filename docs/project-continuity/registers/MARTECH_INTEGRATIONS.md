# ATD Martech Integration Register

Last reviewed: 2026-08-23

| System | Production role | Current launch state | Next non-blocking action |
| --- | --- | --- | --- |
| Brevo Contacts/Lists | Lead storage, segmentation and lifecycle | Launch gate passed for verified Strategy Call and Tracking Audit flows | Monitor; retain test/suppression discipline |
| Brevo DOI | Newsletter confirmation | Implemented with fallback | Periodic deliverability/template review |
| Brevo Meetings | Booking source and webhook | Live header-auth delivery verified; CRM/GA4/Meta/notification ledger completed | Remove historical `?token=` fallback in a later small PR |
| Brevo CRM | Deals/tasks and follow-up | Strategy Call Demo scheduled deal/task and Tracking Audit deal/task verified live | Monitor duplicates/quota; do not repeat live QA unnecessarily |
| Brevo notifications/automation | Internal alerts and nurture | Required launch notification steps verified; historical workflow records exist | Paid/nurture activation remains an owner decision and must preserve exclusions |
| GTM | Tag orchestration | Implemented and historically consent-tested | Monitor drift; no republish without a scoped change |
| GA4 | Analytics/conversions | Meetings `meeting_booked_confirmed` verified live; broader instrumentation retained | Normal monitoring/reporting |
| Meta Pixel + CAPI | Browser/server conversion tracking | Prior dedup proof remains valid; final release did not re-enable temporary Test Events code | Do not spend another production lead solely to repeat dedup QA |
| Ketch | CMP/consent signal | Implemented with Google Consent Mode bridge and historical matrix evidence | Recheck only if configuration changes or monitoring indicates drift |
| Microsoft Clarity | Consent-gated behavioral analytics | Implemented through the tracking stack | Review funnels/masking after useful production volume |
| Google Ads | Linkage/audience/conversion readiness | Technical groundwork present | Paid activation/billing/conversion decisions remain business scope |
| MongoDB Atlas | Canonical backend datastore | Migrated from developer personal ownership to ATD-controlled account | Later least-privilege, network and off-cluster-backup review |
| Netlify `alphatra-serv` | Production backend runtime | Running backend `2f3941fa...`; secrets isolated to production; origin/security QA passed | Aug 25 read-only stability checkpoint |
| Vercel | Frontend/backend test grounds | Controlled `staging` branches | Keep non-production data/config isolated |
| Netlify frontend | Frontend-only test mirror | Connected to frontend `staging`; automatic builds stopped | Use only when Netlify-specific frontend verification is necessary |
| Namecheap/cPanel | Static production frontend | Running protected frontend release `02eadaf8...` | Operate through protected release/rollback workflows |
| GitHub Actions | CI, release and rollback control | Required PR gates and protected production workflows active | Preserve immutable-SHA and approval controls |
| IndexNow | Post-release discovery notification | Integrated as best-effort release step | No separate action unless release/search monitoring shows a problem |
| Search Console | Organic search performance/indexing | Local SQL source was identified but excluded from this PR | Review query results separately and create an SEO backlog |
| Notion Agency OS | Business operations, tasks and case-study context | Connected and read; several records still show superseded pre-launch gates | Sync after this GitHub continuity PR is reviewed |

## Lead Data Contract

Priority lead paths preserve, where applicable:

- consent status and timestamp;
- lead source plus first/latest source history;
- website route and offer;
- UTM and supported click identifiers;
- campaign/source/medium/content/term metadata;
- Meta browser/server event ID;
- `SERVICE_INTEREST` as an array;
- `MONTHLY_BUDGET` as Brevo category `1`-`4`;
- explicit QA/test exclusion state.

## Environment Documentation Rule

Document variable names and purposes only. Never store values. Main variable families include `BREVO_*`, `GA4_*`, `META_*`, GTM identifiers, frontend API endpoint names, database connection names, admin/authentication names, and platform context markers.

Production secrets are isolated from non-production contexts. Any future environment audit must read names/scopes without revealing values.
