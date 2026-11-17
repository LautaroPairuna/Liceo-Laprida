import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: "./",
    include: ["**/*.e2e-spec.ts"],
    env: {
      DATABASE_URL: "mysql://test:test@localhost:3306/test",
      BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-123",
      MP_WEBHOOK_SECRET: "test-webhook-secret",
      REDIS_URL: "redis://localhost:6390",
    },
  },
});
