## Scope

Describe the frontend change and any Tracking/Brevo/API contract impact.

## Execution / handoff checkpoint

- Current execution owner: Local / Cloud
- Source branch:
- Exact starting/checkpoint SHA:
- Local ↔ Cloud handoff occurred: Yes / No
- If Cloud continued an existing branch, confirm the Cloud PR targets that source branch rather than `main`.

## Checks

- [ ] I ran the targeted tests required by this change.
- [ ] I ran `npm run release:prepare` when this change is a provider-QA/release candidate.
- [ ] Cloudflare exact-SHA QA is required for this change.
- [ ] This PR is eligible for cPanel production only after separate release authorization.

## Provider notes

- Website runtime QA uses `atd-website-qa` on Cloudflare.
- Public production remains on cPanel.
- Do not recreate `atd-website-test` on Vercel.
- Do not use a frontend provider preview when source/CI validation is sufficient.

## Production authorization

State explicitly whether this PR authorizes a production deployment. Default: **No**.
