import { useCallback, useEffect, useState } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { isAdminUnlocked } from "./access"
import AdminLock from "../components/AdminLock"
import BrandMark from "../components/BrandMark"
import { useSite } from "../site/SiteContext"
import CatalogEditor from "./CatalogEditor"
import ContentEditor from "./ContentEditor"
import Overview from "./Overview"
import StudentsDesk from "./StudentsDesk"
import "./admin.css"

const links = [
  { to: "/admin", label: "General", end: true },
  { to: "/admin/contenido", label: "Contenido" },
  { to: "/admin/catalogo", label: "Catálogo" },
  { to: "/admin/alumnos", label: "Alumnos" },
]

function titleFor(pathname) {
  if (pathname.startsWith("/admin/contenido")) return "Contenido"
  if (pathname.startsWith("/admin/catalogo")) return "Catálogo"
  if (pathname.startsWith("/admin/alumnos")) return "Alumnos"
  return "General"
}

function Panel({ pathname }) {
  if (pathname === "/admin" || pathname === "/admin/") return <Overview />
  if (pathname.startsWith("/admin/contenido")) return <ContentEditor />
  if (pathname.startsWith("/admin/catalogo")) return <CatalogEditor />
  if (pathname.startsWith("/admin/alumnos")) return <StudentsDesk />
  return <p>Esa sección no está. <Link className="text-link" to="/admin">Volver a General</Link></p>
}

export default function AdminApp() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { saveError } = useSite()
  const [unlocked, setUnlocked] = useState(isAdminUnlocked)
  const leaveLock = useCallback(() => navigate("/"), [navigate])
  const enterAdmin = useCallback(() => setUnlocked(true), [])

  useEffect(() => {
    document.title = unlocked ? `${titleFor(pathname)} | Administración` : "Administración"
  }, [pathname, unlocked])

  if (!unlocked) return <AdminLock onClose={leaveLock} onUnlock={enterAdmin} />

  return (
    <div className="admin-app">
      <a className="skip-link" href="#admin-content">Saltar al contenido</a>
      <aside className="admin-rail">
        <div className="rail-brand">
          <BrandMark variant="footer" />
          <p className="rail-kicker">Administración</p>
        </div>
        <nav className="rail-nav" aria-label="Secciones del panel">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `rail-link${isActive ? " is-active" : ""}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <p className="rail-foot"><Link to="/">Ver la web</Link></p>
      </aside>
      <main id="admin-content" className="admin-main">
        {saveError ? <p className="admin-banner" role="alert">{saveError}</p> : null}
        <Panel pathname={pathname} />
      </main>
    </div>
  )
}
