import { lazy, Suspense, useEffect } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import { modalityById } from "./data/institution"
import { useSite } from "./site/SiteContext"

const AdminApp = lazy(() => import("./admin/AdminApp"))

const Catalog = lazy(() => import("./pages/Catalog"))
const CourseDetail = lazy(() => import("./pages/CourseDetail"))
const Students = lazy(() => import("./pages/Students"))
const Contact = lazy(() => import("./pages/Contact"))
const Checkout = lazy(() => import("./pages/Checkout"))

function ScrollTop() {
  const { pathname, hash, search } = useLocation()
  const { courses, brand, institution } = useSite()

  useEffect(() => {
    const courseId = pathname.startsWith("/cursos/") ? decodeURIComponent(pathname.split("/").pop()) : null
    const course = courseId ? courses.find((item) => item.id === courseId) : null
    const modalidad = new URLSearchParams(search).get("modalidad")
    const format = modalityById.get(modalidad)
    const metadata = course
      ? { title: `${course.title} | ${brand.name}`, description: course.summary }
      : pathname === "/cursos" && format?.id === "hibrido"
        ? { title: `Cursos híbridos | ${brand.name}`, description: "Cursos híbridos en los formatos digitales de Red Laprida: material en el campus y clases en vivo." }
        : pathname === "/cursos" && format?.id === "virtual"
          ? { title: `Cursos virtuales | ${brand.name}`, description: "Cursos virtuales en los formatos digitales de Red Laprida, a tu propio tiempo." }
          : pathname === "/cursos"
            ? { title: `Cursos presenciales | ${institution.name}`, description: "Cursos presenciales en el Liceo Profesional Laprida, en San Juan Capital." }
        : pathname === "/inscripcion"
          ? { title: `Inscripción | ${brand.name}`, description: "Completá tu inscripción y coordiná cupo, turno y forma de pago." }
          : pathname === "/contacto"
            ? { title: `Contacto | ${brand.name}`, description: "Escribinos por WhatsApp o acercate al Liceo Profesional Laprida, la sede en San Juan Capital." }
            : pathname === "/alumnos"
              ? { title: `Reseñas | ${brand.name}`, description: "Conocé reseñas de alumnos de Red Laprida y cómo llegar a la sede en San Juan." }
              : { title: `${brand.name} | Cursos y oficios en San Juan`, description: "Red Laprida. Formación práctica y cursos con salida laboral. Presencial en el Liceo Laprida, San Juan, y también híbrido y virtual." }

    document.title = metadata.title
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute("content", metadata.description)
  }, [pathname, search, courses, brand, institution])

  useEffect(() => {
    if (hash) {
      const node = document.getElementById(hash.replace("#", ""))
      if (node) {
        const alignSection = (behavior) => node.scrollIntoView({ behavior, block: "start" })
        const initialScroll = window.setTimeout(() => alignSection("smooth"), 40)
        const settledScroll = window.setTimeout(() => alignSection("auto"), 650)

        return () => {
          window.clearTimeout(initialScroll)
          window.clearTimeout(settledScroll)
        }
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" })
    return undefined
  }, [pathname, hash])
  return null
}

function Shell() {
  return (
    <>
      <ScrollTop />
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <Header />
      <Suspense fallback={<main id="main-content" className="route-loading" aria-live="polite">Cargando…</main>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cursos" element={<Catalog />} />
          <Route path="/cursos/:id" element={<CourseDetail />} />
          <Route path="/alumnos" element={<Students />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/inscripcion" element={<Checkout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={(
            <Suspense fallback={<main className="route-loading" aria-live="polite">Cargando administración…</main>}>
              <AdminApp />
            </Suspense>
          )}
        />
        <Route path="*" element={<Shell />} />
      </Routes>
    </BrowserRouter>
  )
}
