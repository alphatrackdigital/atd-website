#!/usr/bin/env node

import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const MANUAL_UI_EVIDENCE_REQUIRED = "MANUAL/UI EVIDENCE REQUIRED";
export const BREVO_API_BASE = "https://api.brevo.com/v3";

const DEFAULT_LIFECYCLE_ATTRIBUTES = [
  "SOURCE",
  "LEAD_SOURCE",
  "WEBSITE_ROUTE",
  "OFFER",
  "CONSENT_STATUS",
  "CONSENT_TIMESTAMP",
  "OPT_IN",
  "FIRST_SOURCE",
  "FIRST_LEAD_SOURCE",
  "FIRST_SOURCE_TIMESTAMP",
  "LAST_SOURCE",
  "LAST_LEAD_SOURCE",
  "LAST_SOURCE_TIMESTAMP",
  "SOURCE_HISTORY",
];

const SAFE_LIFECYCLE_VALUE_ATTRIBUTES = new Set([
  "SOURCE",
  "LEAD_SOURCE",
  "WEBSITE_ROUTE",
  "OFFER",
  "CONSENT_STATUS",
  "OPT_IN",
  "FIRST_SOURCE",
  "FIRST_LEAD_SOURCE",
  "LAST_SOURCE",
  "LAST_LEAD_SOURCE",
]);

const WORKFLOW_UI_CHECKS = [
  "workflow active/paused state",
  "entry trigger and source/list conditions",
  "suppression and exclusion rules",
  "re-entry policy",
  "branch/condition logic",
  "wait steps and timing",
  "template assignment per send step",
  "exit/goal conditions",
  "current active-contact handling",
];

const sha256 = (value) =>
  createHash("sha256").update(String(value ?? "")).digest("hex");

const normalizeCsvNumbers = (value) => {
  if (!value) return [];
  return [...new Set(
    String(value)
      .split(",")
      .map((item) => Number.parseInt(item.trim(), 10))
      .filter((item) => Number.isInteger(item) && item > 0),
  )];
};

const normalizeCsvStrings = (value) => {
  if (!value) return [];
  return [...new Set(
    String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )];
};

const redactEmail = (email) => {
  const normalized = String(email || "").trim().toLowerCase();
  const [, domain = "unknown"] = normalized.split("@");
  return {
    domain,
    fingerprint: sha256(normalized),
  };
};

const redactWebhookUrl = (value) => {
  try {
    const url = new URL(value);
    return {
      host: url.host,
      fingerprint: sha256(url.toString()),
    };
  } catch {
    return {
      host: "invalid-or-missing",
      fingerprint: sha256(value),
    };
  }
};

const endpointLabel = (label) => String(label || "Brevo read");

export async function brevoGet(path, {
  apiKey,
  fetchImpl = globalThis.fetch,
  label,
} = {}) {
  if (!apiKey) {
    throw new Error("Missing BREVO_API_KEY.");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required.");
  }
  if (typeof path !== "string" || !path.startsWith("/")) {
    throw new Error("Brevo read path must start with '/'.");
  }

  const url = new URL(`${BREVO_API_BASE}${path}`);
  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      label: endpointLabel(label),
      data: null,
    };
  }

  if (response.status === 204) {
    return {
      ok: true,
      status: response.status,
      label: endpointLabel(label),
      data: null,
    };
  }

  const data = await response.json().catch(() => null);
  return {
    ok: true,
    status: response.status,
    label: endpointLabel(label),
    data,
  };
}

async function fetchPaginated({
  path,
  arrayKey,
  apiKey,
  fetchImpl,
  label,
  pageSize = 50,
  maxPages = 10,
}) {
  const items = [];
  let expectedCount = null;
  const attempts = [];

  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * pageSize;
    const separator = path.includes("?") ? "&" : "?";
    const result = await brevoGet(
      `${path}${separator}limit=${pageSize}&offset=${offset}`,
      { apiKey, fetchImpl, label },
    );

    attempts.push({ status: result.status, ok: result.ok });
    if (!result.ok) {
      return {
        available: false,
        status: result.status,
        items,
        count: expectedCount,
        attempts,
      };
    }

    const pageItems = Array.isArray(result.data?.[arrayKey])
      ? result.data[arrayKey]
      : [];
    items.push(...pageItems);

    if (Number.isFinite(result.data?.count)) {
      expectedCount = Number(result.data.count);
    }

    if (
      pageItems.length < pageSize ||
      (expectedCount !== null && items.length >= expectedCount)
    ) {
      break;
    }
  }

  return {
    available: true,
    status: attempts.at(-1)?.status ?? 200,
    items,
    count: expectedCount ?? items.length,
    attempts,
  };
}

