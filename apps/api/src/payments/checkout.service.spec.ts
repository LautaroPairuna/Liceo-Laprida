import type { PrismaService } from "../database/prisma.service.js";
import type { SiteService } from "../site/site.service.js";
import { CheckoutService } from "./checkout.service.js";
import type { PaymentGateway } from "./payment-gateway.js";

vi.mock("../config/env.js", () => ({ env: { PUBLIC_SITE_URL: "https://sitio.test" } }));

const course = {
  id: "oratoria",
  title: "Oratoria",
  formats: ["presencial"],
  matricula: 30000,
  cuota: 45000,
  durationMonths: 3,
};

const input = {
  courseId: "oratoria",
  modality: "presencial" as const,
  name: "Ana Pérez",
  dni: "30111222",
  email: "ana@example.com",
  phone: "2645551234",
  shift: "Tarde" as const,
};

function setup(createCheckout: PaymentGateway["createCheckout"]) {
  const prisma = {
    enrollment: {
      create: vi.fn().mockResolvedValue({ id: "enr_1" }),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn().mockResolvedValue({
        name: "Ana Pérez",
        email: "ana@example.com",
        courseTitle: "Oratoria",
        code: "RL-111222",
        amount: 75000,
        payment: "aprobado",
      }),
    },
  };
  const site = {
    course: vi.fn().mockResolvedValue(course),
    content: vi.fn().mockResolvedValue({ offers: {} }),
  };
  const gateway = { configured: true, createCheckout, getOrder: vi.fn() };
  const service = new CheckoutService(
    prisma as unknown as PrismaService,
    site as unknown as SiteService,
    gateway as PaymentGateway,
  );
  return { service, prisma };
}

describe("CheckoutService.start", () => {
  it("charges the price computed on the server and stores the Mercado Pago order", async () => {
    const createCheckout = vi
      .fn()
      .mockResolvedValue({ orderId: "ORD01", checkoutUrl: "https://mp.test/pay" });
    const { service, prisma } = setup(createCheckout);

    const result = await service.start(input);

    expect(result).toEqual({ id: "enr_1", checkoutUrl: "https://mp.test/pay" });
    expect(createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: "enr_1",
        amount: 75000,
        returnUrl: "https://sitio.test/inscripcion/resultado?id=enr_1",
      }),
    );
    expect(prisma.enrollment.update).toHaveBeenCalledWith({
      where: { id: "enr_1" },
      data: { mpOrderId: "ORD01" },
    });
  });

  it("removes the enrollment when Mercado Pago cannot create the order", async () => {
    const { service, prisma } = setup(vi.fn().mockRejectedValue(new Error("MP caído")));

    await expect(service.start(input)).rejects.toThrow("MP caído");
    expect(prisma.enrollment.delete).toHaveBeenCalledWith({ where: { id: "enr_1" } });
    expect(prisma.enrollment.update).not.toHaveBeenCalled();
  });
});

describe("CheckoutService.status", () => {
  it("shows the buyer only what the result page needs, without the email", async () => {
    const { service } = setup(vi.fn());

    expect(await service.status("enr_1")).toEqual({
      firstName: "Ana",
      course: "Oratoria",
      code: "RL-111222",
      amount: 75000,
      payment: "aprobado",
    });
  });
});
