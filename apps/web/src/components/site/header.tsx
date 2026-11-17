"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "../brand-mark";
import { IconWhatsApp } from "../icons";

const links = [
  { id: "inicio", label: "Inicio" },
  { id: "catalogo", label: "Cursos" },
  { id: "ofertas", label: "Ofertas" },
  { id: "institucion", label: "La institución" },
  { id: "alumnos", label: "Reseñas" },
  { id: "contacto", label: "Contacto" },
];

function goTo(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `/#${id}`);
}

export function Header({ whatsapp }: { whatsapp: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [current, setCurrent] = useState("inicio");
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onCatalog = pathname === "/cursos";

  // Subscribes to window scroll: the header style depends on the page offset.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);

  // Highlights the section in view on the home page; re-subscribes when the route changes.
  useEffect(() => {
    if (!onHome) return;
    const nodes = links
      .map(({ id }) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrent(visible.target.id);
      },
      { rootMargin: "-25% 0px -55%", threshold: [0.05, 0.25, 0.5] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [onHome]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Red Laprida, inicio">
          <BrandMark />
        </Link>

        <nav
          id="main-navigation"
          aria-label="Navegación principal"
          className={`main-nav ${menu ? "is-open" : ""}`}
        >
          {links.map((link) =>
            onHome ? (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={current === link.id ? "active" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  goTo(link.id);
                  setMenu(false);
                }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.id}
                href={`/#${link.id}`}
                className={onCatalog && link.id === "catalogo" ? "active" : ""}
                onClick={() => setMenu(false)}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="header-actions">
          <a
            className="btn btn-whatsapp header-wa"
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="Escribir por WhatsApp"
          >
            <IconWhatsApp />
            <span>WhatsApp</span>
          </a>
          <button
            type="button"
            className={`menu-toggle ${menu ? "is-open" : ""}`}
            onClick={() => setMenu((value) => !value)}
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
            aria-controls="main-navigation"
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
