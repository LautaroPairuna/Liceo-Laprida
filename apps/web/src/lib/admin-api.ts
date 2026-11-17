"use client";

import { createAuthClient } from "better-auth/react";
import { refreshPublicSite } from "@/app/admin/actions";
import type { ContentKey, Course, Enrollment, Site, SiteContent } from "./types";

export const authClient = createAuthClient();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: "no-store", ...init });
  if (response.status === 401) {
    window.location.assign("/admin/login");
    throw new Error("Iniciá sesión para continuar.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
    throw new Error(message || "No se pudo guardar. Probá de nuevo.");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: body === undefined ? undefined : { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

async function publish<T>(promise: Promise<T>) {
  const result = await promise;
  await refreshPublicSite();
  return result;
}

export type CourseDraft = Omit<Course, "id" | "modality" | "intakeId"> & { id?: string };
export type EnrollmentDraft = Omit<
  Enrollment,
  | "id"
  | "code"
  | "createdAt"
  | "courseTitle"
  | "source"
  | "accessNote"
  | "mpOrderId"
  | "mpStatus"
  | "paidAt"
> & { id?: string };

export const adminApi = {
  site: () => request<Site>("/api/site"),
  saveContent: <K extends ContentKey>(key: K, value: SiteContent[K]) =>
    publish(request<SiteContent[K]>(`/api/admin/content/${key}`, json("PUT", { value }))),
  restoreContent: <K extends ContentKey>(key: K) =>
    publish(request<SiteContent[K]>(`/api/admin/content/${key}/restore`, json("POST"))),
  saveCourse: ({ id, ...draft }: CourseDraft) =>
    publish(
      id
        ? request<Course>(`/api/admin/courses/${id}`, json("PUT", draft))
        : request<Course>("/api/admin/courses", json("POST", draft)),
    ),
  removeCourse: (id: string) => publish(request<void>(`/api/admin/courses/${id}`, json("DELETE"))),
  restoreCourses: () => publish(request<Course[]>("/api/admin/courses/restore", json("POST"))),
  enrollments: () => request<Enrollment[]>("/api/admin/enrollments"),
  saveEnrollment: ({ id, ...draft }: EnrollmentDraft) =>
    id
      ? request<Enrollment>(`/api/admin/enrollments/${id}`, json("PUT", draft))
      : request<Enrollment>("/api/admin/enrollments", json("POST", draft)),
  removeEnrollment: (id: string) => request<void>(`/api/admin/enrollments/${id}`, json("DELETE")),
  removeExamples: () =>
    request<{ count: number }>("/api/admin/enrollments/examples", json("DELETE")),
  uploadImage: (file: Blob) =>
    request<{ url: string }>("/api/admin/uploads", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    }),
};
