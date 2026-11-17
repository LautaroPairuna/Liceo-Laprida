import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { type AdminEnrollmentInput, enrollmentCode, toAdminEnrollment } from "./enrollments.js";

const LIST_LIMIT = 5000;

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
    });
    return rows.map(toAdminEnrollment);
  }

  async create(input: AdminEnrollmentInput) {
    const courseTitle = await this.courseTitle(input.courseId);
    const row = await this.prisma.enrollment.create({
      data: { ...input, courseTitle, code: enrollmentCode(input.dni), source: "equipo" },
    });
    return toAdminEnrollment(row);
  }

  async update(id: string, input: AdminEnrollmentInput) {
    const current = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("No está esa ficha.");
    const courseTitle =
      input.courseId === current.courseId
        ? current.courseTitle
        : await this.courseTitle(input.courseId);
    const row = await this.prisma.enrollment.update({
      where: { id },
      data: { ...input, courseTitle },
    });
    return toAdminEnrollment(row);
  }

  async remove(id: string) {
    const { count } = await this.prisma.enrollment.deleteMany({ where: { id } });
    if (!count) throw new NotFoundException("No está esa ficha.");
  }

  async removeExamples() {
    const { count } = await this.prisma.enrollment.deleteMany({ where: { source: "ejemplo" } });
    return { count };
  }

  private async courseTitle(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });
    if (!course) throw new BadRequestException("Ese curso no está en el catálogo.");
    return course.title;
  }
}
