import type { AccessStatus, Course, EnrollmentStatus, Format, PaymentStatus } from "./types";

export const FORMAT_LABEL: Record<Format, string> = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  virtual: "Virtual",
};

export const STATUS: { id: EnrollmentStatus; label: string }[] = [
  { id: "nuevo", label: "Nuevo" },
  { id: "contactado", label: "Contactado" },
  { id: "inscripto", label: "Inscripto" },
  { id: "baja", label: "Baja" },
];

export const PAYMENTS: { id: PaymentStatus; label: string }[] = [
  { id: "aprobado", label: "Aprobado" },
  { id: "sena", label: "Seña" },
  { id: "pendiente", label: "Pendiente" },
  { id: "rechazado", label: "Rechazado" },
];

export const ACCESS: { id: AccessStatus; label: string }[] = [
  { id: "no_solicitado", label: "Sin pedir" },
  { id: "pendiente", label: "Pendiente" },
  { id: "otorgado", label: "Otorgado" },
  { id: "fallido", label: "Falló" },
];

export const SOURCES: Record<string, string> = {
  ejemplo: "Ejemplo",
  web: "Web",
  equipo: "Equipo",
};

const dateFormat = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return dateFormat.format(date).replace(".", "");
}

export const statusLabel = (id: string) => STATUS.find((item) => item.id === id)?.label ?? id;
export const paymentLabel = (id: string) => PAYMENTS.find((item) => item.id === id)?.label ?? id;
export const accessLabel = (id: string) => ACCESS.find((item) => item.id === id)?.label ?? id;

export const courseFormatsOf = (course: Course | undefined): Format[] =>
  course?.formats?.length ? course.formats : ["presencial"];
