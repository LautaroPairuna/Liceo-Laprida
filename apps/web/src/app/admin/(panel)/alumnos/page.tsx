import type { Metadata } from "next";
import { StudentsDesk } from "@/components/admin/students-desk";

export const metadata: Metadata = { title: "Alumnos" };

export default function StudentsAdminPage() {
  return <StudentsDesk />;
}
