"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { authClient } from "@/lib/admin-api";
import { BrandMark } from "../brand-mark";

const links = [
  { href: "/admin", label: "General" },
  { href: "/admin/contenido", label: "Contenido" },
  { href: "/admin/catalogo", label: "Catálogo" },
  { href: "/admin/alumnos", label: "Alumnos" },
];

export function AdminShell({ userName, children }: { userName: string; children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.replace("/admin/login");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="admin-app">
        <a className="skip-link" href="#admin-content">
          Saltar al contenido
        </a>
        <aside className="admin-rail">
          <div className="rail-brand">
            <BrandMark variant="footer" />
            <p className="rail-kicker">Administración</p>
          </div>
          <nav className="rail-nav" aria-label="Secciones del panel">
            {links.map((link) => {
              const active =
                link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rail-link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="rail-foot">
            <Link className="rail-site" href="/">
              Ver la web <span aria-hidden="true">↗</span>
            </Link>
            <div className="rail-user">
              <span className="rail-avatar" aria-hidden="true">
                {userName.trim().charAt(0).toUpperCase() || "?"}
              </span>
              <span className="rail-user-name" title={userName}>
                {userName}
              </span>
              <button type="button" className="rail-signout" onClick={signOut}>
                Salir
              </button>
            </div>
          </div>
        </aside>
        <main id="admin-content" className="admin-main">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  );
}
