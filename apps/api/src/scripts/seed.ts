import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "../config/env.js";
import { toCourseRow, toEnrollmentRow, toSiteContentRows } from "../database/seed-data.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { seedData } from "../site/defaults.js";

const data = seedData();
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(env.DATABASE_URL) });

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

  if (env.NODE_ENV === "production") return;

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
