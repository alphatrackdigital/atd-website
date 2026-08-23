# ATD Decision Log

Last reviewed: 2026-08-23

| Date/period | Decision | Rationale | Current consequence |
| --- | --- | --- | --- |
| 2026 rebuild | Use Vite/React rather than the earlier WordPress concept | Matches the implemented repository and performance/SEO workflow | WordPress/CMS conversations are historical unless a new CMS project is approved |
| 2026 hosting reconciliation | Keep static production frontend on Namecheap/cPanel | Existing domain/hosting and optimized static publishing were retained | GitHub Actions packages, approves, deploys and can roll back cPanel releases |
| 2026 backend reconciliation | Use Netlify `alphatra-serv` as production backend | It is the live public Function runtime; Vercel remains test ground | Backend production changes come from the separate backend repository `main` |
| 2026 test isolation | Use `staging` for Vercel frontend/backend tests | Prevents experiments on production-source `main` | Test work must not target live lead/CRM resources without explicit authorization |
| 2026 repository cleanup | Preserve recovery tags before deleting obsolete branches | Prevents irreversible loss while reducing ambiguity | `deploy` and `vercel-backend` were archived/deleted; legacy `backend` waits for Aug 25 |
| 2026 MongoDB migration | Move datastore ownership from developer personal account to ATD | Removes a critical ownership dependency | ATD Atlas is canonical; least-privilege/network/backup improvements remain maintenance work |
| 2026 release governance | Protect frontend/backend `main` with PR and CI | Makes reviewed source and deployment evidence repeatable | Direct unreviewed production changes are no longer the normal path |
| 2026 security hardening | Reject supplied disallowed production origins before writes | CORS headers alone are not authorization | Only canonical ATD browser origins are accepted in production |
| 2026 Meetings reliability | Use durable per-step processing and fail closed on ambiguous non-idempotent writes | Avoid duplicate CRM deals/tasks after provider/network uncertainty | Ambiguous `started` steps require reconciliation rather than automatic replay |
| 2026 Meetings authentication | Prove header auth before removing URL-token compatibility | Avoid breaking the live webhook during hardening | Header auth is proven; remove `?token=` later in a small isolated PR |
| 2026 campaign gate | Separate technical clearance from paid activation | Spend and campaign activation are business decisions | Tracking Audit is cleared but remains inactive until owner authorization |
| 2026 continuity | Treat Git/live QA as stronger evidence than planning conversations | Notion and ChatGPT history can be stale or aspirational | This GitHub pack is the cross-agent restart source of truth |

## Decision Discipline

Do not bundle repository renames, legacy deletion, dependency major upgrades, authentication cleanup, or campaign activation into one change. Each requires its own evidence, rollback/continuity impact review, and explicit authorization.
