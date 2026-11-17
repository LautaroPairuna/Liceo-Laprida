import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminShell userName={session.user.name}>{children}</AdminShell>;
}
