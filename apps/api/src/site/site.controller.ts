import { Controller, Get, Param } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { SiteService } from "./site.service.js";

@SkipThrottle()
@Controller("site")
export class SiteController {
  constructor(private readonly site: SiteService) {}

  @Get()
  all() {
    return this.site.site();
  }

  @Get("courses/:id")
  course(@Param("id") id: string) {
    return this.site.course(id);
  }
}
