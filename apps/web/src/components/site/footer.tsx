import Link from "next/link";
import type { SiteContent } from "@/lib/types";
import { BrandMark } from "../brand-mark";

export function Footer({ content }: { content: SiteContent }) {
  const { brand, categories, contact } = content;

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <BrandMark variant="footer" />
          <p>{brand.tagline}</p>
        </div>
        <nav aria-label="Explorar">
          <h2>Explorar</h2>
          <Link href="/#catalogo">Cursos</Link>
          <Link href="/#ofertas">Ofertas</Link>
          <Link href="/#institucion">La institución</Link>
          <Link href="/#alumnos">Reseñas</Link>
          <Link href="/#contacto">Contacto y sede</Link>
          <Link href="/inscripcion">Inscripción</Link>
        </nav>
        <nav aria-label="Áreas de formación">
          <h2>Áreas</h2>
          {categories.slice(0, 5).map((category) => (
            <Link key={category.id} href={`/cursos?modalidad=presencial&area=${category.id}`}>
              {category.name}
            </Link>
          ))}
          <Link href="/cursos?modalidad=presencial">Ver todas las áreas</Link>
        </nav>
        <div className="footer-contact">
          <h2>Sede presencial</h2>
          <p>
            <strong className="footer-sede-name">{contact.legalName}</strong>
            {contact.address}
            <br />
            {contact.postal} {contact.locality}
          </p>
          <a href={`tel:+${contact.phoneRaw}`}>{contact.phone}</a>
          <a href={contact.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href={contact.instagram} target="_blank" rel="noreferrer">
            {contact.instagramHandle}
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {brand.name}
        </span>
        <span>Capacitación laboral con sede en San Juan</span>
        <Link href="/admin" className="footer-admin" aria-label="Administración" prefetch={false}>
          <GearIcon />
        </Link>
      </div>
    </footer>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
