import { splitName } from "./mercadopago.gateway.js";
import { orderOutcome } from "./order-outcome.js";

vi.mock("../config/env.js", () => ({ env: {} }));

const enrollment = { id: "enr_1", amount: 66000 };
const paid = {
  id: "ORD01",
  status: "processed",
  statusDetail: "accredited",
  reference: "enr_1",
  totalAmount: 66000,
  paidAmount: 66000,
};

describe("orderOutcome", () => {
  it("approves a processed, accredited order for the expected amount", () => {
    expect(orderOutcome(paid, enrollment)).toEqual({ payment: "aprobado" });
  });

  it("keeps it pending when the paid amount does not match", () => {
    const outcome = orderOutcome({ ...paid, paidAmount: 1000 }, enrollment);
    expect(outcome.payment).toBe("pendiente");
    expect(outcome.reason).toContain("1000");
  });

  it("never approves an order that belongs to another enrollment", () => {
    expect(orderOutcome({ ...paid, reference: "enr_2" }, enrollment).payment).toBe("pendiente");
  });

  it("marks failed, canceled and expired orders as rejected", () => {
    for (const status of ["failed", "canceled", "expired"]) {
      expect(orderOutcome({ ...paid, status }, enrollment).payment).toBe("rechazado");
    }
  });

  it("leaves orders still in process as pending", () => {
    expect(
      orderOutcome(
        { ...paid, status: "action_required", statusDetail: "waiting_payment" },
        enrollment,
      ),
    ).toEqual({ payment: "pendiente" });
  });
});

describe("splitName", () => {
  it("sends the first word as first name and the rest as last name", () => {
    expect(splitName("  María José  Pérez ")).toEqual({
      first_name: "María",
      last_name: "José Pérez",
    });
  });
});
