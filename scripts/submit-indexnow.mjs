import { readFile } from "node:fs/promises";
import path from "node:path";

const siteOrigin = "https://alphatrack.digital";
const siteHost = new URL(siteOrigin).host;
const key = "2e4850dcf7044390ac2b2b430f5e1655";
const keyLocation = `${siteOrigin}/${key}.txt`;
const endpoint = "https://api.indexnow.org/indexnow";

const sitemap = await readFile(path.resolve(process.cwd(), "dist/sitemap.xml"), "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.trim());

if (urlList.length === 0) {
  throw new Error("The production sitemap contains no URLs to submit to IndexNow.");
}

const invalidUrl = urlList.find((url) => new URL(url).origin !== siteOrigin);
if (invalidUrl) {
  throw new Error(`Refusing to submit a non-canonical URL: ${invalidUrl}`);
}

const keyResponse = await fetch(keyLocation, {
  headers: { "user-agent": "AlphaTrack-Digital-IndexNow/1.0" },
  signal: AbortSignal.timeout(15_000),
});
const publishedKey = (await keyResponse.text()).trim();
if (!keyResponse.ok || publishedKey !== key) {
  throw new Error(`IndexNow key verification failed at ${keyLocation} (HTTP ${keyResponse.status}).`);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: siteHost, key, keyLocation, urlList }),
  signal: AbortSignal.timeout(30_000),
});

if (response.status !== 200 && response.status !== 202) {
  const responseBody = (await response.text()).trim();
  throw new Error(
    `IndexNow rejected the submission (HTTP ${response.status})${responseBody ? `: ${responseBody}` : "."}`,
  );
}

console.log(`IndexNow accepted ${urlList.length} URLs (HTTP ${response.status}).`);
