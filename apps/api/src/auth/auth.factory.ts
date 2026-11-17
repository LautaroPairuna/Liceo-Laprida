import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "../config/env.js";
import type { PrismaClient } from "../generated/prisma/client.js";

export function createAuth(prisma: PrismaClient) {
  return betterAuth({
    baseURL: env.PUBLIC_SITE_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.PUBLIC_SITE_URL],
    database: prismaAdapter(prisma, { provider: "mysql" }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 10,
    },
    rateLimit: { enabled: true },
    advanced: {
      ipAddress: { ipAddressHeaders: ["x-forwarded-for"], trustedProxies: env.TRUSTED_PROXIES },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
