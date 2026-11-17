import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard.js";
import { type AdminEnrollmentInput, adminEnrollmentSchema } from "./enrollments.js";
import { EnrollmentsService } from "./enrollments.service.js";

@UseGuards(AdminGuard)
@Controller("admin/enrollments")
export class AdminEnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Get()
  list() {
    return this.enrollments.list();
  }

  @Post()
  create(@Body({ schema: adminEnrollmentSchema }) input: AdminEnrollmentInput) {
    return this.enrollments.create(input);
  }

  @Delete("examples")
  removeExamples() {
    return this.enrollments.removeExamples();
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body({ schema: adminEnrollmentSchema }) input: AdminEnrollmentInput,
  ) {
    return this.enrollments.update(id, input);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id") id: string) {
    return this.enrollments.remove(id);
  }
}
