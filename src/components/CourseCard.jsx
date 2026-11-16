import { Link } from "react-router-dom"
import { courseFormats } from "../data/courses"
import { formatMoney, inkOn, modalityById } from "../data/institution"
import { useSite } from "../site/SiteContext"

export default function CourseCard({ course }) {
  const { categoryById } = useSite()
  const category = categoryById.get(course.category)
  const formats = courseFormats(course)
  const presencialOnly = formats.length === 1 && formats[0] === "presencial"

  return (
    <article className="course-card" style={{ "--accent": category?.color, "--soft": category?.soft, "--ink": inkOn(category?.color) }}>
        <Link to={`/cursos/${course.id}`} className="card-media">
          <img src={course.image} alt={course.title} width="1400" height="900" loading="lazy" />
          <span className="card-chip">{category?.name}</span>
          {course.ministry ? <span className="card-seal">Ministerio</span> : null}
        </Link>
        <div className="card-body">
          <h3>
            <Link to={`/cursos/${course.id}`}>{course.title}</Link>
          </h3>
          <p>{course.summary}</p>
          <div className="card-meta">
            <span>{course.durationMonths} meses</span>
            <span>{formats.map((id) => modalityById.get(id)?.label || course.modality).join(", ")}</span>
            <span>{formatMoney(course.cuota)} / mes</span>
            {presencialOnly ? <span>Liceo Laprida</span> : null}
          </div>
          <div className="card-actions">
            <Link to={`/cursos/${course.id}`} className="btn btn-ghost">
              Ver detalles
            </Link>
            <Link to={`/inscripcion?curso=${course.id}`} className="btn btn-enroll">Inscribirme</Link>
          </div>
        </div>
    </article>
  )
}
