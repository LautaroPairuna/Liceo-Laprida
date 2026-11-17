import type {
  CourseFormat,
  EnrollmentSource,
  EnrollmentStatus,
  PaymentStatus,
  Prisma,
} from "../generated/prisma/client.js";

export type LegacyCourse = {
  id: string;
  title: string;
  category: string;
  durationMonths: number;
  hours: number;
  formats: string[];
  ministry: boolean;
  practices: boolean;
  seats: number;
  shift: string;
  matricula: number;
  cuota: number;
  requirements: string[];
  start: string;
  image: string;
  summary: string;
  description: string;
  outcomes: string[];
  modules: string[];
};

export type LegacyEnrollment = {
  id: string;
  createdAt: string;
  name: string;
  dni: string;
  email: string;
  phone: string;
  courseId: string;
  modality: string;
  shift: string;
  status: string;
  payment: string;
  amount: number;
  notes: string;
  source: string;
  code: string;
};

export type SeedData = {
  content: Record<string, unknown>;
  courses: LegacyCourse[];
  enrollments: LegacyEnrollment[];
};

export function toCourseRow(course: LegacyCourse, position: number): Prisma.CourseCreateManyInput {
  return {
    id: course.id,
    title: course.title,
    category: course.category,
    durationMonths: course.durationMonths,
    hours: course.hours,
    formats: course.formats,
    ministry: course.ministry,
    practices: course.practices,
    seats: course.seats,
    shift: course.shift,
    matricula: course.matricula,
    cuota: course.cuota,
    requirements: course.requirements,
    start: new Date(`${course.start}T00:00:00.000Z`),
    image: course.image,
    summary: course.summary,
    description: course.description,
    outcomes: course.outcomes,
    modules: course.modules,
    position,
  };
}

export function toEnrollmentRow(
  enrollment: LegacyEnrollment,
  courseTitles: Map<string, string>,
): Prisma.EnrollmentCreateManyInput {
  const courseTitle = courseTitles.get(enrollment.courseId);
  return {
    id: enrollment.id,
    code: enrollment.code,
    name: enrollment.name,
    dni: enrollment.dni,
    email: enrollment.email,
    phone: enrollment.phone,
    courseId: courseTitle ? enrollment.courseId : null,
    courseTitle: courseTitle ?? enrollment.courseId,
    modality: enrollment.modality as CourseFormat,
    shift: enrollment.shift,
    status: enrollment.status as EnrollmentStatus,
    payment: enrollment.payment as PaymentStatus,
    amount: enrollment.amount,
    notes: enrollment.notes,
    source: enrollment.source as EnrollmentSource,
    createdAt: new Date(enrollment.createdAt),
  };
}

export function toSiteContentRows(content: Record<string, unknown>) {
  return Object.entries(content).map(([key, value]) => ({
    key,
    value: value as Prisma.InputJsonValue,
  }));
}
