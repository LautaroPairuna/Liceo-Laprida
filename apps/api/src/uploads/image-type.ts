const SIGNATURES = [
  {
    ext: "jpg",
    type: "image/jpeg",
    matches: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    type: "image/png",
    matches: (b: Buffer) =>
      b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    ext: "webp",
    type: "image/webp",
    matches: (b: Buffer) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
] as const;

export type ImageKind = { ext: string; type: string };

export function detectImage(buffer: Buffer): ImageKind | undefined {
  const found = SIGNATURES.find((signature) => buffer.length >= 12 && signature.matches(buffer));
  return found ? { ext: found.ext, type: found.type } : undefined;
}

export const STORED_NAME = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

export const TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
