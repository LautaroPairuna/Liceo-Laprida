import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import { env } from "./config/env.js";
import { configureApp, createAdapter } from "./setup.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, createAdapter());
  configureApp(app);
  await app.listen(env.PORT, "0.0.0.0");
}
await bootstrap();
