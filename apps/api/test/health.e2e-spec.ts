import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module.js";
import { configureApp, createAdapter } from "../src/setup.js";

describe("GET /api/health", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(createAdapter());
    configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("responds ok", async () => {
    const response = await app.inject({ method: "GET", url: "/api/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it("rejects admin endpoints without a session", async () => {
    const response = await app.inject({ method: "GET", url: "/api/admin/enrollments" });
    expect(response.statusCode).toBe(401);
  });

  it("rejects a Mercado Pago notification without a valid signature", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/webhooks/mercadopago?data.id=ORD01&type=order",
      headers: { "x-signature": "ts=1,v1=falsa", "x-request-id": "req-1" },
      payload: { type: "order", data: { id: "ORD01" } },
    });
    expect(response.statusCode).toBe(401);
  });
});
