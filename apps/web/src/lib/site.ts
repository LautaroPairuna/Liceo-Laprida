import "server-only";
import { cache } from "react";
import type { Site } from "./types";

export const SITE_TAG = "site";

const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export const getSite = cache(async (): Promise<Site> => {
  const response = await fetch(`${apiUrl}/api/site`, {
    next: { revalidate: 300, tags: [SITE_TAG] },
  });
  if (!response.ok) throw new Error(`[sitio] la API respondió ${response.status}`);
  return response.json();
});

export async function getCourse(id: string) {
  const { courses, content } = await getSite();
  const course = courses.find((item) => item.id === id);
  return course ? { course, content, courses } : null;
}
