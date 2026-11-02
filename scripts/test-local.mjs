import { spawn } from "node:child_process";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import net from "node:net";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const root = process.cwd();
const bin =
  process.env.PG_BIN ||
  (process.platform === "win32"
    ? "C:/Program Files/PostgreSQL/16/bin"
    : "/usr/lib/postgresql/16/bin");
const executable = (name) =>
  path.join(bin, name + (process.platform === "win32" ? ".exe" : ""));
const runId = randomBytes(6).toString("hex");
const dataDir = path.resolve(root, ".test-data", "postgres-" + runId);
const logFile = path.resolve(root, ".test-data", "postgres-" + runId + ".log");
if (!dataDir.startsWith(path.resolve(root, ".test-data") + path.sep))
  throw new Error("Test database must stay inside the workspace.");
async function run(command, args, env = process.env, quiet = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      windowsHide: true,
      stdio: quiet ? "pipe" : "inherit",
    });
    let output = "";
    if (quiet) {
      child.stdout?.on("data", (chunk) => {
        output += chunk;
      });
      child.stderr?.on("data", (chunk) => {
        output += chunk;
      });
    }
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              `${path.basename(command)} exited ${code}. ${quiet ? output : ""}`,
            ),
          ),
    );
  });
}
const freePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
let started = false;
let db;
try {
  await access(executable("initdb"));
  await mkdir(path.dirname(dataDir), { recursive: true });
  const pgPort = await freePort();
  const appPort = await freePort();
  console.log(
    "Starting an isolated local PostgreSQL database. The configured portfolio database will not be changed.",
  );
  await run(
    executable("initdb"),
    [
      "-D",
      dataDir,
      "-U",
      "portfolio_test",
      "-A",
      "trust",
      "--encoding=UTF8",
      "--locale=C",
    ],
    process.env,
    true,
  );
  await run(
    executable("pg_ctl"),
    [
      "-D",
      dataDir,
      "-l",
      logFile,
      "-o",
      `-p ${pgPort} -h 127.0.0.1`,
      "-w",
      "start",
    ],
    process.env,
    true,
  );
  started = true;
  const baseUrl = `http://127.0.0.1:${appPort}`;
  const env = {
    ...process.env,
    DATABASE_URL: `postgresql://portfolio_test@127.0.0.1:${pgPort}/postgres`,
    NEXTAUTH_URL: baseUrl,
    NEXTAUTH_SECRET: randomBytes(32).toString("hex"),
    TEST_BASE_URL: baseUrl,
    TEST_ADMIN_EMAIL: "admin@portfolio.test",
    TEST_ADMIN_PASSWORD: randomBytes(24).toString("hex"),
    TEST_VIEWER_EMAIL: "viewer@portfolio.test",
    TEST_VIEWER_PASSWORD: randomBytes(24).toString("hex"),
  };
  await run(
    process.execPath,
    ["node_modules/prisma/build/index.js", "migrate", "deploy"],
    env,
  );
  const { PrismaClient } = require("@prisma/client");
  const bcrypt = require("bcrypt");
  db = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
  await db.user.create({
    data: {
      email: env.TEST_ADMIN_EMAIL,
      password: await bcrypt.hash(env.TEST_ADMIN_PASSWORD, 10),
      role: "ADMIN",
    },
  });
  await db.user.create({
    data: {
      email: env.TEST_VIEWER_EMAIL,
      password: await bcrypt.hash(env.TEST_VIEWER_PASSWORD, 10),
      role: "VIEWER",
    },
  });
  const technology = await db.technology.create({
    data: { name: "Python", category: "Machine Learning" },
  });
  await db.project.create({
    data: {
      title: "SKTM Eligibility Recommendation System",
      slug: "sktm-eligibility-recommendation-system",
      shortDescription:
        "A machine learning recommendation system for transparent SKTM eligibility assessment.",
      fullDescription:
        "A study in turning applicant data into useful recommendations, with preprocessing, model training, and interpretation.",
      category: "Machine Learning",
      projectType: "Academic Project",
      year: 2026,
      published: true,
      featured: true,
      problem: "Manual eligibility verification can be time consuming.",
      solution: "A classification system with interpretable results.",
      technologies: { create: { technologyId: technology.id } },
    },
  });
  await db.project.create({
    data: {
      title: "Clinic Management Mobile Application",
      slug: "clinic-management-mobile-application",
      shortDescription:
        "A mobile application supporting everyday clinic operations.",
      fullDescription:
        "A Flutter application for structured clinic management.",
      category: "Mobile Development",
      projectType: "Academic Project",
      year: 2025,
      published: true,
    },
  });
  await db.project.create({
    data: {
      title: "Private draft",
      slug: "private-draft",
      shortDescription: "Not published",
      fullDescription: "Private content",
      category: "Web Development",
      projectType: "Personal Project",
      year: 2026,
    },
  });
  await db.experience.create({
    data: {
      company: "Dinas Sosial Kota Medan",
      position: "Web Development Intern",
      location: "Medan, Indonesia",
      startDate: "Sep 2024",
      endDate: "Dec 2024",
      description:
        "Developed internal website features and supported debugging and optimization.",
    },
  });
  await db.certificate.create({
    data: {
      title: "Cloud Practitioner Essentials",
      issuer: "Dicoding Indonesia",
      year: "2024",
    },
  });
  await db.$disconnect();
  db = undefined;
  await run(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    env,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "Local tests failed.");
  process.exitCode = 1;
} finally {
  if (db) await db.$disconnect();
  if (started)
    await run(
      executable("pg_ctl"),
      ["-D", dataDir, "-m", "fast", "-w", "stop"],
      process.env,
      true,
    ).catch(() => {
      console.error(
        "Stop the temporary PostgreSQL instance using pg_ctl and the .test-data directory.",
      );
      process.exitCode = 1;
    });
}
