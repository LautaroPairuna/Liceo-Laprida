import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { MercadoPagoConfig, Order } from "mercadopago";
import { env } from "../config/env.js";
import type { CheckoutRequest, GatewayOrder, PaymentGateway } from "./payment-gateway.js";

const money = (value: number) => value.toFixed(2);

export function splitName(fullName: string) {
  const [first = "", ...rest] = fullName.trim().split(/\s+/);
  return { first_name: first, last_name: rest.join(" ") };
}

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  private readonly orders = env.MP_ACCESS_TOKEN
    ? new Order(
        new MercadoPagoConfig({ accessToken: env.MP_ACCESS_TOKEN, options: { timeout: 8000 } }),
      )
    : undefined;

  get configured() {
    return Boolean(this.orders);
  }

  async createCheckout(request: CheckoutRequest) {
    const order = await this.client().create({
      body: {
        type: "online",
        processing_mode: "manual",
        capture_mode: "automatic",
        total_amount: money(request.amount),
        external_reference: request.reference,
        description: request.title,
        expiration_time: "P1D",
        payer: {
          email: request.payer.email,
          ...splitName(request.payer.name),
          identification: { type: "DNI", number: request.payer.dni },
        },
        config: {
          online: {
            success_url: request.returnUrl,
            failure_url: request.returnUrl,
            pending_url: request.returnUrl,
            auto_return: "approved",
          },
        },
        items: [
          {
            external_code: request.itemCode,
            title: request.title,
            quantity: 1,
            unit_price: money(request.amount),
          },
        ],
      },
      requestOptions: { idempotencyKey: request.reference },
    });
    if (!order.id || !order.checkout_url) {
      throw new ServiceUnavailableException("Mercado Pago no devolvió el enlace de pago.");
    }
    return { orderId: order.id, checkoutUrl: order.checkout_url };
  }

  async getOrder(id: string): Promise<GatewayOrder> {
    const order = await this.client().get({ id });
    return {
      id: order.id ?? id,
      status: order.status ?? "",
      statusDetail: order.status_detail ?? "",
      reference: order.external_reference ?? "",
      totalAmount: Number(order.total_amount ?? 0),
      paidAmount: Number(order.total_paid_amount ?? 0),
    };
  }

  private client() {
    if (!this.orders)
      throw new ServiceUnavailableException("Los pagos todavía no están configurados.");
    return this.orders;
  }
}
