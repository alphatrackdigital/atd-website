# Codex Project Rules — ATD Website

This repository is the canonical public website frontend for AlphaTrack Digital.

## Development authority

- GitHub is the source of truth and integration boundary.
- Work on isolated feature branches/worktrees; do not edit `main` directly.
- Local Codex and Codex Cloud must not independently own the same source branch at the same time.
- Local → Cloud handoff requires a coherent change, relevant checks, commit, push, and exact SHA checkpoint.
- Codex Cloud may use a synthetic `work` branch and expose no raw Git remote; verify the selected source branch and exact starting SHA instead.
- Return Cloud changes through Codex Cloud's native **Create PR** flow.
- When continuing an existing feature branch, the Cloud PR must target that source branch, not `main`.
- GitHub Actions remains the authoritative release/build gate.

## Provider boundaries

- Frontend exact-SHA QA: Cloudflare Worker `atd-website-qa`.
- Public production: Namecheap/cPanel LiteSpeed.
- Backend/API runtime: separate backend service/repository; do not move backend work into this frontend repo.
- The retired Vercel `atd-website-test` project must not be recreated.
- Netlify frontend previews are not the canonical website QA path.
- Provider deployment is separate from Local/Cloud code generation.

## Production guardrails

Do not perform or authorize any of the following unless the task carries separate explicit approval:

- cPanel production deployment;
- DNS/custom-domain changes;
- production-secret changes;
- backend provider migration;
- Vercel project recreation;
- Meta campaign activation;
- bypassing PR/release-gate checks.

## Testing and validation

- UI-only changes may use focused checks during iteration.
- Form behavior, API payloads, tracking, consent, attribution, authentication, schema mappings and business logic require targeted tests.
- Before provider QA or production packaging, run the canonical release gate:

```bash
npm install --ignore-scripts --package-lock=false
npm run release:prepare
```

- Cloudflare frontend QA should use the deliberate exact-SHA workflow, not an automatic provider preview.
- Preserve global QA noindex behavior on `atd-website-qa`.

## Tracking / Brevo notes

- `SERVICE_INTEREST` is a Brevo multiple-choice attribute and should be sent as an array.
- `MONTHLY_BUDGET` should use Brevo category values `1`-`4`.
- Keep consent, attribution, source, route and offer fields explicit.
- Do not assume frontend QA proves backend/Brevo E2E; backend runtime verification remains a separate gate.

## Handoff

For a material Local ↔ Cloud transfer record:

- repository;
- source branch;
- exact SHA;
- execution owner handing off / next owner;
- checks already run;
- remaining scope;
- provider/runtime restrictions.

Do not hand off uncommitted local-only work.
