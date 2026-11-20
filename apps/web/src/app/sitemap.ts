import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { courses } = await getSite();
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...["presencial", "hibrido", "virtual"].map((modality) => ({
      url: `${siteUrl}/cursos?modalidad=${modality}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...courses.map((course) => ({
      url: `${siteUrl}/cursos/${course.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
