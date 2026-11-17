import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { PLATFORM_ACCESS_QUEUE } from "../queues.js";
import { PlatformAccessService } from "./platform-access.service.js";

export type PlatformAccessJob = { enrollmentId: string };

@Processor(PLATFORM_ACCESS_QUEUE)
export class PlatformAccessProcessor extends WorkerHost {
  private readonly logger = new Logger(PlatformAccessProcessor.name);

  constructor(private readonly access: PlatformAccessService) {
    super();
  }

  process(job: Job<PlatformAccessJob>) {
    return this.access.grant(job.data.enrollmentId);
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job<PlatformAccessJob> | undefined, error: Error) {
    if (!job || job.attemptsMade < (job.opts.attempts ?? 1)) return;
    this.logger.error(`[plataforma] alta fallida para ${job.data.enrollmentId}: ${error.message}`);
    await this.access.markFailed(job.data.enrollmentId, error.message);
  }
}
