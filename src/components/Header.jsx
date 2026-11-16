import { useEffect, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useSite } from "../site/SiteContext"
import BrandMark from "./BrandMark"
import { IconWhatsApp } from "./Icons"

const links = [
  { id: "inicio", label: "Inicio" },
  { id: "catalogo", label: "Cursos" },
  { id: "ofertas", label: "Ofertas" },
  { id: "institucion", label: "La institución" },
  { id: "alumnos", label: "Reseñas" },
  { id: "contacto", label: "Contacto" },
]

const goTo = (id) => {
  const node = document.getElementById(id)
  if (!node) return
  node.scrollIntoView({ behavior: "smooth", block: "start" })
  window.history.replaceState(null, "", `/#${id}`)
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [current, setCurrent] = useState("inicio")
  const { institution } = useSite()
  const location = useLocation()
  const onHome = location.pathname === "/"
  const onCatalog = location.pathname === "/cursos"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menu) return undefined
    const close = (event) => {
      if (event.key === "Escape") setMenu(false)
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [menu])

  useEffect(() => {
    if (!onHome) return undefined
    const nodes = links.map(({ id }) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setCurrent(visible.target.id)
      },
      { rootMargin: "-25% 0px -55%", threshold: [0.05, 0.25, 0.5] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [onHome])

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header-inner">
        <NavLink to="/" end className="brand" aria-label="Red Laprida, inicio">
          <BrandMark />
        </NavLink>

        <nav id="main-navigation" aria-label="Navegación principal" className={`main-nav ${menu ? "is-open" : ""}`}>
          {links.map((link) =>
            onHome ? (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={current === link.id ? "active" : ""}
                onClick={(event) => {
                  event.preventDefault()
                  goTo(link.id)
                  setMenu(false)
                }}
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.id} to={`/#${link.id}`} className={onCatalog && link.id === "catalogo" ? "active" : ""} onClick={() => setMenu(false)}>{link.label}</Link>
            ),
          )}
        </nav>

        <div className="header-actions">
          <a
            className="btn btn-whatsapp header-wa"
            href={institution.whatsapp}
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
  )
}
