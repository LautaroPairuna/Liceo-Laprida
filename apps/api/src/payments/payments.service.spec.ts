import type { PrismaService } from "../database/prisma.service.js";
import type { GatewayOrder, PaymentGateway } from "./payment-gateway.js";
import { PaymentsService } from "./payments.service.js";

vi.mock("../config/env.js", () => ({ env: {} }));

const order: GatewayOrder = {
  id: "ORD01",
  status: "processed",
  statusDetail: "accredited",
  reference: "enr_1",
  totalAmount: 66000,
  paidAmount: 66000,
};

function setup(enrollment: { id: string; amount: number; payment: string } | null, updated = 1) {
  const prisma = {
    enrollment: {
      findFirst: vi.fn().mockResolvedValue(enrollment),
      updateMany: vi.fn().mockResolvedValue({ count: updated }),
    },
  };
  const gateway = {
    configured: true,
    getOrder: vi.fn().mockResolvedValue(order),
    createCheckout: vi.fn(),
  };
  const queue = { add: vi.fn() };
  const service = new PaymentsService(
    prisma as unknown as PrismaService,
    gateway as PaymentGateway,
    queue as never,
  );
  return { service, prisma, queue };
}

describe("PaymentsService.applyOrder", () => {
  it("approves the enrollment and queues the platform access once", async () => {
    const { service, prisma, queue } = setup({ id: "enr_1", amount: 66000, payment: "pendiente" });

    await service.applyOrder("ORD01");

    expect(prisma.enrollment.updateMany).toHaveBeenCalledWith({
      where: { id: "enr_1", payment: { not: "aprobado" } },
      data: expect.objectContaining({
        payment: "aprobado",
        mpOrderId: "ORD01",
        access: "pendiente",
      }),
    });
    expect(queue.add).toHaveBeenCalledWith(
      "grant",
      { enrollmentId: "enr_1" },
      { jobId: "access-enr_1" },
    );
  });

  it("does nothing when the enrollment was already approved", async () => {
    const { service, prisma, queue } = setup({ id: "enr_1", amount: 66000, payment: "aprobado" });

    await service.applyOrder("ORD01");

    expect(prisma.enrollment.updateMany).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it("does not queue access when a concurrent job already approved it", async () => {
    const { service, queue } = setup({ id: "enr_1", amount: 66000, payment: "pendiente" }, 0);

    await service.applyOrder("ORD01");

    expect(queue.add).not.toHaveBeenCalled();
  });

  it("keeps the payment pending and queues nothing when the amount differs", async () => {
    const { service, prisma, queue } = setup({ id: "enr_1", amount: 99000, payment: "pendiente" });

    await service.applyOrder("ORD01");

    expect(prisma.enrollment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ payment: "pendiente" }) }),
    );
    expect(queue.add).not.toHaveBeenCalled();
  });

  it("ignores orders without a matching enrollment", async () => {
    const { service, prisma } = setup(null);

    await service.applyOrder("ORD01");

    expect(prisma.enrollment.updateMany).not.toHaveBeenCalled();
  });
});
