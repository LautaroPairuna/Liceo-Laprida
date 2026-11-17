import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="page-detail">
      <p className="empty-state">Esa página no está.</p>
      <Link href="/" className="btn btn-solid">
        Volver al inicio
      </Link>
    </main>
  );
}
