import type { Course, SiteContent } from "./types";

export type Promo = "oferta" | "grupo3";

export function discountFor(course: Course, offers: SiteContent["offers"], promo?: Promo) {
  if (promo === "grupo3")
    return Number(String(offers?.group?.value ?? "").replace(/\D/g, "")) || 10;
  if (promo === "oferta") {
    return Number(offers?.courses?.find((item) => item.id === course.id)?.discount) || 0;
  }
  return 0;
}

export function priceFor(course: Course, discount: number) {
  const monthly = Math.round((course.cuota * (100 - discount)) / 100 / 1000) * 1000;
  return {
    discount,
    monthly,
    initialPayment: course.matricula + monthly,
    total: course.matricula + monthly * course.durationMonths,
  };
}
