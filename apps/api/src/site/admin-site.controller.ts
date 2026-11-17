import { Body, Controller, Delete, HttpCode, Param, Post, Put, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { AdminGuard } from "../auth/admin.guard.js";
import type { Prisma } from "../generated/prisma/client.js";
import { type CourseInput, courseInputSchema } from "./courses.js";
import { SiteService } from "./site.service.js";

const contentValueSchema = z.object({
  value: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]),
});

@UseGuards(AdminGuard)
@Controller("admin")
export class AdminSiteController {
  constructor(private readonly site: SiteService) {}

  @Put("content/:key")
  updateContent(
    @Param("key") key: string,
    @Body({ schema: contentValueSchema }) body: z.infer<typeof contentValueSchema>,
  ) {
    return this.site.updateContent(
      this.site.assertContentKey(key),
      body.value as Prisma.InputJsonValue,
    );
  }

  @Post("content/:key/restore")
  restoreContent(@Param("key") key: string) {
    return this.site.restoreContent(this.site.assertContentKey(key));
  }

  @Post("courses")
  createCourse(@Body({ schema: courseInputSchema }) input: CourseInput) {
    return this.site.createCourse(input);
  }

  @Post("courses/restore")
  restoreCourses() {
    return this.site.restoreCourses();
  }

  @Put("courses/:id")
  updateCourse(@Param("id") id: string, @Body({ schema: courseInputSchema }) input: CourseInput) {
    return this.site.updateCourse(id, input);
  }

  @Delete("courses/:id")
  @HttpCode(204)
  removeCourse(@Param("id") id: string) {
    return this.site.removeCourse(id);
  }
}
