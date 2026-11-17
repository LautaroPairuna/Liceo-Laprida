import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PlatformModule } from "../platform/platform.module.js";
import { PAYMENTS_QUEUE, retryingJob } from "../queues.js";
import { SiteModule } from "../site/site.module.js";
import { CheckoutController } from "./checkout.controller.js";
import { CheckoutService } from "./checkout.service.js";
import { MercadoPagoGateway } from "./mercadopago.gateway.js";
import { PAYMENT_GATEWAY } from "./payment-gateway.js";
import { PaymentsProcessor } from "./payments.processor.js";
import { PaymentsService } from "./payments.service.js";
import { WebhookController } from "./webhook.controller.js";

@Module({
  imports: [
    BullModule.registerQueue({ name: PAYMENTS_QUEUE, defaultJobOptions: retryingJob }),
    PlatformModule,
    SiteModule,
  ],
  controllers: [CheckoutController, WebhookController],
  providers: [
    { provide: PAYMENT_GATEWAY, useClass: MercadoPagoGateway },
    CheckoutService,
    PaymentsService,
    PaymentsProcessor,
  ],
})
export class PaymentsModule {}
