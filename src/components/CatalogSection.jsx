import { useMemo } from "react"
import { Link, Navigate, useSearchParams } from "react-router-dom"
import { courseFormats } from "../data/courses"
import { modalities, modalityById } from "../data/institution"
import { useSite } from "../site/SiteContext"
import { IconArrow } from "./Icons"

const legacyKeys = ["modalidad", "area", "q", "duracion", "inicio"]

export default function CatalogSection() {
  const { courses, institution, content, categoryById } = useSite()
  const [params] = useSearchParams()
  const modalityCounts = useMemo(() => {
    const counts = new Map(modalities.map((item) => [item.id, 0]))
    for (const course of courses) {
      for (const format of courseFormats(course)) counts.set(format, (counts.get(format) || 0) + 1)
    }
    return counts
  }, [courses])
  const legacy = legacyKeys.some((key) => params.get(key))

  if (legacy) {
    const next = new URLSearchParams(params)
    if (!modalityById.has(next.get("modalidad"))) {
      const mode = (categoryById.get(next.get("area"))?.modes || ["presencial"])[0]
      next.set("modalidad", mode)
    }
    return <Navigate to={`/cursos?${next.toString()}`} replace />
  }

  return (
    <section id="catalogo" className="home-catalog snap-section" aria-label="Formatos de cursado">
      <div className="section-wrap">
        <div className="format-rail">
          {modalities.map((item) => {
            const count = modalityCounts.get(item.id) || 0
            return (
              <Link key={item.id} className={`format-card format-${item.id}`} to={`/cursos?modalidad=${item.id}`}>
                {item.id === "presencial" ? (
                  <span className="modality-seal">
                    <span className="modality-seal-mark" aria-hidden="true">
                      <img src="/logo.png" alt="" />
                    </span>
                    <span>
                      <small>En el</small>
                      <b>Liceo Laprida</b>
                    </span>
                  </span>
                ) : (
                  <span className="format-lockup">
                    <span className="format-sigil" aria-hidden="true">R</span>
                    <span className="format-word">
                      <span className="format-red">RED</span>
                      <span className="format-name">LAPRIDA</span>
                    </span>
                  </span>
                )}
                <span className="format-copy">
                  <strong>{item.name}</strong>
                  <small>{content.catalogCopy?.[item.id]?.detail || item.detail}</small>
                  <span className="format-net">
                    {item.id === "presencial"
                      ? `${institution.address}, ${institution.locality}`
                      : "Formatos digitales de Red Laprida"}
                  </span>
                </span>
                <span className="format-foot">
                  <em>{count} {count === 1 ? "curso" : "cursos"}</em>
                  <span className="format-open">
                    Abrir catálogo <IconArrow />
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
