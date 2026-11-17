import type { Metadata } from "next";
import "../../styles/admin.css";
import "../../styles/admin-lock.css";

export const metadata: Metadata = {
  title: { default: "Administración", template: "%s | Administración" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
