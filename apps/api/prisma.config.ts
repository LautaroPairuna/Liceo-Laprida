import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: resolve(process.cwd(), "../../.env"), quiet: true });
config({ path: resolve(process.cwd(), ".env"), quiet: true });

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
