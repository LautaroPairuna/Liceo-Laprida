import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx src/scripts/seed.ts",
  },
  datasource: {
    // `prisma generate` also runs on the web service build, where there is no database URL.
    url: process.env.DATABASE_URL ?? "",
  },
});
