import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import { toCourseRow } from "../database/seed-data.js";
import type { Prisma } from "../generated/prisma/client.js";
import { type CourseInput, toCourseData, toPublicCourse, uniqueSlug } from "./courses.js";
import { seedData } from "./defaults.js";

export const CONTENT_KEYS = [
  "hero",
  "learning",
  "story",
  "reviews",
  "contact",
  "offers",
  "categories",
  "catalogCopy",
  "brand",
] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async site() {
    const [content, courses] = await Promise.all([this.content(), this.courses()]);
    return { content, courses };
  }

  async content() {
    const rows = await this.prisma.siteContent.findMany({ select: { key: true, value: true } });
    const stored = new Map(rows.map((row) => [row.key, row.value]));
    const defaults = seedData().content;
    return Object.fromEntries(
      CONTENT_KEYS.map((key) => [key, stored.get(key) ?? defaults[key]]),
    ) as Record<ContentKey, unknown>;
  }

  async courses() {
    const rows = await this.prisma.course.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toPublicCourse);
  }

  async course(id: string) {
    const row = await this.prisma.course.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Ese curso no está en el catálogo.");
    return toPublicCourse(row);
  }

  async updateContent(key: ContentKey, value: Prisma.InputJsonValue) {
    await this.prisma.siteContent.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return value;
  }

  async restoreContent(key: ContentKey) {
    const value = seedData().content[key] as Prisma.InputJsonValue;
    return this.updateContent(key, value);
  }

  async createCourse(input: CourseInput) {
    const taken = new Set(
      (await this.prisma.course.findMany({ select: { id: true } })).map((row) => row.id),
    );
    const first = await this.prisma.course.findFirst({
      orderBy: { position: "asc" },
      select: { position: true },
    });
    const row = await this.prisma.course.create({
      data: {
        ...toCourseData(input),
        id: uniqueSlug(input.title, taken),
        position: (first?.position ?? 0) - 1,
      },
    });
    return toPublicCourse(row);
  }

  async updateCourse(id: string, input: CourseInput) {
    await this.course(id);
    const row = await this.prisma.course.update({ where: { id }, data: toCourseData(input) });
    return toPublicCourse(row);
  }

  async removeCourse(id: string) {
    await this.course(id);
    await this.prisma.course.delete({ where: { id } });
  }

  async restoreCourses() {
    const rows = seedData().courses.map(toCourseRow);
    const ids = rows.map((row) => row.id);
    await this.prisma.$transaction([
      this.prisma.course.deleteMany({ where: { id: { notIn: ids } } }),
      ...rows.map(({ id, ...data }) =>
        this.prisma.course.upsert({ where: { id }, create: { id, ...data }, update: data }),
      ),
    ]);
    return this.courses();
  }

  assertContentKey(key: string): ContentKey {
    if (!CONTENT_KEYS.includes(key as ContentKey)) {
      throw new BadRequestException("Esa sección no existe.");
    }
    return key as ContentKey;
  }
}
