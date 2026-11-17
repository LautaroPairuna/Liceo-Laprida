import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liceo Laprida",
  description: "Red Laprida. Cursos y oficios en San Juan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
