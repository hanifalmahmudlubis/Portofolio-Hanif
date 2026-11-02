import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const failures = [];
function check(valid, description) {
  console.log(`${valid ? "OK" : "MISSING"} ${description}`);
  if (!valid) failures.push(description);
}
function isUrl(value, protocols) {
  try {
    const url = new URL(value || "");
    return (
      protocols.includes(url.protocol) &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
check(process.versions.node.startsWith("22."), "Node.js 22");
check(
  manifest.scripts.build.includes("prisma generate"),
  "Prisma Client generated during build",
);
check(
  existsSync("prisma/migrations/migration_lock.toml"),
  "Prisma migrations included",
);
try {
  const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split(
    /\r?\n/,
  );
  check(
    !tracked.some(
      (name) => /^\.env(?:\.|$)/.test(name) && name !== ".env.example",
    ),
    "Environment secrets excluded from Git",
  );
} catch {
  console.log("SKIP Git index unavailable");
}

// --code-only can be used in CI without providing production credentials.
if (!process.argv.includes("--code-only")) {
  check(
    isUrl(process.env.DATABASE_URL, ["postgres:", "postgresql:"]),
    "DATABASE_URL points to hosted PostgreSQL",
  );
  check(
    isUrl(process.env.NEXTAUTH_URL, ["https:"]),
    "NEXTAUTH_URL is the HTTPS production domain",
  );
  check(
    (process.env.NEXTAUTH_SECRET || "").length >= 32,
    "NEXTAUTH_SECRET has at least 32 characters",
  );
  check(
    Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
    "BLOB_READ_WRITE_TOKEN configured for a Public Blob store",
  );
}
if (failures.length) {
  console.error(
    `Deployment configuration incomplete (${failures.length}). See README.md, Deploy ke Vercel. Secret values are never printed.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    "Configuration checks passed. Run npm run build; the database still needs deployed migrations.",
  );
}
