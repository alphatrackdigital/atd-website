import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, "dist");
const releaseDir = path.resolve(rootDir, "release");

const gitSha = (() => {
  try {
    return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
      cwd: rootDir,
      encoding: "utf8",
    }).trim();
  } catch {
    return "uncommitted";
  }
})();

const dirty = (() => {
  try {
    return execFileSync("git", ["status", "--porcelain"], {
      cwd: rootDir,
      encoding: "utf8",
    }).trim().length > 0;
  } catch {
    return true;
  }
})();

const requestedId = process.env.RELEASE_ID || `${gitSha}${dirty ? "-dirty" : ""}`;
if (!/^[A-Za-z0-9._-]+$/.test(requestedId)) {
  throw new Error("RELEASE_ID may contain only letters, numbers, dots, underscores, and hyphens.");
}

await mkdir(releaseDir, { recursive: true });

const archiveName = `atd-production-${requestedId}.tar.gz`;
const archivePath = path.join(releaseDir, archiveName);
const result = spawnSync("tar", ["-czf", archivePath, "-C", distDir, "."], {
  cwd: rootDir,
  encoding: "utf8",
});

if (result.status !== 0) {
  throw new Error(`Could not create ${archiveName}: ${result.stderr || result.stdout}`);
}

const archive = await readFile(archivePath);
const checksum = createHash("sha256").update(archive).digest("hex");
await writeFile(`${archivePath}.sha256`, `${checksum}  ${archiveName}\n`, "utf8");
await writeFile(
  path.join(releaseDir, `atd-production-${requestedId}.json`),
  `${JSON.stringify(
    {
      releaseId: requestedId,
      gitSha,
      dirty,
      archive: archiveName,
      sha256: checksum,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Created release/${archiveName}`);
console.log(`SHA-256 ${checksum}`);
