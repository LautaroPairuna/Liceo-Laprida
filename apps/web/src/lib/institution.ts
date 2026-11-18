import type { Category, Contact, Course, Format, Hours } from "./types";

export const coords = { lat: -31.541431, lng: -68.524687 };

export type Modality = { id: Format; name: string; label: string; detail: string; tone: string };

export const modalities: Modality[] = [
  {
    id: "presencial",
    name: "Presenciales",
    label: "Presencial",
    detail: "Clases en el Liceo Profesional Laprida, San Juan.",
    tone: "#0a4f92",
  },
  {
    id: "hibrido",
    name: "Híbridos",
    label: "Híbrido",
    detail: "Material de estudio en el campus y clases en vivo por Zoom.",
    tone: "#12392a",
  },
  {
    id: "virtual",
    name: "Virtuales",
    label: "Virtual",
    detail: "Sin clases en vivo. Avanzás en tu propio tiempo.",
    tone: "#3b1654",
  },
];

export const modalityById = new Map(modalities.map((modality) => [modality.id, modality]));

export function isFormat(value: string | null | undefined): value is Format {
  return modalityById.has(value as Format);
}

export const intakes = [
  { id: "2026-11", label: "Noviembre 2026", date: "2026-11-16" },
  { id: "2027-02", label: "Febrero 2027", date: "2027-02-09" },
  { id: "2027-03", label: "Marzo 2027", date: "2027-03-08" },
  { id: "2027-04", label: "Abril 2027", date: "2027-04-12" },
];

const digitalAccents: Record<string, string> = {
  educacion: "#7c649e",
  administrativa: "#3e7560",
  salud: "#b15e66",
  tecnica: "#2f5e4c",
  informatica: "#4e8a72",
  laboral: "#6a508c",
  mineria: "#8e4a52",
};

const catalogAccents: Record<Format, Record<string, string>> = {
  presencial: {
    educacion: "#1d4ed8",
    administrativa: "#0c4a6e",
    salud: "#0e7490",
    tecnica: "#1e3a8a",
    informatica: "#0284c7",
    laboral: "#155e75",
    mineria: "#082f5b",
  },
  hibrido: digitalAccents,
  virtual: digitalAccents,
};

export function accentFor(modalityId: Format, category: Category | undefined) {
  return (category && catalogAccents[modalityId][category.id]) || category?.color || "#1769a7";
}

function linearChannel(value: number) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function inkOn(hex: string | undefined) {
  if (!hex || hex[0] !== "#") return "#ffffff";
  const raw = hex.slice(1);
  const luminance =
    0.2126 * linearChannel(Number.parseInt(raw.slice(0, 2), 16)) +
    0.7152 * linearChannel(Number.parseInt(raw.slice(2, 4), 16)) +
    0.0722 * linearChannel(Number.parseInt(raw.slice(4, 6), 16));
  return 1.05 / (luminance + 0.05) >= 3.1 ? "#ffffff" : "#082f5b";
}

const intakeFormat = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatIntakeDate(iso: string | undefined) {
  if (!iso) return "A confirmar";
  return intakeFormat.format(new Date(`${iso}T12:00:00-03:00`)).replaceAll(".", "");
}

const moneyFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatMoney = (value: number) => moneyFormat.format(value);

export const courseFormats = (course: Course | undefined): Format[] =>
  course?.formats?.length ? course.formats : ["presencial"];

export function hourLabel(open: string | null, close: string | null) {
  if (!open || !close) return "Cerrado";
  const trim = (value: string) => value.replace(/^0/, "");
  return `${trim(open)} a ${trim(close)}`;
}

export function weekSchedule(hours: Hours[]) {
  const byDay = new Map(hours.map((item) => [item.day, item]));
  const weekdayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const weekdays = weekdayNames.map((day) => byDay.get(day));
  const sameWeek = weekdays.every(
    (item) => item?.open === weekdays[0]?.open && item?.close === weekdays[0]?.close,
  );
  const saturday = byDay.get("Sábado");
  const sunday = byDay.get("Domingo");
  return [
    ...(sameWeek
      ? [
          {
            label: "Lunes a viernes",
            value: hourLabel(weekdays[0]?.open ?? null, weekdays[0]?.close ?? null),
          },
        ]
      : weekdayNames.map((day) => {
          const item = byDay.get(day);
          return { label: day, value: hourLabel(item?.open ?? null, item?.close ?? null) };
        })),
    { label: "Sábados", value: hourLabel(saturday?.open ?? null, saturday?.close ?? null) },
    { label: "Domingos", value: hourLabel(sunday?.open ?? null, sunday?.close ?? null) },
  ];
}

export function houseName(modality: Format) {
  return modality === "presencial" ? "Liceo Laprida" : "Red Cima";
}

export type Place = Contact;
