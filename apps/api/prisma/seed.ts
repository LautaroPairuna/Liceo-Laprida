import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  type SeedData,
  toCourseRow,
  toEnrollmentRow,
  toSiteContentRows,
} from "../src/database/seed-data.js";
import { PrismaClient } from "../src/generated/prisma/client.js";

const data: SeedData = JSON.parse(
  readFileSync(new URL("./seed-data.json", import.meta.url), "utf8"),
);

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL ?? ""),
});

async function main() {
  const content = await prisma.siteContent.createMany({
    data: toSiteContentRows(data.content),
    skipDuplicates: true,
  });
  const courses = await prisma.course.createMany({
    data: data.courses.map(toCourseRow),
    skipDuplicates: true,
  });
  console.log(`[seed] contenido: ${content.count}, cursos: ${courses.count}`);

  if (process.env.NODE_ENV === "production") return;

  const titles = new Map(data.courses.map((course) => [course.id, course.title]));
  const enrollments = await prisma.enrollment.createMany({
    data: data.enrollments.map((enrollment) => toEnrollmentRow(enrollment, titles)),
    skipDuplicates: true,
  });
  console.log(`[seed] inscripciones de ejemplo: ${enrollments.count}`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
