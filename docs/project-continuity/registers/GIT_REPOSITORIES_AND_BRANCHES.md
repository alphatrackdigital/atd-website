# Git Repositories and Branches

Last reviewed: 2026-08-18

## Canonical Operating Model

| Concern | Canonical source | Runtime role |
| --- | --- | --- |
| Website frontend | `alphatrackdigital/alphatrackdigital`: `main` production source, `staging` test source | cPanel production is manually released from `main`; Vercel frontend test domain tracks `staging`; Netlify frontend is connected to `staging` with automatic builds stopped |
| Backend API | `alphatrackdigital/atd-backend-test`: `main` production source, `staging` test source | Netlify `alphatra-serv` production remains on `main`; Vercel backend test domain tracks `staging` |
| Legacy static prototype | `alphatrackdigital/website-internal-test`, `main` | Historical static HTML snapshot; do not treat as the current React website |

Use short-lived `feature/*`, `fix/*`, `content/*`, `hotfix/*`, `chore/*`, or `experiment/*` branches. `staging` is the deliberate long-lived exception used to isolate the shared Vercel/Netlify test projects from production `main`.

## Branch Evidence and Recommendation

### `alphatrackdigital/alphatrackdigital`

| Branch | Evidence on 2026-08-18 | Recommendation |
| --- | --- | --- |
| `main@38f280d0` | Default frontend branch; includes merged admin work from PR #41. Local checkout is still at `4fdcec59`, seven commits behind, with pre-existing user changes. | **Retain and protect.** Do not pull/rebase the dirty local checkout until `ConversionTracking.tsx` and `reports/` are preserved intentionally. |
| `staging@38f280d0` | Created from the exact current `main` tip on 2026-08-18. Vercel frontend test domain tracks this branch; Netlify frontend is connected to it with automatic builds stopped. | **Retain as the frontend integration-test branch.** Merge reviewed work here for testing; promote to `main` only through an approved production release. |
| `feat/admin-backend-and-ui@8cef8a40` | PR #41 merged; zero commits ahead and one behind `main`. | **Removed 2026-08-18.** Tip and zero-ahead status were revalidated immediately before deleting the remote branch; history remains in `main`/PR #41. |
| `martech/brevo-campaign-attributes@3de876bb` | PR #24 merged; zero ahead and 68 behind `main`. | **Removed 2026-08-18.** Tip and zero-ahead status were revalidated immediately before deleting the remote branch; history remains in `main`/PR #24. |
| `codex/complete-tracking-setup@1fa9d82b` | Zero ahead and 95 behind `main`; therefore its tip is already an ancestor of `main`. | **Removed 2026-08-18.** Tip and zero-ahead status were revalidated immediately before deleting the remote branch; commit remains reachable from `main`. |
| `deploy@4a60eb93` | Diverged: six unique commits, 99 behind. File-level reconciliation accounts for all 224 files; no usable unique feature remains and the legacy editor has a missing import. | **Removed 2026-08-18 without merging.** Recovery tag `archive/deploy-2026-05-14` was verified at full SHA `4a60eb93f0000760c670f4599f97f01c7739c5e3` before deletion. |
| `backend@60adfd9d` | All 22 files map to canonical backend (10 exact, 12 deliberately updated); previously fed Netlify production and contains rollback commit `9b782887`. | **Retain through the stability window.** Create `archive/legacy-backend-2026-06-16` after explicit approval, retain the live rollback deploy reference, and delete the branch only after stability is accepted. |
| `vercel-backend@42259b36` | All 41 files map to canonical backend (15 exact, 26 deliberately updated); active Vercel backend testing is isolated on canonical `staging@c9035d19`. | **Removed 2026-08-18 without merging.** Recovery tag `archive/vercel-backend-2026-06-12` was verified at full SHA `42259b3695b79d09f6b7f3d99e087eb9104673f9` before deletion. |

### `alphatrackdigital/atd-backend-test`

| Branch | Evidence on 2026-08-18 | Recommendation |
| --- | --- | --- |
| `main@c9035d19` | Default branch and current Netlify production source. Deploy `6a84a21d4d72f10008e50a31` is ready and repeated read-only smoke checks passed. | **Retain and protect.** This is the canonical backend branch. |
| `staging@c9035d19` | Created from the exact current `main` tip on 2026-08-18. The Vercel backend test domain tracks this branch, while Netlify production allows only `main`. | **Retain as the backend integration-test branch.** Validate here before an approved PR/merge to production `main`. |
| `codex/backend-reconciliation@30a2232f` | PRs #2 and #3 merged; zero ahead and two behind `main`. | **Removed 2026-08-18.** Tip and zero-ahead status were revalidated immediately before deleting the remote branch; history remains in `main`/PRs #2 and #3. |

### `alphatrackdigital/website-internal-test`

