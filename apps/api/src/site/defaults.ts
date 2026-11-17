import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SeedData } from "../database/seed-data.js";

let cached: SeedData | undefined;

export function seedData(): SeedData {
  cached ??= JSON.parse(
    readFileSync(join(import.meta.dirname, "..", "..", "prisma", "seed-data.json"), "utf8"),
  ) as SeedData;
  return cached;
}
