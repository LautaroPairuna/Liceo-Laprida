import { uploadSizeProblem } from "./upload-precheck.js";

describe("uploadSizeProblem", () => {
  it("rejects uploads without a declared size, so chunked bodies cannot skip the limit", () => {
    expect(uploadSizeProblem(undefined, 5_000_000)).toEqual({
      status: 411,
      message: "Falta el tamaño del archivo.",
    });
    expect(uploadSizeProblem("abc", 5_000_000)?.status).toBe(411);
  });

  it("rejects uploads over the limit before reading them", () => {
    expect(uploadSizeProblem("5000001", 5_000_000)).toEqual({
      status: 413,
      message: "La foto es muy pesada.",
    });
  });

  it("lets through uploads within the limit", () => {
    expect(uploadSizeProblem("5000000", 5_000_000)).toBeNull();
  });
});