const summarizeAttributes = (schema, requiredAttributeNames) => {
  const byName = new Map(
    (Array.isArray(schema) ? schema : [])
      .filter((attribute) => attribute && attribute.name)
      .map((attribute) => [attribute.name, attribute]),
  );

  return Object.fromEntries(
    requiredAttributeNames.map((name) => {
      const attribute = byName.get(name);
      return [
        name,
        {
          exists: Boolean(attribute),
          type: attribute?.type ?? null,
          category: attribute?.category ?? null,
        },
      ];
    }),
  );
};

const summarizeLifecycleValues = (attributes) => {
  const result = {};
  if (!attributes || typeof attributes !== "object") return result;

  for (const name of SAFE_LIFECYCLE_VALUE_ATTRIBUTES) {
    if (Object.hasOwn(attributes, name)) {
      result[name] = attributes[name];
    }
  }
  return result;
};

const summarizeTemplates = (templates, templateIds) => {
  const wanted = new Set(templateIds);
  const selected = templateIds.length
    ? templates.filter((template) => wanted.has(Number(template.id)))
    : [];

  return {
    requestedIds: templateIds,
    matchedCount: selected.length,
    templates: selected.map((template) => ({
      id: Number(template.id),
      name: template.name ?? null,
      isActive: Boolean(template.isActive),
      modifiedAt: template.modifiedAt ?? null,
      sender: template.sender
        ? {
            name: template.sender.name ?? null,
            email: redactEmail(template.sender.email),
          }
        : null,
    })),
    missingIds: templateIds.filter(
      (id) => !selected.some((template) => Number(template.id) === id),
    ),
  };
};

const summarizeSenders = (senders) =>
  (Array.isArray(senders) ? senders : []).map((sender) => ({
    id: sender.id ?? null,
    name: sender.name ?? null,
    active: Boolean(sender.active),
    email: redactEmail(sender.email),
  }));

const summarizeWebhooks = (type, webhooks) =>
  (Array.isArray(webhooks) ? webhooks : []).map((webhook) => ({
    id: webhook.id ?? null,
    type: webhook.type ?? type,
    description: webhook.description ?? null,
    events: Array.isArray(webhook.events) ? webhook.events : [],
    endpoint: redactWebhookUrl(webhook.url),
    authType: webhook.auth?.type ?? null,
    hasAuth: Boolean(webhook.auth),
    headerKeys: Array.isArray(webhook.headers)
      ? webhook.headers
          .map((header) => header?.key)
          .filter(Boolean)
      : [],
    batched: webhook.batched ?? null,
    createdAt: webhook.createdAt ?? null,
    modifiedAt: webhook.modifiedAt ?? null,
  }));

const summarizeAccount = (account) => ({
  companyName: account?.companyName ?? null,
  enterprise: Boolean(account?.enterprise),
  planTypes: Array.isArray(account?.plan)
    ? account.plan.map((plan) => plan?.type).filter(Boolean)
    : [],
  organizationFingerprint: account?.organization_id
    ? sha256(account.organization_id)
    : null,
});

