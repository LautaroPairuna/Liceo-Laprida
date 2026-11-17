import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { PAYMENTS_QUEUE } from "../queues.js";
import { PaymentsService } from "./payments.service.js";

export type PaymentNotificationJob = { orderId: string };

@Processor(PAYMENTS_QUEUE)
export class PaymentsProcessor extends WorkerHost {
  constructor(private readonly payments: PaymentsService) {
    super();
  }

  process(job: Job<PaymentNotificationJob>) {
    return this.payments.applyOrder(job.data.orderId);
  }
}
