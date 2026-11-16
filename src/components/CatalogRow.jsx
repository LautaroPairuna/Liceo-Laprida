import { Link } from "react-router-dom"
import { formatIntakeDate, formatMoney, inkOn } from "../data/institution"
import { useSite } from "../site/SiteContext"

const rhythmFor = (modalityId, course) => {
  if (modalityId === "virtual") return "A tu ritmo"
  if (modalityId === "hibrido") return "Clases en vivo"
  return course.shift
}

export default function CatalogRow({ course, modalityId = "presencial", modalityLabel = course.modality, accent }) {
  const { categoryById } = useSite()
  const category = categoryById.get(course.category)
  const color = accent || category?.color || "#1769a7"
  const detailHref = `/cursos/${course.id}?modalidad=${modalityId}`
  const enrollHref = `/inscripcion?curso=${course.id}&modalidad=${modalityId}`

  return (
    <article
      className="catalog-card"
      style={{ "--accent": color, "--ink": inkOn(color) }}
    >
      <div className="catalog-card-tags">
        <span className="catalog-card-tag">{category?.name}</span>
        {course.ministry ? <span className="catalog-card-note">Ministerio</span> : null}
      </div>
      <h3>
        <Link to={detailHref}>{course.title}</Link>
      </h3>
      <p>{course.summary}</p>
      <dl className="catalog-card-facts">
        <div>
          <dt>Duración</dt>
          <dd>
            {course.durationMonths} meses
            <small>{course.hours} horas</small>
          </dd>
        </div>
        <div>
          <dt>Inicio</dt>
          <dd>
            <time dateTime={course.start}>{formatIntakeDate(course.start)}</time>
          </dd>
        </div>
        <div>
          <dt>Modalidad</dt>
          <dd>
            {modalityLabel}
            <small>{rhythmFor(modalityId, course)}</small>
          </dd>
        </div>
        <div>
          <dt>Cuota</dt>
          <dd>
            {formatMoney(course.cuota)}
            <small>por mes</small>
          </dd>
        </div>
      </dl>
      <div className="catalog-card-actions">
        <Link to={detailHref} className="btn btn-ghost">Ver detalles</Link>
        <Link to={enrollHref} className="btn btn-enroll">Inscribirme</Link>
      </div>
    </article>
  )
}
