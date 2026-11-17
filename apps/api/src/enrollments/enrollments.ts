import { z } from "zod";
import type { Enrollment } from "../generated/prisma/client.js";
import { FORMATS } from "../site/courses.js";

export const STATUSES = ["nuevo", "contactado", "inscripto", "baja"] as const;
export const PAYMENTS = ["pendiente", "sena", "aprobado", "rechazado"] as const;
export const ACCESS = ["no_solicitado", "pendiente", "otorgado", "fallido"] as const;

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export function enrollmentCode(dni: string) {
  return `RL-${onlyDigits(dni).slice(-6).padStart(6, "0")}`;
}

export const adminEnrollmentSchema = z.object({
  name: z.string().trim().min(1, "La ficha necesita un nombre.").max(200),
  dni: z.string().trim().max(20).default("").transform(onlyDigits),
  email: z.union([z.literal(""), z.email().max(254)]).default(""),
  phone: z.string().trim().max(40).default(""),
  courseId: z.string().trim().min(1, "Elegí un curso.").max(120),
  modality: z.enum(FORMATS).default("presencial"),
  shift: z.string().trim().max(60).default("A confirmar"),
  status: z.enum(STATUSES).default("nuevo"),
  payment: z.enum(PAYMENTS).default("pendiente"),
  access: z.enum(ACCESS).default("no_solicitado"),
  amount: z.coerce
    .number()
    .catch(0)
    .transform((value) => Math.max(0, Math.round(value) || 0)),
  notes: z.string().max(5000).default(""),
});

export type AdminEnrollmentInput = z.infer<typeof adminEnrollmentSchema>;

export function toAdminEnrollment(row: Enrollment) {
  return {
    id: row.id,
    code: row.code,
    createdAt: row.createdAt.toISOString(),
    name: row.name,
    dni: row.dni,
    email: row.email,
    phone: row.phone,
    courseId: row.courseId ?? "",
    courseTitle: row.courseTitle,
    modality: row.modality,
    shift: row.shift,
    status: row.status,
    payment: row.payment,
    amount: row.amount,
    notes: row.notes,
    source: row.source,
    access: row.access,
    accessNote: row.accessNote ?? "",
    mpOrderId: row.mpOrderId ?? "",
    mpStatus: row.mpStatus ?? "",
    paidAt: row.paidAt?.toISOString() ?? null,
  };
}