export async function collectBrevoLifecycleEvidence({
  apiKey,
  contactEmail,
  expectedListIds = [],
  templateIds = [],
  requiredAttributes = DEFAULT_LIFECYCLE_ATTRIBUTES,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
} = {}) {
  if (!contactEmail || !String(contactEmail).includes("@")) {
    throw new Error("Provide one contact email with --contact or BREVO_EVIDENCE_CONTACT.");
  }

  const checkedAt = now().toISOString();

  const accountResult = await brevoGet("/account", {
    apiKey,
    fetchImpl,
    label: "account",
  });
  if ([401, 403].includes(accountResult.status)) {
    throw new Error(`Brevo authentication failed with HTTP ${accountResult.status}.`);
  }

  const encodedEmail = encodeURIComponent(String(contactEmail).trim().toLowerCase());
  const contactResult = await brevoGet(
    `/contacts/${encodedEmail}?identifierType=email_id`,
    { apiKey, fetchImpl, label: "contact" },
  );

  const attributesResult = await brevoGet("/contacts/attributes", {
    apiKey,
    fetchImpl,
    label: "contact attributes",
  });

  const listsResult = await fetchPaginated({
    path: "/contacts/lists",
    arrayKey: "lists",
    apiKey,
    fetchImpl,
    label: "contact lists",
  });

  const templatesResult = await fetchPaginated({
    path: "/smtp/templates",
    arrayKey: "templates",
    apiKey,
    fetchImpl,
    label: "email templates",
  });

  const sendersResult = await brevoGet("/senders", {
    apiKey,
    fetchImpl,
    label: "senders",
  });

  const webhookTypes = ["transactional", "marketing", "inbound"];
  const webhookEvidence = {};
  for (const type of webhookTypes) {
    const result = await brevoGet(`/webhooks?type=${type}&sort=desc`, {
      apiKey,
      fetchImpl,
      label: `${type} webhooks`,
    });
    webhookEvidence[type] = {
      available: result.ok,
      status: result.status,
      webhooks: result.ok
        ? summarizeWebhooks(type, result.data?.webhooks)
        : [],
    };
  }

  const contact = contactResult.ok ? contactResult.data : null;
  const contactFound = contactResult.ok;
  const listCatalog = new Map(
    listsResult.items
      .filter((list) => Number.isInteger(Number(list?.id)))
      .map((list) => [Number(list.id), list]),
  );

  const contactListIds = Array.isArray(contact?.listIds)
    ? contact.listIds.map(Number).filter(Number.isInteger)
    : [];

  const listMembership = contactListIds.map((id) => ({
    id,
    name: listCatalog.get(id)?.name ?? null,
  }));

  const expectedMembership = expectedListIds.map((id) => ({
    id,
    name: listCatalog.get(id)?.name ?? null,
    member: contactListIds.includes(id),
  }));

  const lifecycleAttributes = summarizeLifecycleValues(contact?.attributes);
  const sourceHistoryPresent = Boolean(contact?.attributes?.SOURCE_HISTORY);

  return {
    schemaVersion: "1.0",
    checkedAt,
    verificationType: "Read-only Brevo lifecycle evidence",
    provider: "Brevo API v3",
    account: {
      available: accountResult.ok,
      status: accountResult.status,
      summary: accountResult.ok
        ? summarizeAccount(accountResult.data)
        : null,
    },
    contact: {
      available: contactFound,
      status: contactResult.status,
      identity: redactEmail(contactEmail),
      found: contactFound,
      listMembership,
      expectedMembership,
      suppression: contactFound
        ? {
            emailBlacklisted: Boolean(contact?.emailBlacklisted),
            smsBlacklisted: Boolean(contact?.smsBlacklisted),
            whatsappBlacklisted: Boolean(contact?.whatsappBlacklisted),
            listUnsubscribed: Array.isArray(contact?.listUnsubscribed)
              ? contact.listUnsubscribed
              : [],
            consentGroups: Array.isArray(contact?.consentGroups)
              ? contact.consentGroups.map((group) => ({
                  id: group?.id ?? null,
                  status: group?.status ?? null,
                }))
              : [],
          }
        : null,
      lifecycleValues: lifecycleAttributes,
      sourceHistoryPresent,
      lifecycleAttributePresence: Object.fromEntries(
        requiredAttributes.map((name) => [
          name,
          Boolean(contact?.attributes && Object.hasOwn(contact.attributes, name)),
        ]),
      ),
    },
    contactAttributeSchema: {
      available: attributesResult.ok,
      status: attributesResult.status,
      required: attributesResult.ok
        ? summarizeAttributes(attributesResult.data?.attributes, requiredAttributes)
        : Object.fromEntries(
            requiredAttributes.map((name) => [
              name,
              { exists: null, type: null, category: null },
            ]),
          ),
    },
    lists: {
      available: listsResult.available,
      status: listsResult.status,
      catalogCount: listsResult.count,
      checkedIds: [...new Set([...contactListIds, ...expectedListIds])],
    },
    templates: {
      available: templatesResult.available,
      status: templatesResult.status,
      catalogCount: templatesResult.count,
      ...summarizeTemplates(templatesResult.items, templateIds),
    },
    senders: {
      available: sendersResult.ok,
      status: sendersResult.status,
      senders: sendersResult.ok
        ? summarizeSenders(sendersResult.data?.senders)
        : [],
    },
    webhooks: webhookEvidence,
    workflowEvidence: {
      status: MANUAL_UI_EVIDENCE_REQUIRED,
      apiClaim: "No authoritative automation-workflow graph endpoint is used by this helper.",
      requiredUiChecks: WORKFLOW_UI_CHECKS,
      note: "Do not infer workflow state, triggers, exclusions, re-entry, branches, waits, activation, or active-contact behavior from contacts/lists/processes data.",
    },
    boundaries: {
      requestMethod: "GET only",
      writesAttempted: 0,
      sendsAttempted: 0,
      workflowMutationsAttempted: 0,
      analyticsBoundary: "GA4/GTM/Meta are outside this helper.",
      redaction: "Contact email, account IDs, sender local-parts, webhook URLs, webhook auth tokens/header values, provider response bodies on error, CRM IDs, and message IDs are not emitted.",
    },
  };
}

