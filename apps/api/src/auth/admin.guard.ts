import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyRequest } from "fastify";
import type { Auth } from "./auth.factory.js";
import { AUTH } from "./auth.provider.js";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(AUTH) private readonly auth: Auth) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const session = await this.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) throw new UnauthorizedException("Iniciá sesión para continuar.");
    return true;
  }
}
