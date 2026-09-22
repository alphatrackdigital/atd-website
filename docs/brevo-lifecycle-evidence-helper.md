# Brevo lifecycle evidence helper

## Purpose

`scripts/brevo-lifecycle-evidence.mjs` is ATD's reusable **read-first Brevo lifecycle evidence helper**.

It turns the earlier one-off Brevo read-only QA pattern into a repeatable, redacted check for:

- one known QA/contact identity;
- list membership and expected-list checks;
- lifecycle attribute presence and selected low-risk lifecycle values;
- email/SMS/WhatsApp suppression flags and list unsubscribe state;
- contact-attribute schema;
- selected email-template identity and active state;
- sender identity/status without exposing sender local-parts;
- transactional, marketing and inbound webhook configuration without exposing webhook URLs, auth tokens or header values.

It does **not** build or emulate Brevo Automations workflow introspection.

## Integration classification

- **Class:** existing Brevo API + ATD guarded/read-only helper.
- **Not:** an ATD custom MCP.
- **Not:** a substitute for the connected ChatGPT Brevo connector.
- **Not:** a workflow editor, campaign sender, transactional sender, CRM writer or webhook writer.

The helper is intentionally narrower than the generic Brevo connector because repeatable evidence collection should not expose mutation/send actions.

## Hard safety boundary

The helper contains only a GET transport function. There is no generic method argument and no create/update/delete/send/activate code path.

Every report records:

- `requestMethod: GET only`;
- `writesAttempted: 0`;
- `sendsAttempted: 0`;
- `workflowMutationsAttempted: 0`.

Automation workflow graph semantics are always returned as:

`MANUAL/UI EVIDENCE REQUIRED`

This includes:

- active/paused state;
- entry trigger;
- suppression/exclusion rules;
- re-entry;
- branch logic;
- waits/timing;
- template assignment per workflow step;
- exit/goal conditions;
- active-contact behavior.

Do not infer those semantics from contacts, lists, imports/exports, campaign objects or other Brevo resources.

## Authentication and secrets

The helper reads `BREVO_API_KEY` from the environment only.

Do not:

- pass API keys as CLI arguments;
- commit API keys;
- paste keys into chat or documentation;
- copy ATD's API key into a client environment.

For a client deployment, provision a client-owned Brevo API identity/secret in that client's isolated runtime or operator secret store.

## Usage

Basic single-contact check:

```bash
BREVO_API_KEY=... npm run brevo:evidence -- --contact qa@example.com
```

Check expected list membership and selected templates:

```bash
BREVO_API_KEY=... npm run brevo:evidence -- \
  --contact qa@example.com \
  --expected-list-ids 11,14 \
  --template-ids 58,59,60
```

Write the already-redacted report to a local file:

```bash
BREVO_API_KEY=... npm run brevo:evidence -- \
  --contact qa@example.com \
  --output ./brevo-evidence.json
```

The output file is created with mode `0600` where supported. Review it before committing anywhere.

Environment equivalents are available for controlled runners:

- `BREVO_EVIDENCE_CONTACT`
- `BREVO_EVIDENCE_EXPECTED_LIST_IDS`
- `BREVO_EVIDENCE_TEMPLATE_IDS`
- `BREVO_EVIDENCE_REQUIRED_ATTRIBUTES`

## Redaction contract

The report does not emit:

- the raw contact email;
- account email/user/organization IDs;
- sender email local-parts;
- raw webhook URLs;
- webhook bearer tokens;
- webhook custom-header values;
- provider error response bodies;
- CRM record IDs;
- transactional message IDs;
- free-text contact fields such as `MESSAGE`;
- template HTML bodies.

Stable SHA-256 fingerprints are used where identity comparison is useful without retaining the raw value.

Selected low-risk lifecycle fields may be emitted because they are needed for routing evidence, for example `SOURCE`, `LEAD_SOURCE`, `WEBSITE_ROUTE`, `OFFER`, `CONSENT_STATUS` and `OPT_IN`. `SOURCE_HISTORY` is presence-checked but its raw value is not emitted.

## Provider endpoints

As of 22 September 2026 the helper uses documented Brevo v3 GET surfaces for:

- `/account`
- `/contacts/{identifier}?identifierType=email_id`
- `/contacts/attributes`
- `/contacts/lists`
- `/smtp/templates`
- `/senders`
- `/webhooks?type=transactional|marketing|inbound`

Brevo's public API documentation confirms these read surfaces. The helper deliberately does not call send, create, update, delete, import, campaign activation or automation mutation endpoints.

## Evidence interpretation

A successful report proves only what its returned API fields prove at the report timestamp.

It does not prove:

