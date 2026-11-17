export type Promo = "oferta" | "grupo3";

export type OffersContent = {
  courses?: { id: string; discount?: number | string }[];
  group?: { value?: string };
};

export type PricedCourse = {
  id: string;
  matricula: number;
  cuota: number;
  durationMonths: number;
};

export function discountFor(
  course: PricedCourse,
  offers: OffersContent | undefined,
  promo?: Promo,
) {
  if (promo === "grupo3")
    return Number(String(offers?.group?.value ?? "").replace(/\D/g, "")) || 10;
  if (promo === "oferta") {
    const offer = offers?.courses?.find((item) => item.id === course.id);
    return Number(offer?.discount) || 0;
  }
  return 0;
}

export function priceFor(course: PricedCourse, discount: number) {
  const monthly = Math.round((course.cuota * (100 - discount)) / 100 / 1000) * 1000;
  return {
    discount,
    monthly,
    initialPayment: course.matricula + monthly,
    total: course.matricula + monthly * course.durationMonths,
  };
}
