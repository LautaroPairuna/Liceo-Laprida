export const PAYMENT_GATEWAY = Symbol("PAYMENT_GATEWAY");

export type CheckoutRequest = {
  reference: string;
  amount: number;
  title: string;
  itemCode: string;
  payer: { email: string; name: string; dni: string };
  returnUrl: string;
};

export type GatewayOrder = {
  id: string;
  status: string;
  statusDetail: string;
  reference: string;
  totalAmount: number;
  paidAmount: number;
};

export interface PaymentGateway {
  readonly configured: boolean;
  createCheckout(request: CheckoutRequest): Promise<{ orderId: string; checkoutUrl: string }>;
  getOrder(id: string): Promise<GatewayOrder>;
}
