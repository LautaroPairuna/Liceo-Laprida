import { Injectable, Logger } from "@nestjs/common";
import type { AccessResult, EducationPlatform, PlatformStudent } from "./education-platform.js";

/** Used until the educational platform exposes an API: access is granted by hand from the admin. */
@Injectable()
export class PendingEducationPlatform implements EducationPlatform {
  private readonly logger = new Logger(PendingEducationPlatform.name);

  async grantAccess(student: PlatformStudent): Promise<AccessResult> {
    this.logger.log(`[plataforma] alta manual pendiente para ${student.enrollmentId}`);
    return {
      status: "pending",
      note: "Dar el alta a mano: la plataforma educativa todavía no tiene API.",
    };
  }
}
