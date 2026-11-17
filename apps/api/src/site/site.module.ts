import { Module } from "@nestjs/common";
import { AdminSiteController } from "./admin-site.controller.js";
import { SiteController } from "./site.controller.js";
import { SiteService } from "./site.service.js";

@Module({
  controllers: [SiteController, AdminSiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
