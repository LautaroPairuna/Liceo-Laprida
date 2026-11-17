import { Module } from "@nestjs/common";
import { AdminEnrollmentsController } from "./admin-enrollments.controller.js";
import { EnrollmentsService } from "./enrollments.service.js";

@Module({
  controllers: [AdminEnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
