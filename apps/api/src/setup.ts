import { existsSync } from "node:fs";
import { Logger, StandardSchemaValidationPipe } from "@nestjs/common";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import type { Auth } from "./auth/auth.factory.js";
import { AUTH } from "./auth/auth.provider.js";
import { registerAuthRoutes } from "./auth/auth.routes.js";
import { env } from "./config/env.js";

export function createAdapter() {
  return new FastifyAdapter({ trustProxy: true, bodyLimit: 1_000_000 });
}

export function configureApp(app: NestFastifyApplication) {
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();

  const fastify = app.getHttpAdapter().getInstance();
  fastify.addContentTypeParser(
    ["image/jpeg", "image/png", "image/webp"],
    { parseAs: "buffer", bodyLimit: env.UPLOAD_MAX_BYTES },
    (_request, body, done) => done(null, body),
  );
  registerAuthRoutes(fastify, app.get<Auth>(AUTH));

  new Logger("Uploads").log(
    `[subidas] carpeta ${env.UPLOADS_DIR} montada: ${existsSync(env.UPLOADS_DIR)}`,
  );
}
