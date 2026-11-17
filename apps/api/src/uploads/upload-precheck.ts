import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { Auth } from "../auth/auth.factory.js";

export function uploadSizeProblem(contentLength: string | undefined, maxBytes: number) {
  const size = Number(contentLength);
  if (!contentLength || !Number.isFinite(size)) {
    return { status: 411, message: "Falta el tamaño del archivo." };
  }
  if (size > maxBytes) return { status: 413, message: "La foto es muy pesada." };
  return null;
}

/** Fastify parses the body before Nest guards run, so size and session are checked on the raw request. */
export function registerUploadPrecheck(fastify: FastifyInstance, auth: Auth, maxBytes: number) {
  fastify.addHook("onRequest", async (request, reply) => {
    if (request.method !== "POST" || !request.url.startsWith("/api/admin/uploads")) return;
    const problem = uploadSizeProblem(request.headers["content-length"], maxBytes);
    if (problem) return reply.status(problem.status).send({ message: problem.message });
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) return reply.status(401).send({ message: "Iniciá sesión para continuar." });
  });
}
