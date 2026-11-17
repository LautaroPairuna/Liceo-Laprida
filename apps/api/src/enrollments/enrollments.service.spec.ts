import type { PrismaService } from "../database/prisma.service.js";
import { adminEnrollmentSchema } from "./enrollments.js";
import { EnrollmentsService } from "./enrollments.service.js";

const current = {
  id: "enr_1",
  courseId: "oratoria",
  courseTitle: "Oratoria",
  payment: "aprobado",
  updatedAt: new Date("2026-11-17T10:00:00.000Z"),
};

function setup() {
  const prisma = {
    enrollment: {
      findUnique: vi.fn().mockResolvedValue(current),
      update: vi.fn().mockResolvedValue({ ...current, createdAt: new Date(), name: "Ana" }),
    },
  };
  return { service: new EnrollmentsService(prisma as unknown as PrismaService), prisma };
}

const form = adminEnrollmentSchema.parse({
  name: "Ana",
  courseId: "oratoria",
  payment: "pendiente",
  expectedUpdatedAt: "2026-11-17T09:00:00.000Z",
});

describe("EnrollmentsService.update", () => {
  it("refuses to save a record that changed after the admin opened it", async () => {
    const { service, prisma } = setup();

    await expect(service.update("enr_1", form)).rejects.toThrow(/cambió/);
    expect(prisma.enrollment.update).not.toHaveBeenCalled();
  });

  it("saves when the record is unchanged, without storing the version marker", async () => {
    const { service, prisma } = setup();

    await service.update("enr_1", { ...form, expectedUpdatedAt: "2026-11-17T10:00:00.000Z" });

    const data = prisma.enrollment.update.mock.calls[0][0].data;
    expect(data.payment).toBe("pendiente");
    expect(data).not.toHaveProperty("expectedUpdatedAt");
  });
});
