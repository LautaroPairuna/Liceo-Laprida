import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada | Red Cima",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="main-content" className="page-detail page-not-found">
      <h1>No encontramos esta página</h1>
      <p className="empty-state">
        Puede que el enlace esté mal escrito o que el curso ya no esté en el catálogo.
      </p>
      <div className="not-found-actions">
        <Link href="/#catalogo" className="btn btn-solid">
          Ver cursos
        </Link>
        <Link href="/" className="btn btn-line-ink">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
