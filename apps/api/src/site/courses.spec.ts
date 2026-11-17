import type { Course } from "../generated/prisma/client.js";
import { courseInputSchema, toPublicCourse, uniqueSlug } from "./courses.js";

const row: Course = {
  id: "excel-profesional",
  title: "Excel Profesional",
  category: "informatica",
  durationMonths: 3,
  hours: 72,
  formats: ["virtual", "presencial"],
  ministry: false,
  practices: true,
  seats: 20,
  shift: "Tarde",
  matricula: 30000,
  cuota: 45000,
  requirements: ["DNI vigente"],
  start: new Date("2027-03-08T00:00:00.000Z"),
  image: "/class-team.webp",
  summary: "Resumen",
  description: "Descripción",
  outcomes: ["Uno"],
  modules: ["Módulo"],
  position: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("toPublicCourse", () => {
  it("returns the shape the site uses, with start as a date and the intake", () => {
    const course = toPublicCourse(row);

    expect(course.start).toBe("2027-03-08");
    expect(course.intakeId).toBe("2027-03");
    expect(course.modality).toBe("Virtual");
    expect(course.requirements).toEqual(["DNI vigente"]);
  });

  it("falls back to presencial when the stored formats are not valid", () => {
    expect(toPublicCourse({ ...row, formats: "roto" }).formats).toEqual(["presencial"]);
  });
});

describe("courseInputSchema", () => {
  it("normalizes a draft the way the legacy admin did", () => {
    const parsed = courseInputSchema.parse({
      title: "  Oratoria ",
      formats: ["virtual", "presencial"],
      durationMonths: "2.6",
      seats: "0",
      matricula: "-5",
      requirements: "DNI\n\n Foto ",
      image: "",
    });

    expect(parsed).toMatchObject({
      title: "Oratoria",
      formats: ["presencial", "virtual"],
      durationMonths: 3,
      seats: 1,
      matricula: 0,
      requirements: ["DNI", "Foto"],
      image: "/class-team.webp",
      shift: "Tarde",
      start: "2027-03-08",
    });
  });

  it("rejects a course without name or modality", () => {
    expect(courseInputSchema.safeParse({ title: "", formats: ["presencial"] }).success).toBe(false);
    expect(courseInputSchema.safeParse({ title: "Curso", formats: [] }).success).toBe(false);
  });
});

describe("uniqueSlug", () => {
  it("builds a slug without accents and avoids taken ids", () => {
    expect(uniqueSlug("Técnico en Refrigeración", new Set())).toBe("tecnico-en-refrigeracion");
    expect(uniqueSlug("Oratoria", new Set(["oratoria", "oratoria-2"]))).toBe("oratoria-3");
  });
});
