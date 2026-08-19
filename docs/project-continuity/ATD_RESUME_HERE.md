# ATD Resume Here

Last reviewed: 2026-08-19

## Pause Snapshot

| Item | State |
| --- | --- |
| Repository | Frontend `alphatrackdigital/alphatrackdigital`; backend `alphatrackdigital/atd-backend-test` |
| Frontend branches | Production source `main@38f280d0`; test source `staging@38f280d0`; local checkout remains at `4fdcec59`, seven commits behind, with pre-existing user changes |
| Production frontend | `https://alphatrack.digital`, static Namecheap/cPanel LiteSpeed architecture. Exact asset fingerprint verifies live commit `45043ef7b62890f5b8d0057eeef473e4610af44e` with high confidence; current `main@38f280d0` is not yet live. |
| Staging/test | Both repositories have a `staging` branch initially matching `main`. Vercel backend/frontend stable test domains are pinned to `staging`, and both projects skip Git builds from other branches. Vercel frontend is now linked to `alphatrackdigital/alphatrackdigital` rather than the legacy static repository. Netlify frontend is linked to website `staging`, automatic builds are stopped to preserve credits, and its current deploy `6a84cc9442bc7fa01a72dd31@38f280d0` is ready. |
| Public form/API backend | Netlify `alphatra-serv`, bound to `atd-backend-test/main` |
| Backend source | `main@c9035d19e16e77badefaaf1257be5837bc694476` after merged PRs #2 and #3 |
| Netlify backend deployment | Deploy `6a84a21d4d72f10008e50a31` is ready; initial and follow-up root/blog/auth/CORS read-only checks passed on 2026-08-18; rollback deploy `6a28859001e02f0008d0faf7@9b782887` retained. Keep the stability window open through 2026-08-25 before the final checkpoint or legacy `backend` deletion. |
| Test-isolation change cost | Netlify published two successful frontend production deploys while the branch/build settings were changed. At 15 credits each, the one-time correction consumed 30 credits. Automatic frontend builds are now stopped. |
| Legacy branch cleanup | Website `deploy@4a60eb93` and `vercel-backend@42259b36` were archived as exact recovery tags and removed on 2026-08-18. Remaining website branches are `main`, `staging`, and the temporarily retained legacy `backend`. Vercel endpoints remained HTTP 200 and Netlify stayed on deploy `6a84cc9442bc7fa01a72dd31`; this cleanup used zero Netlify credits. |
| Frontend release review | The complete `45043ef7..38f280d0` delta was reviewed on 2026-08-19. Draft PR #42 at `3ae5c386` implements the three code-level hardening requirements and passed the full local release gate. It remains unmerged and has no production effect. `main` is unprotected, Production self-review is allowed, and the read-only cPanel connection should be refreshed only after the hardening/governance review. |
| Current local changes | Existing edit to `src/pages/ConversionTracking.tsx`; untracked `reports/` with GSC SQL source; unrelated untracked `pipx_shared.pth`. None belongs to the continuity publishing scope. |
| Latest committed work | Remote `main@38f280d0` contains protected cPanel production publishing, release packaging/smoke/rollback, prerender improvements and IndexNow notification. Draft PR #42 adds release hardening at `3ae5c386`. |

The local edit and `reports/` directory predate this continuity pack and must not be discarded or folded into unrelated work without review.

## What Is Definitely Built

- Vite + React + TypeScript website with React Router, Tailwind, shadcn/Radix, Framer Motion, SEO metadata, prerendering, sitemap, legal pages, and responsive page templates.
- Core pages for homepage, About, Services, Expertise, Results, Blog, Contact, Booking, legal content, and the Tracking Audit offer.
- Lead flows for Contact Us, Tracking Audit, Newsletter, Exit Popup, and Brevo Meetings-related booking handling.
- Brevo field mapping, list routing, consent metadata, attribution/source lifecycle, DOI support, internal notifications, CRM fallback, and tests.
- GTM/dataLayer tracking contract, GA4 booking webhook support, Meta browser/server event-ID handoff and deduplication safeguards.
- Ketch-to-Google-Consent-Mode bridge, consent-aware Meta/Clarity behaviour, and historical multi-scenario QA evidence.
- Protected GitHub Actions production publishing with packaging, approval gate, cPanel backup/activation, GET-only smoke checks, rollback, artifacts, and IndexNow submission.

