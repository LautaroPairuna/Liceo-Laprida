import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance } from "fastify";
import type { Auth } from "./auth.factory.js";

export function registerAuthRoutes(fastify: FastifyInstance, auth: Auth) {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const response = await auth.handler(
        new Request(url, {
          method: request.method,
          headers: fromNodeHeaders(request.headers),
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        }),
      );
      reply.status(response.status);
      for (const [key, value] of response.headers) {
        if (key !== "set-cookie") reply.header(key, value);
      }
      const cookies = response.headers.getSetCookie();
      if (cookies.length) reply.header("set-cookie", cookies);
      return reply.send(response.body ? await response.text() : null);
    },
  });
}
