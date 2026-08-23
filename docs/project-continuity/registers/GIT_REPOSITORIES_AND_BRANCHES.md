# ATD Git Repositories and Branch Register

Last reviewed: 2026-08-23

## Canonical Repositories

| Repository | Purpose | Production branch/release | Test branch | Protection/current state |
| --- | --- | --- | --- | --- |
| `alphatrackdigital/alphatrackdigital` | Website frontend, cPanel workflows, historical compatible handlers, continuity docs | protected `main@02eadaf8949a08d46952bbea677b9e2ea212fc48` | `staging` | PRs and `PR release gate` required; force push/deletion blocked; protected release and rollback workflows |
| `alphatrackdigital/atd-backend-test` | Canonical Netlify/Vercel backend source | protected `main@2f3941fa3a9753de327542925f870b0faeea814b` | `staging` | PR + Backend CI requirements; PR #7 merged; no open issues at review |
| `alphatrackdigital/website-internal-test` | Historical static prototype | none | none | Do not treat as current frontend test source; archive only after Pages/environment policy is decided |

## Hosting Bindings

| Platform/project | Repository/branch role |
| --- | --- |
| Namecheap/cPanel production frontend | frontend protected `main`; releases only through approved GitHub Actions workflow |
| Netlify `alphatra-serv` production backend | backend protected `main` |
| Vercel frontend test | frontend `staging` |
| Vercel backend test | backend `staging` |
| Netlify frontend test mirror | frontend `staging`; automatic builds stopped to preserve credits |

## Branch and Archive Policy

- `main` means reviewed production source. Do not use it as an experimentation branch.
- `staging` means controlled test-ground source. It does not authorize live lead/CRM use.
- Website `deploy` and `vercel-backend` were preserved as exact recovery tags and then deleted.
- Fully merged feature branches were removed after ancestry/coverage verification.
- The website repository's legacy `backend` branch remains temporarily. Do not archive/delete it before the Aug 25 stability checkpoint and a fresh hosting-binding review.
- Keep draft continuity PR #43 documentation-only.

## Naming Guidance

- `atd-backend-test` is now a misleading repository name because it supplies production and testing. A future rename to `atd-backend` is reasonable only after Netlify/Vercel bindings, Git remotes, docs and recovery procedures are mapped.
- Do not rename the same-name `alphatrackdigital` repository casually; it also affects the GitHub profile repository identity and multiple integrations.
- Do not combine a repository rename, branch deletion and hosting rebind in one operation.

## Safe Legacy-Retirement Sequence

1. Complete and record the Aug 25 read-only checkpoint.
2. Confirm Netlify production remains bound to backend-repository `main@2f3941fa...` or its verified successor.
3. Resolve any ambiguous Meeting ledger state before cleanup.
4. Create and verify the intended archive tag at the exact legacy branch tip.
5. Produce a deletion plan listing the exact ref and recovery path.
6. Obtain explicit owner approval for deletion.
7. Delete only the verified target and recheck Vercel/Netlify/cPanel bindings afterward.

## Documentation Branch

This pack reuses existing draft PR #43, branch `codex/atd-continuity-handoff`. It was brought current with frontend `main`; unrelated local user changes are excluded.
