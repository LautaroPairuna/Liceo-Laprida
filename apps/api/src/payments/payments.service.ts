import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Queue } from "bullmq";
import { PrismaService } from "../database/prisma.service.js";
import type { PlatformAccessJob } from "../platform/platform-access.processor.js";
import { PLATFORM_ACCESS_QUEUE } from "../queues.js";
import { orderOutcome } from "./order-outcome.js";
import { PAYMENT_GATEWAY, type PaymentGateway } from "./payment-gateway.js";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    @InjectQueue(PLATFORM_ACCESS_QUEUE) private readonly accessQueue: Queue<PlatformAccessJob>,
  ) {}

  async applyOrder(orderId: string) {
    const order = await this.gateway.getOrder(orderId);
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { OR: [{ mpOrderId: order.id }, { id: order.reference }] },
    });
    if (!enrollment) {
      this.logger.warn(`[pagos] order ${order.id} sin inscripción (ref ${order.reference})`);
      return;
    }
    const outcome = orderOutcome(order, enrollment);

    if (enrollment.payment === "aprobado") {
      if (outcome.payment !== "rechazado") return;
      this.logger.warn(`[pagos] ${enrollment.id}: pago aprobado revertido (${order.status})`);
      await this.prisma.enrollment.updateMany({
        where: { id: enrollment.id, payment: "aprobado" },
        data: {
          payment: "rechazado",
          mpStatus: `${order.status}/${order.statusDetail}`.slice(0, 40),
        },
      });
      return;
    }

    if (outcome.reason) this.logger.warn(`[pagos] ${enrollment.id}: ${outcome.reason}`);

    const approved = outcome.payment === "aprobado";
    const { count } = await this.prisma.enrollment.updateMany({
      where: { id: enrollment.id, payment: { not: "aprobado" } },
      data: {
        payment: outcome.payment,
        mpOrderId: order.id,
        mpStatus: `${order.status}/${order.statusDetail}`.slice(0, 40),
        ...(approved ? { paidAt: new Date(), access: "pendiente" as const } : {}),
      },
    });

    if (approved && count) {
      await this.accessQueue.add(
        "grant",
        { enrollmentId: enrollment.id },
        { jobId: `access-${enrollment.id}` },
      );
    }
  }
}
