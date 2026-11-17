import { existsSync, mkdirSync } from "node:fs";
import { Logger, StandardSchemaValidationPipe } from "@nestjs/common";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import type { Auth } from "./auth/auth.factory.js";
import { AUTH } from "./auth/auth.provider.js";
import { registerAuthRoutes } from "./auth/auth.routes.js";
import { env } from "./config/env.js";
import { registerUploadPrecheck } from "./uploads/upload-precheck.js";

export function createAdapter() {
  return new FastifyAdapter({ trustProxy: true, bodyLimit: 1_000_000 });
}

function checkUploadsDir(logger: Logger) {
  // In production the folder is a bind mount: creating it here would hide a missing mount
  // and photos would be lost on the next deploy.
  if (!existsSync(env.UPLOADS_DIR) && env.NODE_ENV !== "production") {
    mkdirSync(env.UPLOADS_DIR, { recursive: true });
  }
  const mounted = existsSync(env.UPLOADS_DIR);
  const message = `[subidas] carpeta ${env.UPLOADS_DIR} montada: ${mounted}`;
  if (mounted) logger.log(message);
  else logger.error(message);
}

export function configureApp(app: NestFastifyApplication) {
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();

  const fastify = app.getHttpAdapter().getInstance();
  const auth = app.get<Auth>(AUTH);
  fastify.addContentTypeParser(
    ["image/jpeg", "image/png", "image/webp"],
    { parseAs: "buffer", bodyLimit: env.UPLOAD_MAX_BYTES },
    (_request, body, done) => done(null, body),
  );
  registerUploadPrecheck(fastify, auth, env.UPLOAD_MAX_BYTES);
  registerAuthRoutes(fastify, auth);
  checkUploadsDir(new Logger("Uploads"));
}
