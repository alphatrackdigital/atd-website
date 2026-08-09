const baseUrl = new URL(process.argv[2] || "https://alphatrack.digital");
const attempts = Number.parseInt(process.env.SMOKE_ATTEMPTS || "6", 10);
const delayMs = Number.parseInt(process.env.SMOKE_DELAY_MS || "5000", 10);

const checks = [
  { path: "/", status: 200, pattern: /<title\b[^>]*>/ },
  { path: "/offer/tracking-audit", status: 200, pattern: /Tracking Audit/i },
  { path: "/privacy-policy", status: 200, pattern: /Privacy Policy/i },
  { path: "/cookie-policy", status: 200, pattern: /Cookie Policy/i },
  { path: "/terms-of-service", status: 200, pattern: /Terms of Service/i },
  { path: "/sitemap.xml", status: 200, pattern: /https:\/\/alphatrack\.digital\// },
  { path: "/__atd_release_missing_route__", status: 404, pattern: /Page Not Found/i },
];

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const runChecks = async () => {
  const failures = [];
  for (const check of checks) {
    const url = new URL(check.path, baseUrl);
    url.searchParams.set("release_smoke", Date.now().toString());

    try {
      const response = await fetch(url, {
        headers: { "cache-control": "no-cache", "user-agent": "ATD-Release-Smoke/1.0" },
        redirect: "follow",
      });
      const body = await response.text();
      if (response.status !== check.status) {
        failures.push(`${check.path}: expected ${check.status}, received ${response.status}`);
      } else if (!check.pattern.test(body)) {
        failures.push(`${check.path}: response did not match ${check.pattern}`);
      }
    } catch (error) {
      failures.push(`${check.path}: ${error.message}`);
    }
  }
  return failures;
};

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const failures = await runChecks();
  if (failures.length === 0) {
    console.log(`Production smoke passed for ${baseUrl.origin}.`);
    process.exit(0);
  }

  console.error(`Smoke attempt ${attempt}/${attempts} failed:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  if (attempt < attempts) await wait(delayMs);
}

process.exit(1);
