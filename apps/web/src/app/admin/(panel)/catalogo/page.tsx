import type { Metadata } from "next";
import { CatalogEditor } from "@/components/admin/catalog-editor";

export const metadata: Metadata = { title: "Catálogo" };

export default function CatalogAdminPage() {
  return <CatalogEditor />;
}
