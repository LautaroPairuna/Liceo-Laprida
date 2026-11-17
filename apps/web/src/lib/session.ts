import "server-only";
import { headers } from "next/headers";

const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export type AdminSession = { user: { id: string; name: string; email: string } };

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookie = (await headers()).get("cookie");
  if (!cookie) return null;
  const response = await fetch(`${apiUrl}/api/auth/get-session`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}
