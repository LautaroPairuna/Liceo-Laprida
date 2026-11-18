import type { Metadata, Viewport } from "next";
import { Alegreya_Sans, Archivo } from "next/font/google";
import "../styles/site.css";

const display = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-display",
});
const sans = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Red Cima | Cursos y oficios en San Juan",
  description:
    "Red Cima. Formación práctica y cursos con salida laboral. Presencial en el Liceo Laprida, San Juan, y también híbrido y virtual.",
  icons: { icon: "/favicon.svg" },
  openGraph: { locale: "es_AR", type: "website", siteName: "Red Cima" },
};

export const viewport: Viewport = { themeColor: "#f7fafc" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
