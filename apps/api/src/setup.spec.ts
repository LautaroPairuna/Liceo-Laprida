import { createAdapter } from "./setup.js";

async function clientIp(remoteAddress: string, forwardedFor?: string) {
  const fastify = createAdapter().getInstance();
  fastify.get("/ip", (request) => ({ ip: request.ip }));
  const response = await fastify.inject({
    method: "GET",
    url: "/ip",
    remoteAddress,
    headers: forwardedFor ? { "x-forwarded-for": forwardedFor } : {},
  });
  await fastify.close();
  return response.json<{ ip: string }>().ip;
}

describe("createAdapter client IP", () => {
  it("ignores an X-Forwarded-For value the client made up in front of the real address", async () => {
    expect(await clientIp("127.0.0.1", "203.0.113.7, 8.8.8.8")).toBe("8.8.8.8");
  });

  it("takes the address our proxies forwarded", async () => {
    expect(await clientIp("172.18.0.5", "8.8.8.8")).toBe("8.8.8.8");
  });

  it("does not trust forwarded headers from a public peer", async () => {
    expect(await clientIp("8.8.4.4", "203.0.113.7")).toBe("8.8.4.4");
  });
});