- workflow graph configuration;
- workflow entry/exclusion/re-entry behavior;
- inbox rendering/deliverability;
- GA4/GTM/Meta event delivery;
- that a webhook receiver itself is healthy;
- that a template renders correctly;
- that a campaign should be activated or sent.

Where an API area is unavailable, the report keeps that area unavailable/unknown rather than converting missing evidence into a pass.

## ATD validation pattern

Recommended lifecycle QA sequence:

1. Choose a bounded QA contact that ATD is authorized to inspect.
2. Run the helper with the expected list IDs and relevant template IDs.
3. Review contact/list/attribute/suppression/template/sender/webhook evidence.
4. Treat any missing or contradictory evidence as a blocker or explicit unknown.
5. Review Brevo Automations in the UI read-only for every item under `MANUAL/UI EVIDENCE REQUIRED`.
6. Do not send email/SMS/WhatsApp, activate/pause workflows, register webhooks, or mutate CRM as an installation smoke test.
7. Store only the redacted report if evidence retention is needed.

## Client replication status

**Pilot.**

The helper is reusable internally now. Before calling it a client-ready packaged integration:

- use a client-specific API identity and isolated secrets;
- select a client-approved QA identity;
- define expected lists/attributes/templates for that client's lifecycle;
- verify the client account's plan/API availability;
- complete read-only QA first;
- document revocation/rotation and handoff;
- keep workflow UI evidence separate unless Brevo exposes authoritative workflow graph semantics through the client-approved API surface.

Do not copy ATD IDs, list IDs, template IDs, API keys, webhook URLs, QA identities or internal paths into a client deployment.


## GitHub Actions read-only evidence runner

The protected runner lives at:

`.github/workflows/brevo-readonly-evidence.yml`

It is intended only for bounded live read-only evidence collection after the helper itself has passed repository QA.

### Required GitHub Environment

Create or maintain a GitHub Environment named exactly:

`Brevo Read-Only QA`

Configure it as a protected evidence environment, not as a general Brevo administration environment.

Recommended controls:

- allow deployments from `main` only;
- require an ATD reviewer before the job receives environment secrets where the GitHub plan supports it;
- prevent self-review where an independent reviewer is available;
- do not place send/mutation-specific credentials or unrelated provider secrets in this environment.

### Required environment secrets

- `BREVO_API_KEY` — Brevo API credential used only by the GET-only helper.
- `BREVO_EVIDENCE_CONTACT` — one pre-existing QA contact ATD is authorized to inspect.

Do not store the raw QA contact in workflow source or dispatch inputs.

### Optional environment variables

- `BREVO_EVIDENCE_EXPECTED_LIST_IDS` — comma-separated expected list IDs.
- `BREVO_EVIDENCE_TEMPLATE_IDS` — comma-separated template IDs whose identity/status should be checked.
- `BREVO_EVIDENCE_REQUIRED_ATTRIBUTES` — comma-separated attribute names; omit to use the helper defaults.

These values are account-specific configuration and must not be treated as universal client defaults.

### Dispatch contract

Run the workflow manually from `main`.

Inputs:

- `git_sha` — the exact lowercase 40-character SHA selected for the `main` workflow dispatch;
- `reason` — a short operational reason for the bounded check.

The workflow fails before the provider read if:

- it is not dispatched from `main`;
- `git_sha` is malformed;
- `git_sha` differs from the SHA selected for the dispatch;
- the Brevo API secret is absent;
- the approved QA contact secret is absent.

### Live validation behavior

The runner:

1. checks out the exact approved SHA;
2. verifies the checked-out SHA;
3. re-runs the Brevo helper guardrail tests;
4. runs the existing `npm run brevo:evidence` helper;
5. validates that the report records GET-only behavior and zero writes/sends/workflow mutations;
6. requires the approved QA contact to be found;
7. requires configured expected list memberships to be present;
8. requires configured template IDs to be present when template checks are requested;
9. requires workflow graph semantics to remain `MANUAL/UI EVIDENCE REQUIRED`;
10. verifies that the raw QA contact and API key are absent from the retained report;
11. uploads only the redacted evidence directory for 14 days.

The workflow does not create contacts, edit lists, change templates, register webhooks, alter CRM records, send messages, activate workflows, publish campaigns or deploy the website.

### Evidence retention

The artifact contains:

- `brevo-evidence-redacted.json`;
- `run-metadata.json`.

The report is intentionally redacted but still contains internal configuration evidence such as list/template IDs or names where required for QA. Treat it as internal ATD evidence and do not publish it publicly.

### Client replication

For a client deployment, create a separate client environment with:

- a client-owned Brevo API credential;
- a client-approved QA identity;
- client-specific expected lists/templates/attributes;
- client-specific reviewers and revocation ownership.

Never reuse ATD's `Brevo Read-Only QA` environment or its secrets for a client.
