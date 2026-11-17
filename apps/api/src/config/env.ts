import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

for (const file of [resolve(process.cwd(), "../../.env"), resolve(process.cwd(), ".env")]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const optionalSecret = z
  .string()
  .optional()
  .transform((value) => value || undefined);

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.url(),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(5),
  REDIS_URL: z.url().default("redis://localhost:6379"),
  PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(32),
  UPLOADS_DIR: z.string().default("./uploads"),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(5_000_000),
  TRUSTED_PROXIES: z
    .string()
    .default("127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16")
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  MP_ACCESS_TOKEN: optionalSecret,
  MP_WEBHOOK_SECRET: optionalSecret,
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const env = parseEnv(process.env);
