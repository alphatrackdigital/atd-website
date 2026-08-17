import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distDir = path.resolve(process.cwd(), "dist");
const templatePath = path.join(distDir, "index.html");
const serverEntryPath = path.join(distDir, "server", "entry-server.js");
const noindexRoutes = [
  "/book-a-call/thank-you",
  "/contact-us/thank-you",
  "/newsletter/confirmed",
];

const replaceSection = (source, startMarker, endMarker, replacement) => {
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`Could not find markers ${startMarker} ... ${endMarker}`);
  }

  const before = source.slice(0, startIndex + startMarker.length);
  const after = source.slice(endIndex);

  return `${before}${replacement}${after}`;
};

const getSitemapPaths = async () => {
  const sitemap = await readFile(path.join(distDir, "sitemap.xml"), "utf8");
  return [...sitemap.matchAll(/<loc>https:\/\/alphatrack\.digital([^<]*)<\/loc>/g)].map(
    ([, pathname]) => pathname || "/",
  );
};

const prerender = async () => {
  const template = await readFile(templatePath, "utf8");
  const serverModule = await import(pathToFileURL(serverEntryPath).href);

  if (typeof serverModule.render !== "function") {
    throw new Error("The server entry must export a render(url) function.");
  }

  const routes = [...new Set([...(await getSitemapPaths()), ...noindexRoutes])];
  for (const route of routes) {
    const { html, head } = await serverModule.render(route);

    if (typeof html !== "string" || !html.trim()) {
      throw new Error(`Prerendered HTML was empty for ${route}.`);
    }

    const withHead = replaceSection(template, "<!--app-seo-start-->", "<!--app-seo-end-->", head.trim());
    const output = replaceSection(withHead, "<!--app-html-start-->", "<!--app-html-end-->", html.trim());
    const outputPath = route === "/" ? templatePath : path.join(distDir, route.slice(1), "index.html");

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, output, "utf8");
  }

  const { html: notFoundHtml, head: notFoundHead } = await serverModule.render("/__static-404__");
  const notFoundWithHead = replaceSection(
    template,
    "<!--app-seo-start-->",
    "<!--app-seo-end-->",
    notFoundHead.trim(),
  );
  const notFoundOutput = replaceSection(
    notFoundWithHead,
    "<!--app-html-start-->",
    "<!--app-html-end-->",
    notFoundHtml.trim(),
  );
  await writeFile(path.join(distDir, "404.html"), notFoundOutput, "utf8");

  await rm(path.join(distDir, "server"), { recursive: true, force: true });
};

await prerender();
