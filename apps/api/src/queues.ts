import type { DefaultJobOptions } from "bullmq";

export const PAYMENTS_QUEUE = "payments";
export const PLATFORM_ACCESS_QUEUE = "platform-access";

export const retryingJob: DefaultJobOptions = {
  attempts: 6,
  backoff: { type: "exponential", delay: 30_000 },
  removeOnComplete: { age: 7 * 24 * 3600 },
  removeOnFail: { age: 30 * 24 * 3600 },
};