## Do Not Assume

- Do not assume `main@38f280d0` is live. The verified cPanel build is `45043ef7`; re-verify after any future release.
- Do not assume current Brevo workflows, credits, exclusions, webhook registrations, or sender/domain state match June/July evidence.
- Do not assume Meta Browser/Server deduplication remains healthy in Events Manager.
- Do not assume GA4, GTM, Ketch, Clarity, Google Ads, Vercel, or Netlify configurations have not drifted.
- Do not assume older Notion launch dates or hosting recommendations remain current; later Git and repository documentation supersede them.
- Do not submit forms or webhooks merely to re-prove the backend migration. The non-mutating production gate has passed; any real integration event needs separate approval.

## Recommended Restart Sequence

1. **Protect the working tree.** Review the existing `ConversionTracking.tsx` diff and the two `reports/` SQL files; identify their owner and purpose before changing them.
2. **Completed 2026-08-18: verify the public frontend release.** The prerendered homepage and seven critical assets match `45043ef7` exactly; GET-only public smoke passed. See `FRONTEND_PRODUCTION_VERIFICATION.md`.
3. **Partially completed 2026-08-19: harden protected publishing.** Environment, reviewer, main-only policy, expected variable names and SSH secret names are present; connection and release workflows last passed on 2026-08-11. Draft PR #42 implements source-map exclusion, immutable workflow checkouts and non-blocking IndexNow and passed the full local gate. Review it and tighten branch/reviewer governance before considering merge; rerun the read-only connection workflow only after those decisions.
4. **Run non-mutating production checks.** Homepage, Tracking Audit, legal routes, sitemap, 404, IndexNow key, and API GET/auth behaviour where safe.
5. **Observe backend stability.** Keep `c9035d19` live, retain `9b782887` rollback, avoid unnecessary Netlify builds, and defer credential/network hardening until stability is established.
6. **Use the isolated test paths.** Push test work to `staging`; Vercel test domains track that branch. Netlify frontend is manual-preview only while `stop_builds=true`; use a draft deploy, never `--prod`, when Netlify-specific frontend validation is required.
7. **Reconfirm consent and tracking.** Repeat the documented production consent matrix before paid traffic: fresh visit, Reject All, Accept All, Analytics-only, Targeted Advertising-only, and preference changes.
8. **Reconfirm lead infrastructure with approval.** If a new form/booking submission is authorized, test one controlled identity and verify list routing, attribution, consent, CRM handoff, notifications, GA4, and Meta deduplication.
9. **Audit Brevo launch state read-only.** Workflow status, active contacts, test-lead exclusions, suppression, credits, lists, fields, webhook registration, and unsubscribe/profile pages.
10. **Reconcile Notion.** Update the Agency OS only after new evidence is saved repo-side and reviewed.
11. **Decide the campaign gate.** Launch the Tracking Audit Meta pilot only after production, consent, form, Brevo, and Meta event gates pass.

## Highest-Priority Decisions

- Should the reviewed `45043ef7..38f280d0` delta be released through the protected cPanel workflow so production catches up to current `main`?
- Is the optional Book-a-call CRM deal/task and custom webhook proof required before campaign launch?
- Should the current local Conversion Tracking copy edit be retained, revised, or discarded?
- Does the final Netlify backend checkpoint pass on or after 2026-08-25, allowing the legacy `backend` branch to be tagged and considered for deletion?
- Should `atd-backend-test` be renamed to `atd-backend` after hosting bindings are mapped?
- Are Brevo test/QA contacts excluded from reporting and every workflow send path?

## Validation Commands Before a Release

```text
npm ci
npm run lint
npm test
npm run release:prepare
git status
git diff
```

Use targeted tests during ordinary work. The full release gate is appropriate before commit/deploy, not for documentation-only changes.

The backend-specific merge, migration and rollback checklist is in `ATD_BACKEND_MIGRATION_GATE.md`.

## Safety Boundaries

Do not deploy, publish GTM, change Ketch, activate Brevo workflows, send campaigns/test emails, submit forms, register webhooks, change environment values, or modify external records without explicit approval. Read-only inspection does not authorize mutation.
