import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module.js";
import { env } from "./config/env.js";
import { DatabaseModule } from "./database/database.module.js";
import { EnrollmentsModule } from "./enrollments/enrollments.module.js";
import { HealthController } from "./health.controller.js";
import { PaymentsModule } from "./payments/payments.module.js";
import { SiteModule } from "./site/site.module.js";
import { UploadsController } from "./uploads/uploads.controller.js";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    BullModule.forRoot({
      connection: { url: env.REDIS_URL, maxRetriesPerRequest: null },
      prefix: "laprida",
    }),
    SiteModule,
    EnrollmentsModule,
    PaymentsModule,
  ],
  controllers: [HealthController, UploadsController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
