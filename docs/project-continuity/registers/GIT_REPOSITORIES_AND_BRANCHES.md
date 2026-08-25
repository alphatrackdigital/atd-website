# ATD Git Repositories and Branch Register

Last reviewed: 2026-08-25

## Canonical Repositories

| Repository | Purpose | Production branch/release | Test branch | Protection/current state |
| --- | --- | --- | --- | --- |
| `alphatrackdigital/atd-website` | Website frontend, cPanel workflows, historical compatible handlers, continuity docs | protected `main`; current head `2948f862efb77908aacf78d677fbf1632612273e`; last verified cPanel production release remains separately tracked | `staging` | PR required; 1 approval; CODEOWNER review; most-recent-push approval; `PR release gate`; force push/deletion blocked; protected release and rollback workflows |
| `alphatrackdigital/atd-backend-test` | Canonical Netlify/Vercel backend source | protected `main@11d253b54bbc315c80275c516bcc6750ab76b1ac` | `staging` | PR + Backend CI requirements; external-developer owner-approval gate; Tunde has no write access |
| `alphatrackdigital/website-internal-test` | Historical static prototype | none | none | Do not treat as current frontend test source; archive only after Pages/environment policy is decided |

## Hosting Bindings

| Platform/project | Repository/branch role |
| --- | --- |
| Namecheap/cPanel production frontend | `atd-website` protected `main`; releases only through approved GitHub Actions workflow |
| Netlify `alphatra-serv` production backend | backend protected `main` |
| Vercel `atd-website-test` | **Binding requires post-rename refresh:** Vercel still reports the previous repo slug `alphatrackdigital`; reconnect to `alphatrackdigital/atd-website` before relying on new preview deployments |
| Vercel backend test | backend `staging` |
| Netlify frontend test mirror | frontend `staging`; automatic builds stopped to preserve credits |

## Branch and Archive Policy

- `main` means reviewed production source. Do not use it as an experimentation branch.
- `staging` means controlled test-ground source. It does not authorize live lead/CRM use.
- Website `deploy` and `vercel-backend` were preserved as exact recovery tags and then deleted.
- Fully merged feature branches were removed after ancestry/coverage verification.
- The website repository's legacy `backend` branch remains temporarily. Do not archive/delete it before a fresh hosting-binding review and explicit owner approval.

## Naming Guidance

- Frontend repository rename completed on 2026-08-25: `alphatrackdigital/alphatrackdigital` → `alphatrackdigital/atd-website`.
- Historical records may retain the previous repository name when they are snapshots of earlier state; active operational docs should use `alphatrackdigital/atd-website`.
- `atd-backend-test` remains a misleading repository name because it supplies production and testing. A future rename to `atd-backend` is reasonable only after Netlify/Vercel bindings, Git remotes, docs and recovery procedures are mapped.
- Do not combine a repository rename, branch deletion and hosting rebind in one operation.

## Safe Legacy-Retirement Sequence

1. Confirm Netlify production remains bound to the backend repository and its verified successor commit.
2. Resolve any ambiguous Meeting ledger state before cleanup.
3. Create and verify the intended archive tag at the exact legacy branch tip.
4. Produce a deletion plan listing the exact ref and recovery path.
5. Obtain explicit owner approval for deletion.
6. Delete only the verified target and recheck Vercel/Netlify/cPanel bindings afterward.

## Repository Rename Follow-up

1. Update local frontend remotes to `https://github.com/alphatrackdigital/atd-website.git`.
2. Reconnect Vercel `atd-website-test` to `alphatrackdigital/atd-website` before using it for new previews.
3. Keep the Netlify frontend mirror unchanged unless its Git binding is later re-enabled.
4. Use `alphatrackdigital/atd-website` in all new developer assignments and operational documentation.
