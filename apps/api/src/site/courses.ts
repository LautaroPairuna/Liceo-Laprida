import { z } from "zod";
import type { Course, Prisma } from "../generated/prisma/client.js";

export const FORMATS = ["presencial", "hibrido", "virtual"] as const;
export type Format = (typeof FORMATS)[number];

const MODALITY_LABEL: Record<Format, string> = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  virtual: "Virtual",
};

const stringList = z.array(z.string());
const formatList = z.array(z.enum(FORMATS));

export type PublicCourse = {
  id: string;
  title: string;
  category: string;
  durationMonths: number;
  hours: number;
  formats: Format[];
  modality: string;
  ministry: boolean;
  practices: boolean;
  seats: number;
  shift: string;
  matricula: number;
  cuota: number;
  requirements: string[];
  start: string;
  intakeId: string;
  image: string;
  summary: string;
  description: string;
  outcomes: string[];
  modules: string[];
};

export function toPublicCourse(course: Course): PublicCourse {
  const start = course.start.toISOString().slice(0, 10);
  const formats = formatList.catch(["presencial"]).parse(course.formats);
  return {
    id: course.id,
    title: course.title,
    category: course.category,
    durationMonths: course.durationMonths,
    hours: course.hours,
    formats: formats.length ? formats : ["presencial"],
    modality: MODALITY_LABEL[formats[0] ?? "presencial"],
    ministry: course.ministry,
    practices: course.practices,
    seats: course.seats,
    shift: course.shift,
    matricula: course.matricula,
    cuota: course.cuota,
    requirements: stringList.catch([]).parse(course.requirements),
    start,
    intakeId: start.slice(0, 7),
    image: course.image,
    summary: course.summary,
    description: course.description,
    outcomes: stringList.catch([]).parse(course.outcomes),
    modules: stringList.catch([]).parse(course.modules),
  };
}

const lines = z
  .union([z.array(z.string()), z.string()])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split("\n")).map((item) => item.trim()).filter(Boolean),
  );

const wholeNumber = (min: number) =>
  z.coerce
    .number()
    .catch(min)
    .transform((value) => Math.max(min, Math.round(value) || min));

export const courseInputSchema = z.object({
  title: z.string().trim().min(1, "El curso necesita un nombre.").max(200),
  category: z.string().trim().min(1).max(60).default("educacion"),
  durationMonths: wholeNumber(1),
  hours: wholeNumber(1),
  formats: z
    .array(z.enum(FORMATS))
    .min(1, "Elegí al menos una modalidad.")
    .transform((value) => FORMATS.filter((id) => value.includes(id))),
  ministry: z.boolean().default(false),
  practices: z.boolean().default(false),
  seats: wholeNumber(1),
  shift: z
    .string()
    .trim()
    .max(60)
    .default("Tarde")
    .transform((value) => value || "Tarde"),
  matricula: wholeNumber(0),
  cuota: wholeNumber(0),
  requirements: lines.default([]),
  start: z.iso.date().default("2027-03-08"),
  image: z
    .string()
    .trim()
    .max(500)
    .default("")
    .transform((value) => value || "/class-team.webp"),
  summary: z.string().trim().max(2000).default(""),
  description: z.string().trim().max(10000).default(""),
  outcomes: lines.default([]),
  modules: lines.default([]),
});

export type CourseInput = z.infer<typeof courseInputSchema>;

export function toCourseData(input: CourseInput): Omit<Prisma.CourseCreateInput, "id"> {
  return { ...input, start: new Date(`${input.start}T00:00:00.000Z`) };
}

export function slugify(text: string) {
  const base = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  return base || "curso";
}

export function uniqueSlug(title: string, taken: Set<string>) {
  const base = slugify(title);
  if (!taken.has(base)) return base;
  let count = 2;
  while (taken.has(`${base}-${count}`)) count += 1;
  return `${base}-${count}`;
}
