import { Global, Module } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { AdminGuard } from "./admin.guard.js";
import { AUTH, createAuthProvider } from "./auth.provider.js";

@Global()
@Module({
  providers: [createAuthProvider(PrismaService), AdminGuard],
  exports: [AUTH, AdminGuard],
})
export class AuthModule {}
