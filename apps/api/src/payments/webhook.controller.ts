import { InjectQueue } from "@nestjs/bullmq";
import {
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Query,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Queue } from "bullmq";
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { env } from "../config/env.js";
import { PAYMENTS_QUEUE } from "../queues.js";
import type { PaymentNotificationJob } from "./payments.processor.js";

@SkipThrottle()
@Controller("webhooks/mercadopago")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(@InjectQueue(PAYMENTS_QUEUE) private readonly queue: Queue<PaymentNotificationJob>) {}

  @Post()
  @HttpCode(200)
  async receive(
    @Query("data.id") dataId: string | undefined,
    @Query("type") type: string | undefined,
    @Headers("x-signature") signature: string | undefined,
    @Headers("x-request-id") requestId: string | undefined,
  ) {
    if (!env.MP_WEBHOOK_SECRET) throw new ServiceUnavailableException();
    try {
      WebhookSignatureValidator.validate({
        xSignature: signature,
        xRequestId: requestId,
        dataId,
        secret: env.MP_WEBHOOK_SECRET,
        toleranceSeconds: 300,
      });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        this.logger.warn(`[pagos] firma de webhook inválida (${error.reason})`);
        throw new UnauthorizedException();
      }
      throw error;
    }

    if (type === "order" && dataId) {
      await this.queue.add(
        "order",
        { orderId: dataId },
        { jobId: `order-${dataId}-${requestId ?? "sin-id"}` },
      );
    }
    return { received: true };
  }
}