export function parseCliArgs(argv) {
  const args = {
    contactEmail: process.env.BREVO_EVIDENCE_CONTACT || "",
    expectedListIds: normalizeCsvNumbers(process.env.BREVO_EVIDENCE_EXPECTED_LIST_IDS),
    templateIds: normalizeCsvNumbers(process.env.BREVO_EVIDENCE_TEMPLATE_IDS),
    requiredAttributes: normalizeCsvStrings(process.env.BREVO_EVIDENCE_REQUIRED_ATTRIBUTES),
    output: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--contact") {
      args.contactEmail = next || "";
      index += 1;
    } else if (arg === "--expected-list-ids") {
      args.expectedListIds = normalizeCsvNumbers(next);
      index += 1;
    } else if (arg === "--template-ids") {
      args.templateIds = normalizeCsvNumbers(next);
      index += 1;
    } else if (arg === "--required-attributes") {
      args.requiredAttributes = normalizeCsvStrings(next);
      index += 1;
    } else if (arg === "--output") {
      args.output = next || "";
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.requiredAttributes.length) {
    args.requiredAttributes = DEFAULT_LIFECYCLE_ATTRIBUTES;
  }

  return args;
}

const usage = `Usage:
  BREVO_API_KEY=... node scripts/brevo-lifecycle-evidence.mjs --contact qa@example.com [options]

Options:
  --contact EMAIL               One contact to inspect. Raw email is never emitted.
  --expected-list-ids IDS       Comma-separated list IDs whose membership should be checked.
  --template-ids IDS            Comma-separated template IDs whose identity/status should be checked.
  --required-attributes NAMES   Comma-separated attribute names; defaults to ATD lifecycle attributes.
  --output PATH                 Write the redacted JSON report to PATH as well as stdout.
  -h, --help                    Show this help.

Safety:
  This helper contains no write/send/activate/delete path. Every Brevo request is GET-only.
  Automation workflow graph semantics are always reported as MANUAL/UI EVIDENCE REQUIRED.
`;

export async function main(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);
  if (args.help) {
    process.stdout.write(usage);
    return;
  }

  const report = await collectBrevoLifecycleEvidence({
    apiKey: process.env.BREVO_API_KEY,
    contactEmail: args.contactEmail,
    expectedListIds: args.expectedListIds,
    templateIds: args.templateIds,
    requiredAttributes: args.requiredAttributes,
  });

  const json = `${JSON.stringify(report, null, 2)}\n`;
  process.stdout.write(json);

  if (args.output) {
    await writeFile(args.output, json, { encoding: "utf8", mode: 0o600 });
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    process.stderr.write(`Brevo lifecycle evidence failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
