import { discountFor, priceFor } from "./pricing.js";

const course = { id: "excel-profesional", matricula: 30000, cuota: 45000, durationMonths: 3 };
const offers = {
  courses: [{ id: "excel-profesional", discount: 20 }],
  group: { value: "10% OFF" },
};

describe("discountFor", () => {
  it("applies the course offer only when the promo is requested", () => {
    expect(discountFor(course, offers, "oferta")).toBe(20);
    expect(discountFor(course, offers)).toBe(0);
  });

  it("gives no offer discount to a course without a promotion", () => {
    expect(discountFor({ ...course, id: "otro" }, offers, "oferta")).toBe(0);
  });

  it("reads the group discount from the visible value, 10 by default", () => {
    expect(discountFor(course, { group: { value: "15% OFF" } }, "grupo3")).toBe(15);
    expect(discountFor(course, {}, "grupo3")).toBe(10);
  });
});

describe("priceFor", () => {
  it("rounds the monthly fee to thousands and charges enrollment plus first month", () => {
    expect(priceFor(course, 20)).toEqual({
      discount: 20,
      monthly: 36000,
      initialPayment: 66000,
      total: 138000,
    });
  });
});
