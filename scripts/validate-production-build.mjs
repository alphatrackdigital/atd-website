import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");
const requiredFiles = [
  ".htaccess",
  "2e4850dcf7044390ac2b2b430f5e1655.txt",
  "404.html",
  "index.html",
  "llms.txt",
  "robots.txt",
  "sitemap.xml",
];

const failures = [];

const requireFile = async (relativePath) => {
  try {
    await access(path.join(distDir, relativePath));
  } catch {
    failures.push(`Missing ${relativePath}`);
  }
};

await Promise.all(requiredFiles.map(requireFile));

try {
  const indexNowKey = await readFile(
    path.join(distDir, "2e4850dcf7044390ac2b2b430f5e1655.txt"),
    "utf8",
  );
  if (indexNowKey.trim() !== "2e4850dcf7044390ac2b2b430f5e1655") {
    failures.push("IndexNow verification file does not contain the expected key");
  }
} catch {
  // Already covered by the required-file check.
}

let sitemap = "";
try {
  sitemap = await readFile(path.join(distDir, "sitemap.xml"), "utf8");
} catch {
  // The missing-file failure above is more useful than a second read error.
}

const sitemapUrls = [...sitemap.matchAll(/<loc>(https:\/\/alphatrack\.digital(?:\/[^<]*)?)<\/loc>/g)].map(
  ([, url]) => new URL(url),
);

if (sitemapUrls.length === 0) {
  failures.push("Sitemap contains no canonical alphatrack.digital URLs");
}

for (const url of sitemapUrls) {
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const relativeHtml = pathname === "/" ? "index.html" : `${pathname.slice(1)}/index.html`;

  try {
    const html = await readFile(path.join(distDir, relativeHtml), "utf8");
    const canonicalTag = [...html.matchAll(/<link\b[^>]*>/g)]
      .map(([tag]) => tag)
      .find((tag) => /\brel="canonical"/.test(tag));
    const canonicalHref = canonicalTag?.match(/\bhref="([^"]+)"/)?.[1];
    let canonicalMatches = false;
    try {
      const canonicalUrl = new URL(canonicalHref);
      canonicalMatches = canonicalUrl.origin === "https://alphatrack.digital" && canonicalUrl.pathname === pathname;
    } catch {
      // Report the canonical failure below.
    }

    if (!canonicalMatches) {
      failures.push(`${relativeHtml} does not contain the expected production canonical for ${pathname}`);
    }
    if (!/<title\b[^>]*>[^<]+<\/title>/.test(html)) {
      failures.push(`${relativeHtml} has no non-empty title`);
    }
    const appMarker = "<!--app-html-start-->";
    const markerIndex = html.indexOf(appMarker);
    const rootIndex = html.indexOf('id="root"');
    if (rootIndex === -1 || markerIndex < rootIndex || html[markerIndex + appMarker.length] !== "<") {
      failures.push(`${relativeHtml} has an empty or whitespace-prefixed prerender boundary`);
    }
  } catch {
    failures.push(`Sitemap route ${pathname} is missing ${relativeHtml}`);
  }
}

try {
  const serverEntries = await readdir(path.join(distDir, "server"));
  failures.push(`SSR-only dist/server output was not removed (${serverEntries.length} entries)`);
} catch {
  // Expected: the prerender step removes the server-only bundle.
}

try {
  const notFound = await readFile(path.join(distDir, "404.html"), "utf8");
  const robotsTag = [...notFound.matchAll(/<meta\b[^>]*>/g)]
    .map(([tag]) => tag)
    .find((tag) => /\bname="robots"/.test(tag));
  if (!robotsTag || !/\bcontent="noindex, nofollow"/.test(robotsTag)) {
    failures.push("404.html is missing its noindex directive");
  }
} catch {
  // Already covered by the required-file check.
}

try {
  const assetsDir = path.join(distDir, "assets");
  const assetNames = await readdir(assetsDir);
  const sourceMapNames = assetNames.filter((name) => name.endsWith(".map"));
  if (sourceMapNames.length > 0) {
    failures.push(`Production assets include ${sourceMapNames.length} public source map(s)`);
  }
  const javascriptNames = assetNames.filter((name) => name.endsWith(".js"));
  const javascript = await Promise.all(
    javascriptNames.map((name) => readFile(path.join(assetsDir, name), "utf8")),
  );
  if (!javascript.some((source) => source.includes("https://alphatra-serv.netlify.app"))) {
    failures.push("Client assets do not contain the approved public form/API backend origin");
  }
} catch (error) {
  failures.push(`Could not verify the public form/API backend origin: ${error.message}`);
}

if (failures.length > 0) {
  console.error("Production build validation failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Production build validated: ${sitemapUrls.length} sitemap routes plus a static 404.`);
