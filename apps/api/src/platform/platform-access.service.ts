import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { EDUCATION_PLATFORM, type EducationPlatform } from "./education-platform.js";

@Injectable()
export class PlatformAccessService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EDUCATION_PLATFORM) private readonly platform: EducationPlatform,
  ) {}

  async grant(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment || enrollment.payment !== "aprobado" || enrollment.access === "otorgado")
      return;

    const result = await this.platform.grantAccess({
      enrollmentId: enrollment.id,
      name: enrollment.name,
      email: enrollment.email,
      dni: enrollment.dni,
      courseId: enrollment.courseId ?? "",
      courseTitle: enrollment.courseTitle,
      modality: enrollment.modality,
    });

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        access: result.status === "granted" ? "otorgado" : "pendiente",
        accessNote: result.note ?? null,
      },
    });
  }

  async markFailed(enrollmentId: string, reason: string) {
    await this.prisma.enrollment.updateMany({
      where: { id: enrollmentId, access: { not: "otorgado" } },
      data: { access: "fallido", accessNote: reason.slice(0, 500) },
    });
  }
}
