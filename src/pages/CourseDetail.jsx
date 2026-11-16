import { Link, useParams, useSearchParams } from "react-router-dom"
import { courseFormats } from "../data/courses"
import { formatMoney, modalityById } from "../data/institution"
import { useSite } from "../site/SiteContext"
import CourseCard from "../components/CourseCard"

export default function CourseDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { courses, categories, institution } = useSite()
  const course = courses.find((item) => item.id === id)

  if (!course) {
    return (
      <main id="main-content" className="page-detail">
        <p className="empty-state">Ese curso no está en el catálogo.</p>
        <Link to="/#catalogo" className="btn btn-solid">
          Volver a cursos
        </Link>
      </main>
    )
  }

  const category = categories.find((item) => item.id === course.category) || { name: "Curso", color: "#1769a7" }
  const formats = courseFormats(course)
  const requested = params.get("modalidad")
  const activeFormat = formats.includes(requested) ? modalityById.get(requested) : modalityById.get(formats[0])
  const related = courses.filter((item) => item.category === course.category && item.id !== course.id).slice(0, 3)
  const total = course.matricula + course.cuota * course.durationMonths

  return (
    <main id="main-content" className="page-detail">
      <section className="detail-hero" data-theme="dark" style={{ "--accent": category.color }}>
        <img src={course.image} alt="" width="1400" height="900" fetchPriority="high" />
        <div className="detail-hero-copy enter">
          <Link to={`/cursos?modalidad=${activeFormat?.id || "presencial"}&area=${course.category}`} className="eyebrow light">
            {category.name}
          </Link>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          {activeFormat?.id === "presencial" ? (
            <p>Se cursa en el {institution.legalName}, {institution.locality}.</p>
          ) : null}
          <div className="detail-pills">
            <span>{course.durationMonths} meses</span>
            <span>{course.hours} horas</span>
            <span>{activeFormat?.label || course.modality}</span>
            <span>{activeFormat?.id === "hibrido" ? "Campus y Zoom" : activeFormat?.id === "virtual" ? "A tu ritmo" : course.shift}</span>
            {course.ministry ? <span>Ministerio de Educación</span> : null}
            {course.practices ? <span>Prácticas profesionales</span> : null}
          </div>
        </div>
      </section>

      <section className="detail-layout">
        <article>
          <h2>El trayecto</h2>
          <p>{course.description}</p>
          <h3>Cuando termines</h3>
          <ul>
            {course.outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Módulos</h3>
          <ol className="module-list">
            {course.modules.map((item, index) => (
              <li key={item}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                {item}
              </li>
            ))}
          </ol>
          <h3>Requisitos</h3>
          <ul>
            {course.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <aside className="enroll-card">
          <p className="section-kicker">Inscripción</p>
          <h3>Reservá tu lugar</h3>
          <dl>
            <div>
              <dt>Matrícula</dt>
              <dd>{formatMoney(course.matricula)}</dd>
            </div>
            <div>
              <dt>Cuota mensual</dt>
              <dd>{formatMoney(course.cuota)}</dd>
            </div>
            <div>
              <dt>Inversión total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
            <div>
              <dt>Cupos</dt>
              <dd>{course.seats} alumnos</dd>
            </div>
          </dl>
          <Link to={`/inscripcion?curso=${course.id}&modalidad=${activeFormat?.id || "presencial"}`} className="btn btn-enroll btn-full">Inscribirme</Link>
          <p className="fine-print">Completá tus datos, revisá el precio final y continuá con Mercado Pago.</p>
        </aside>
      </section>

      {related.length > 0 ? (
        <section className="related">
          <h2>También en {category.name}</h2>
          <div className="course-grid">
            {related.map((item, index) => (
              <CourseCard key={item.id} course={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
