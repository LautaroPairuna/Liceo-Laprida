import type { Metadata, Viewport } from "next";
import { Alegreya_Sans, Archivo } from "next/font/google";
import { siteUrl } from "@/lib/site-url";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Red Cima | Cursos y oficios en San Juan",
  description:
    "Red Cima. Formación práctica y cursos con salida laboral. Presencial en el Liceo Laprida, San Juan, y también híbrido y virtual.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/red-cima-mark.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/site.webmanifest",
  openGraph: {
    locale: "es_AR",
    type: "website",
    siteName: "Red Cima",
    images: [
      { url: "/og-red-cima.png", width: 1200, height: 630, alt: "Red Cima. El que sabe sube" },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/og-red-cima.png"] },
};

export const viewport: Viewport = { themeColor: "#f7fafc" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
