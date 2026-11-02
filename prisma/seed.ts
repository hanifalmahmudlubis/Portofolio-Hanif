import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD before running db:seed. Existing data will not be removed.",
    );
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8 ||
    Buffer.byteLength(password) > 72
  )
    throw new Error(
      "Use a valid email and a password of at least 8 characters (maximum 72 bytes).",
    );
  await prisma.user.upsert({
    where: { email },
    create: { email, password: await bcrypt.hash(password, 12), role: "ADMIN" },
    update: { password: await bcrypt.hash(password, 12), role: "ADMIN" },
  });
  const technologies = [
    ["JavaScript", "Programming"],
    ["PHP", "Programming"],
    ["Python", "Machine Learning"],
    ["Laravel", "Framework"],
    ["Flutter", "Mobile"],
    ["Dart", "Mobile"],
    ["MySQL", "Database"],
    ["CatBoost", "Machine Learning"],
    ["Pandas", "Machine Learning"],
    ["SHAP", "Machine Learning"],
    ["Git", "Tools"],
    ["QGIS", "Tools"],
    ["n8n", "Automation"],
  ];
  for (const [name, category] of technologies) {
    if (
      !(await prisma.technology.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      }))
    )
      await prisma.technology.create({ data: { name, category } });
  }
  console.log(
    "Admin credentials saved securely and technologies initialized. Existing portfolio content is preserved.",
  );
}
main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
