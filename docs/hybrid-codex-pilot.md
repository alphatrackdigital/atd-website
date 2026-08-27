# Website hybrid Codex handoff pilot

This file is intentionally non-operational. It exists only to prove the ATD Website can move safely from a pushed GitHub checkpoint into Codex Cloud and back through a Cloud-created PR without changing runtime code or provider configuration.

## Baseline

- Repository: `alphatrackdigital/atd-website`
- Branch: `docs/hybrid-codex-handoff-pilot`
- Base main SHA: `01b656230df97084d0552af566c78389e4685198`
- Runtime impact: none
- Provider deployment required: no
- Production authorization: no

## Pilot checkpoints

### 1. GitHub/control-plane checkpoint

Created from canonical `main`. No application or provider files changed.

### 2. Local checkpoint

Pending.

Local confirmation:

> Pending

### 3. Cloud checkpoint

Pending.

Cloud confirmation:

> Pending

## Acceptance

The pilot passes when:

- Local and Cloud do not own the source branch simultaneously;
- Local commits and pushes an exact checkpoint;
- Codex Cloud starts from that exact source branch/SHA;
- `npm run release:prepare` passes at the handoff points;
- Cloud changes only this file;
- Cloud returns its delta through a PR into this source branch;
- the parent PR passes the website PR release gate;
- no provider deployment is created.
