import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PLATFORM_ACCESS_QUEUE, retryingJob } from "../queues.js";
import { EDUCATION_PLATFORM } from "./education-platform.js";
import { PendingEducationPlatform } from "./pending-education-platform.js";
import { PlatformAccessProcessor } from "./platform-access.processor.js";
import { PlatformAccessService } from "./platform-access.service.js";

@Module({
  imports: [
    BullModule.registerQueue({ name: PLATFORM_ACCESS_QUEUE, defaultJobOptions: retryingJob }),
  ],
  providers: [
    { provide: EDUCATION_PLATFORM, useClass: PendingEducationPlatform },
    PlatformAccessService,
    PlatformAccessProcessor,
  ],
  exports: [BullModule],
})
export class PlatformModule {}
