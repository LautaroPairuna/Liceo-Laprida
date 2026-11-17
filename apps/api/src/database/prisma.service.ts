import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

export function poolUrl(databaseUrl: string, connectionLimit: number) {
  const url = new URL(databaseUrl);
  url.searchParams.set("connectionLimit", String(connectionLimit));
  return url.toString();
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaMariaDb(poolUrl(env.DATABASE_URL, env.DATABASE_POOL_MAX)),
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