| Branch | Evidence on 2026-08-18 | Recommendation |
| --- | --- | --- |
| `main@a8f3a66d` | Seven static Tailwind-CDN HTML files from February 2026; not the current Vite/React implementation. It is not the source of either current Vercel project or either Netlify project. GitHub Pages is configured through the active `pages-build-deployment` workflow but currently reports `errored`; `github-pages` and `Production` environments remain. No repository webhooks were found. | **Repository archive candidate, not immediate deletion.** Decide whether the historical GitHub Pages URL must be retained, redirected, or intentionally retired before archiving. |

## Verified Hosting Bindings

| Hosting project | Source and current state | Finding |
| --- | --- | --- |
| Netlify backend `alphatra-serv` | `atd-backend-test/main@c9035d19`; deploy `6a84a21d4d72f10008e50a31` ready | Correct canonical production binding. |
| Vercel backend `atd-backend-test` | Repository `atd-backend-test`; stable domain `atd-backend-test.vercel.app` pinned to `staging`; Git build filter continues only when `VERCEL_GIT_COMMIT_REF=staging`; existing deployment `dpl_45VohxUSHoRf8erL4n1p1ahmmLyA` remains ready | Test traffic and automatic builds are isolated from backend production `main`. The Vercel project still reports `main` as its internal Production Branch, but `main` builds are skipped and the stable test domain is branch-pinned. |
| Netlify frontend `alphatrackdigital` | `alphatrackdigital/staging@38f280d0`; deploy `6a84cc9442bc7fa01a72dd31` ready; allowed branch `staging`; `stop_builds=true` | Test-only and protected against automatic 15-credit production deploys. Use an explicit draft/preview deploy when Netlify-specific frontend validation is needed. It still packages four functions, so it is not yet technically frontend-only. The isolation change produced two successful production deploys and consumed 30 credits total. |
| Vercel frontend `atd-website-test` / alias `website-internal-test.vercel.app` | Git link corrected from legacy `website-internal-test` to `alphatrackdigital/alphatrackdigital`; stable domain pinned to `staging`; Git build filter continues only for `staging`; existing deployment `dpl_FLAxDJp8oDhZz8h8sR1srvpdkGXU` remains ready | Correct current repository and isolated test branch. The existing artifact predates the binding correction, but GET-only verification returned 200. A future push to `staging` will create the first deployment from the corrected Git connection. |

## Repository Naming Guidance

- Rename `atd-backend-test` to **`atd-backend`** only after recording and updating both the Netlify production and Vercel test-project Git bindings. The repository now serves code for both environments, so `-test` is misleading.
- Keep `alphatrackdigital/alphatrackdigital` unchanged for now. It is both the website repository and the account's special same-name profile repository; renaming it would affect profile presentation, remotes, workflows, and hosting integrations. A future clean split would create `atd-website` for application code while retaining a small `alphatrackdigital` profile repository.
- Prefer archiving `website-internal-test` over renaming it if binding verification confirms it is unused. Its contents are a historical prototype, not a current test source.
- Do not rename repositories and delete legacy branches in one operation. Complete binding verification, rename one repository, verify deploy sources/remotes, then perform branch cleanup separately.

## Safe Cleanup Order

1. **Completed 2026-08-18:** create matching `staging` branches, correct the Vercel frontend repository link, pin both Vercel test domains/build filters to `staging`, keep Netlify backend on `main`, and connect/lock the Netlify frontend test project on `staging`.
2. Protect both canonical `main` branches and require PR review/checks where the account plan supports it.
3. **Completed 2026-08-18:** delete the four fully merged/ancestor branches: `feat/admin-backend-and-ui`, `martech/brevo-campaign-attributes`, `codex/complete-tracking-setup`, and backend-repo `codex/backend-reconciliation`.
4. **Completed 2026-08-18:** file-level results are in `../LEGACY_BRANCH_RECONCILIATION.md`; verified archive tags were created at the exact tips, then `vercel-backend` and `deploy` were deleted without merging. Both Vercel test endpoints remained HTTP 200 and the Netlify frontend deployment ID remained unchanged.
5. Observe the new Netlify backend through the agreed stability window before removing the legacy `backend` branch.
6. Decide the fate of the errored GitHub Pages site, then archive `website-internal-test` only after its Pages environments/workflow are intentionally retired or retained by policy.

The environment-isolation correction changed hosting bindings but no environment values: two `staging` branches were created; the Vercel frontend repository link was corrected; both Vercel test domains and build filters were pinned to `staging`; Netlify frontend moved to `staging` and automatic builds were stopped. Netlify published two successful frontend production deploys during the settings transition (30 credits total). The later legacy-branch cleanup triggered no hosting build and consumed no additional Netlify credits. Netlify production backend and the cPanel production workflow remained on `main`.
