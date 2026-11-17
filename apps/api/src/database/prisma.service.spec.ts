vi.mock("../config/env.js", () => ({ env: {} }));

const { poolUrl } = await import("./prisma.service.js");

describe("poolUrl", () => {
  it("sets the pool size and keeps the credentials and existing options", () => {
    const url = poolUrl("mysql://laprida:se%40creta@db:3306/laprida?ssl=true", 5);

    expect(url).toBe("mysql://laprida:se%40creta@db:3306/laprida?ssl=true&connectionLimit=5");
  });

  it("replaces a pool size already present in the URL", () => {
    expect(poolUrl("mysql://u:p@db:3306/app?connectionLimit=20", 5)).toBe(
      "mysql://u:p@db:3306/app?connectionLimit=5",
    );
  });
});
