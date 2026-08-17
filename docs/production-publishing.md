# Production Publishing

The public frontend at `https://alphatrack.digital` is a static cPanel deployment. Vercel is the test environment, the Netlify frontend is a mirror, and `alphatra-serv.netlify.app` remains the public form/API backend.

## Release Contract

The `Release public website` GitHub Actions workflow always checks out `main`; it does not deploy an arbitrary branch or a caller's uncommitted working tree.

Before requesting production approval it:

1. installs locked dependencies with `npm ci`;
2. runs ESLint and the full Vitest suite;
3. builds the client, SSR bundle, and prerendered routes;
4. checks every sitemap URL has a generated HTML file, title, canonical and byte-tight React root;
5. checks the static 404 and required cPanel files;
6. creates a versioned `.tar.gz`, SHA-256 checksum and release manifest;
7. stores both the package and deployable site as GitHub run artifacts.

The deploy job then waits on the GitHub `production` environment. After approval it uploads into a private directory under the cPanel account home, backs up the current static site, activates the release, and runs GET-only smoke checks. A failed smoke automatically restores the pre-deploy backup. `.well-known` and `cgi-bin` remain managed by cPanel and are never deleted by the workflow.

After the production smoke passes, the workflow verifies the public IndexNow key file and submits every canonical URL in `sitemap.xml` to the IndexNow API. An HTTP `200` or first-run `202` response is accepted. IndexNow notification happens only after a successful activation; it does not replace the sitemap or guarantee indexing.

## One-Time GitHub Setup

In repository **Settings -> Environments**, use `Production` and configure a required reviewer. Restrict deployments to `main`. GitHub only exposes environment secrets to the job after the environment's protection rules pass.

Add these environment variables:

| Variable | Example | Purpose |
| --- | --- | --- |
| `CPANEL_HOST` | hosting SSH hostname | SSH/SFTP host, not a URL |
| `CPANEL_USER` | cPanel account user | Dedicated deployment account where possible |
| `CPANEL_PORT` | `21098` or provider value | SSH port |
| `CPANEL_DOCUMENT_ROOT` | `/home/account/public_html` | Exact existing public document root |
| `PRODUCTION_URL` | `https://alphatrack.digital` | Post-deploy smoke target |

Add these environment secrets:

| Secret | Purpose |
| --- | --- |
| `CPANEL_SSH_PRIVATE_KEY` | Private half of a dedicated deployment key |
| `CPANEL_SSH_KNOWN_HOSTS` | Pinned host-key line for the exact host and port |

Create a dedicated key with no reuse outside deployment. Import and authorize its public half through cPanel **Security -> SSH Access -> Manage SSH Keys**. Confirm SSH access and `rsync` availability with the host before the first workflow run. Do not substitute password-based FTP credentials into this workflow.

Obtain `CPANEL_SSH_KNOWN_HOSTS` through a trusted channel or compare the `ssh-keyscan` result against the host fingerprint shown by Namecheap/cPanel support. Do not blindly trust an unverified scan.

After the variables, secrets, and authorized public key are in place, run **Actions -> Verify cPanel connection**. This protected workflow performs read-only authentication, host-pinning, document-root, write-permission, `realpath`, and `rsync` prerequisite checks. It does not upload or change website files.

## Local Release Preparation

Run:

```text
npm ci
npm run release:prepare
```

Output is written under the ignored `release/` directory. The archive contains the contents of `dist` at its root, including `.htaccess`. Verify the adjacent SHA-256 file before any manual upload.

A local package made from an uncommitted working tree is suffixed `-dirty` so it cannot be mistaken for the committed release. GitHub release packages come from a clean checkout and use the exact 12-character `main` commit.

## Deploying

1. Merge the reviewed release to `main`.
2. Open **Actions -> Release public website -> Run workflow**.
3. Enter `DEPLOY` exactly and provide a short release reason.
4. Review the completed build gate and downloadable package.
5. Approve the waiting `production` job.
6. Confirm the workflow's production smoke passes.

The smoke performs no form submission. It checks the homepage, Tracking Audit, legal routes, sitemap, and a genuine unknown-route `404`.

## Rollback

Every activation creates this pre-deploy snapshot on the cPanel account:

```text
~/.atd-backups/<12-character-commit>/
```

If the immediate smoke fails, the workflow automatically restores that snapshot. For a later manual rollback, use the matching workflow run's release ID and execute `.github/scripts/rollback-cpanel-release.sh` through an authenticated SSH session only after verifying:

- the exact cPanel account and document root;
- the backup directory contains the expected `index.html`;
- no separate release is currently running;
- a new backup of the current incident state has been retained if needed for diagnosis.

Do not delete or broadly clean `public_html`. The rollback script validates that the document root is below the cPanel account home and preserves `.well-known` and `cgi-bin`.

## First-Run Checklist

- Confirm the production GitHub environment actually pauses for approval.
- Confirm the checked-out and packaged SHA is the intended `main` commit.
- Download the cPanel package and verify its checksum.
- Confirm `.htaccess`, `404.html`, sitemap routes, fonts and hashed assets are present.
- Confirm the static frontend resolves form endpoints to the approved `alphatra-serv.netlify.app` service.
- Keep paid campaign traffic disabled during the first deployment.
- After the automated GET-only smoke, run the approved desktop/mobile consent matrix.
- Submit a real form only if separately approved; verify Brevo routing and Meta Browser/Server deduplication if exercised.
- Retain at least the preceding known-good backup until production observation is complete.

## Retention

GitHub retains deployable-site artifacts for 30 days and cPanel packages for 90 days. Remote `.atd-releases` and `.atd-backups` directories are intentionally not deleted automatically. Prune only named, superseded releases after checking the current marker at `~/.atd-current-release` and retaining at least one known-good rollback.
