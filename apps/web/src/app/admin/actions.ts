"use server";

import { updateTag } from "next/cache";
import { getAdminSession } from "@/lib/session";
import { SITE_TAG } from "@/lib/site";

export async function refreshPublicSite() {
  if (!(await getAdminSession())) throw new Error("Iniciá sesión para continuar.");
  updateTag(SITE_TAG);
}
