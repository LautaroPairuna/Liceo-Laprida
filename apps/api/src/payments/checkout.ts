import { z } from "zod";
import { onlyDigits } from "../enrollments/enrollments.js";
import { FORMATS } from "../site/courses.js";

export const SHIFTS = ["Mañana", "Tarde", "Noche", "A confirmar"] as const;

export const checkoutSchema = z.object({
  courseId: z.string().trim().min(1).max(120),
  modality: z.enum(FORMATS),
  name: z.string().trim().min(3, "Escribí tu nombre y apellido.").max(200),
  dni: z
    .string()
    .transform(onlyDigits)
    .pipe(z.string().min(7, "Revisá el DNI.").max(9, "Revisá el DNI.")),
  email: z.email("Revisá el correo.").max(254),
  phone: z.string().trim().min(6, "Revisá el teléfono.").max(40),
  shift: z.enum(SHIFTS).default("A confirmar"),
  promo: z.enum(["oferta", "grupo3"]).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
