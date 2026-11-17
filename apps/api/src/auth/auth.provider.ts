import type { FactoryProvider, Type } from "@nestjs/common";
import type { PrismaClient } from "../generated/prisma/client.js";
import { createAuth } from "./auth.factory.js";

export const AUTH = Symbol("AUTH");

export function createAuthProvider(prisma: Type<PrismaClient>): FactoryProvider {
  return {
    provide: AUTH,
    inject: [prisma],
    useFactory: (client: PrismaClient) => createAuth(client),
  };
}
