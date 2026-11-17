import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  PayloadTooLargeException,
  Post,
  Res,
  ServiceUnavailableException,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { FastifyReply } from "fastify";
import { AdminGuard } from "../auth/admin.guard.js";
import { env } from "../config/env.js";
import { detectImage, STORED_NAME, TYPE_BY_EXT } from "./image-type.js";

@Controller()
export class UploadsController {
  @Post("admin/uploads")
  @UseGuards(AdminGuard)
  async upload(@Headers("content-length") length: string | undefined, @Body() body: unknown) {
    const size = Number(length);
    if (!length || !Number.isFinite(size)) {
      throw new BadRequestException("Falta el tamaño del archivo.");
    }
    if (size > env.UPLOAD_MAX_BYTES) throw new PayloadTooLargeException("La foto es muy pesada.");
    if (!Buffer.isBuffer(body)) throw new BadRequestException("Subí una foto JPG, PNG o WebP.");

    const kind = detectImage(body);
    if (!kind) throw new BadRequestException("Subí una foto JPG, PNG o WebP.");

    const name = `${randomUUID()}.${kind.ext}`;
    await writeFile(join(env.UPLOADS_DIR, name), body).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        throw new ServiceUnavailableException("La carpeta de fotos no está disponible.");
      }
      throw error;
    });
    return { url: `/api/uploads/${name}` };
  }

  @Get("uploads/:name")
  @SkipThrottle()
  async serve(@Param("name") name: string, @Res({ passthrough: true }) reply: FastifyReply) {
    if (!STORED_NAME.test(name)) throw new NotFoundException();
    const path = join(env.UPLOADS_DIR, name);
    const info = await stat(path).catch(() => undefined);
    if (!info?.isFile()) throw new NotFoundException();
    reply.header("Cache-Control", "public, max-age=31536000, immutable");
    reply.header("X-Content-Type-Options", "nosniff");
    return new StreamableFile(createReadStream(path), {
      type: TYPE_BY_EXT[name.split(".").pop() ?? ""],
      length: info.size,
    });
  }
}
