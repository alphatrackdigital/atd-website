import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflowPath = ".github/workflows/brevo-readonly-evidence.yml";
const workflow = readFileSync(workflowPath, "utf8");

describe("Brevo read-only evidence workflow", () => {
  it("keeps the runner manual, main-only, exact-SHA bound, and read-permission only", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/^\s*push:/m);
    expect(workflow).not.toMatch(/^\s*pull_request:/m);
    expect(workflow).toContain("contents: read");
    expect(workflow).toContain("if: github.ref == 'refs/heads/main'");
    expect(workflow).toContain('DISPATCH_REF: ${{ github.ref }}');
    expect(workflow).toContain('DISPATCH_SHA: ${{ github.sha }}');
    expect(workflow).toContain('if [[ "$REQUESTED_SHA" != "$DISPATCH_SHA" ]]');
    expect(workflow).toContain('test "$ACTUAL_SHA" = "$REQUESTED_SHA"');
  });

  it("uses the protected Brevo evidence environment and scopes secrets to local steps", () => {
    expect(workflow).toContain("name: Brevo Read-Only QA");
    expect(workflow).toContain('BREVO_API_KEY: ${{ secrets.BREVO_API_KEY }}');
    expect(workflow).toContain(
      'BREVO_EVIDENCE_CONTACT: ${{ secrets.BREVO_EVIDENCE_CONTACT }}',
    );

    const jobHeader = workflow.slice(
      workflow.indexOf("jobs:"),
      workflow.indexOf("    steps:"),
    );

    expect(jobHeader).not.toContain("secrets.BREVO_API_KEY");
    expect(jobHeader).not.toContain("secrets.BREVO_EVIDENCE_CONTACT");

    const apiKeyAssignments =
      workflow.match(/^\s*BREVO_API_KEY:\s*.+$/gm) ?? [];
    const contactAssignments =
      workflow.match(/^\s*BREVO_EVIDENCE_CONTACT:\s*.+$/gm) ?? [];

    expect(apiKeyAssignments).toHaveLength(3);
    expect(contactAssignments).toHaveLength(3);
    expect(
      apiKeyAssignments.every((line) =>
        line.includes("${{ secrets.BREVO_API_KEY }}"),
      ),
    ).toBe(true);
    expect(
      contactAssignments.every((line) =>
        line.includes("${{ secrets.BREVO_EVIDENCE_CONTACT }}"),
      ),
    ).toBe(true);
  });

  it("runs only the existing evidence helper for live Brevo access", () => {
    expect(workflow).toContain("npm run brevo:evidence");
    expect(workflow).toContain(
      "npx vitest run src/test/brevo-lifecycle-evidence.test.ts",
    );

    expect(workflow).not.toMatch(/api\.brevo\.com/i);
    expect(workflow).not.toMatch(/\bcurl\b/i);
    expect(workflow).not.toMatch(/\b(wget|httpie)\b/i);
    expect(workflow).not.toMatch(/method:\s*["']?(POST|PUT|PATCH|DELETE)/i);
  });

  it("requires zero side effects and explicit manual workflow evidence", () => {
    expect(workflow).toContain(
      'report?.boundaries?.requestMethod !== "GET only"',
    );
    expect(workflow).toContain("report?.boundaries?.writesAttempted !== 0");
    expect(workflow).toContain("report?.boundaries?.sendsAttempted !== 0");
    expect(workflow).toContain(
      "report?.boundaries?.workflowMutationsAttempted !== 0",
    );
    expect(workflow).toContain(
      'report?.workflowEvidence?.status !== "MANUAL/UI EVIDENCE REQUIRED"',
    );
  });

  it("retains only redacted evidence for a bounded period", () => {
    expect(workflow).toContain("brevo-evidence-redacted.json");
    expect(workflow).toContain("run-metadata.json");
    expect(workflow).toContain("retention-days: 14");
    expect(workflow).toContain("serialized.includes(rawContact)");
    expect(workflow).toContain("JSON.stringify(report).includes(apiKey)");
  });
});
