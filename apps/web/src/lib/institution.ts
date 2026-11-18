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

const DARK_INK = "#082f5b";
const DARK_INK_LUMINANCE = 0.0262;
const MIN_TEXT_CONTRAST = 4.5;

function parseHex(hex: string | undefined) {
  const short = hex?.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  const full = short
    ? `#${short
        .slice(1)
        .map((digit) => digit + digit)
        .join("")}`
    : hex;
  if (!full || !/^#[0-9a-f]{6}$/i.test(full)) return null;
  return [1, 3, 5].map((start) => Number.parseInt(full.slice(start, start + 2), 16));
}

function luminanceOf([r, g, b]: number[]) {
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b);
}

function bestInk(rgb: number[]) {
  const luminance = luminanceOf(rgb);
  const onWhite = 1.05 / (luminance + 0.05);
  const onDark = (luminance + 0.05) / (DARK_INK_LUMINANCE + 0.05);
  return onWhite >= onDark
    ? { ink: "#ffffff", contrast: onWhite }
    : { ink: DARK_INK, contrast: onDark };
}

export function inkOn(hex: string | undefined) {
  const rgb = parseHex(hex);
  return rgb ? bestInk(rgb).ink : "#ffffff";
}

// Category colours come from the admin, so they can be too light or mid-tone for small text.
// Darken just enough for one of the two inks to reach WCAG AA.
export function accentStyle(hex: string | undefined) {
  let rgb = parseHex(hex);
  if (!rgb) return { "--accent": hex, "--ink": "#ffffff" };
  let best = bestInk(rgb);
  for (let step = 0; step < 20 && best.contrast < MIN_TEXT_CONTRAST; step++) {
    rgb = rgb.map((channel) => Math.round(channel * 0.94));
    best = bestInk(rgb);
  }
  const accent = `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  return { "--accent": accent, "--ink": best.ink };
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
