import type { Metadata } from "next";
import { ContentEditor } from "@/components/admin/content-editor";

export const metadata: Metadata = { title: "Contenido" };

export default function ContentPage() {
  return <ContentEditor />;
}
