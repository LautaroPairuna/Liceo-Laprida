import { toCourseRow, toEnrollmentRow, toSiteContentRows } from "./seed-data.js";

const legacyCourse = {
  modality: "Presencial",
  formats: ["presencial", "virtual"],
  ministry: true,
  practices: false,
  seats: 20,
  shift: "Tarde",
  requirements: ["DNI vigente"],
  start: "2027-03-08",
  intakeId: "2027-03",
  id: "secretariado-escolar",
  title: "Secretariado Escolar",
  category: "educacion",
  durationMonths: 6,
  hours: 144,
  matricula: 34000,
  cuota: 48000,
  image: "/class-team.webp",
  summary: "Resumen",
  description: "Descripción",
  outcomes: ["Uno"],
  modules: ["Módulo"],
};

describe("toCourseRow", () => {
  it("keeps stored fields, parses the start date and drops derived ones", () => {
    const row = toCourseRow(legacyCourse, 3);

    expect(row).toEqual({
      id: "secretariado-escolar",
      title: "Secretariado Escolar",
      category: "educacion",
      durationMonths: 6,
      hours: 144,
      formats: ["presencial", "virtual"],
      ministry: true,
      practices: false,
      seats: 20,
      shift: "Tarde",
      matricula: 34000,
      cuota: 48000,
      requirements: ["DNI vigente"],
      start: new Date("2027-03-08T00:00:00.000Z"),
      image: "/class-team.webp",
      summary: "Resumen",
      description: "Descripción",
      outcomes: ["Uno"],
      modules: ["Módulo"],
      position: 3,
    });
  });
});

describe("toEnrollmentRow", () => {
  const enrollment = {
    id: "enr-01",
    createdAt: "2026-11-16T15:00:00.000Z",
    name: "Camila Herrera",
    dni: "35128456",
    email: "camila@example.com",
    phone: "2645550182",
    courseId: "secretariado-escolar",
    modality: "presencial",
    shift: "Tarde",
    status: "nuevo",
    payment: "pendiente",
    amount: 82000,
    notes: "",
    source: "ejemplo",
    code: "RL-128456",
  };

  it("snapshots the course title and keeps the legacy values", () => {
    const row = toEnrollmentRow(
      enrollment,
      new Map([["secretariado-escolar", "Secretariado Escolar"]]),
    );

    expect(row).toEqual({
      id: "enr-01",
      code: "RL-128456",
      name: "Camila Herrera",
      dni: "35128456",
      email: "camila@example.com",
      phone: "2645550182",
      courseId: "secretariado-escolar",
      courseTitle: "Secretariado Escolar",
      modality: "presencial",
      shift: "Tarde",
      status: "nuevo",
      payment: "pendiente",
      amount: 82000,
      notes: "",
      source: "ejemplo",
      createdAt: new Date("2026-11-16T15:00:00.000Z"),
    });
  });

  it("drops the course link when the course no longer exists", () => {
    const row = toEnrollmentRow({ ...enrollment, courseId: "borrado" }, new Map());

    expect(row.courseId).toBeNull();
    expect(row.courseTitle).toBe("borrado");
  });
});

describe("toSiteContentRows", () => {
  it("stores one row per content block", () => {
    const rows = toSiteContentRows({ hero: { title: "Hola" }, brand: { name: "Red Laprida" } });

    expect(rows).toEqual([
      { key: "hero", value: { title: "Hola" } },
      { key: "brand", value: { name: "Red Laprida" } },
    ]);
  });
});
