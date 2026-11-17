"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";

export const SITE_KEY = ["admin", "site"] as const;
export const ENROLLMENTS_KEY = ["admin", "enrollments"] as const;

export function useSiteData() {
  return useQuery({ queryKey: SITE_KEY, queryFn: adminApi.site });
}

export function useEnrollments() {
  return useQuery({ queryKey: ENROLLMENTS_KEY, queryFn: adminApi.enrollments });
}

export function LoadState({ error }: { error: Error | null }) {
  return error ? (
    <p className="admin-banner" role="alert">
      {error.message}
    </p>
  ) : (
    <p className="page-lead" role="status">
      Cargando…
    </p>
  );
}
