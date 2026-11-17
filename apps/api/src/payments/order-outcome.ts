import type { PaymentStatus } from "../generated/prisma/client.js";
import type { GatewayOrder } from "./payment-gateway.js";

const REJECTED = new Set([
  "failed",
  "canceled",
  "cancelled",
  "expired",
  "refunded",
  "charged_back",
]);

export type OrderOutcome = { payment: PaymentStatus; reason?: string };

export function orderOutcome(
  order: GatewayOrder,
  enrollment: { id: string; amount: number },
): OrderOutcome {
  if (order.reference !== enrollment.id) {
    return { payment: "pendiente", reason: "La order no corresponde a esta inscripción." };
  }
  if (REJECTED.has(order.status)) return { payment: "rechazado" };
  if (order.status !== "processed" || order.statusDetail !== "accredited") {
    return { payment: "pendiente" };
  }
  if (order.paidAmount !== enrollment.amount) {
    return {
      payment: "pendiente",
      reason: `Monto cobrado ${order.paidAmount} distinto del esperado ${enrollment.amount}.`,
    };
  }
  return { payment: "aprobado" };
}
