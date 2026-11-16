import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { courseFormats } from "../data/courses"
import { formatMoney, modalityById } from "../data/institution"
import { useSite } from "../site/SiteContext"

export default function Checkout() {
  const { courses, brand, categoryById, content, addEnrollment } = useSite()
  const [params, setParams] = useSearchParams()
  const [done, setDone] = useState(null)
  const course = courses.find((item) => item.id === params.get("curso"))
  const formats = course ? courseFormats(course) : []
  const requested = params.get("modalidad")
  const modality = formats.includes(requested) ? requested : (formats[0] || "presencial")
  const hasOffer = params.get("oferta") === "1"
  const hasGroupBenefit = params.get("promo") === "grupo3"
  const offerDiscounts = new Map((content.offers?.courses || []).map((offer) => [offer.id, Number(offer.discount) || 0]))
  const groupDiscount = Number(String(content.offers?.group?.value || "").replace(/\D/g, "")) || 10
  const discount = !course ? 0 : hasGroupBenefit ? groupDiscount : hasOffer ? (offerDiscounts.get(course.id) || 0) : 0
  const monthlyPrice = course ? Math.round((course.cuota * (100 - discount)) / 100 / 1000) * 1000 : 0
  const fullPrice = course ? course.matricula + monthlyPrice * course.durationMonths : 0
  const initialPayment = course ? course.matricula + monthlyPrice : 0
  const category = course ? categoryById.get(course.category) : null

  const selectCourse = (event) => {
    const next = new URLSearchParams(params)
    const value = event.target.value
    if (value) next.set("curso", value)
    else next.delete("curso")
    const nextCourse = courses.find((item) => item.id === value)
    const nextFormats = nextCourse ? courseFormats(nextCourse) : []
    if (!nextFormats.includes(next.get("modalidad"))) {
      if (nextFormats[0]) next.set("modalidad", nextFormats[0])
      else next.delete("modalidad")
    }
    setParams(next, { replace: true })
  }

  const selectModality = (event) => {
    const next = new URLSearchParams(params)
    next.set("modalidad", event.target.value)
    setParams(next, { replace: true })
  }

  const finishPayment = (event) => {
    event.preventDefault()
    if (!course) return
    const form = new FormData(event.currentTarget)
    const enrollment = addEnrollment({
      name: String(form.get("name")),
      email: String(form.get("email")),
      dni: String(form.get("dni")),
      phone: String(form.get("phone")),
      shift: String(form.get("shift")),
      courseId: course.id,
      modality,
      amount: initialPayment,
      payment: "aprobado",
      status: "nuevo",
      source: "web",
    })
    setDone({
      name: enrollment.name,
      email: enrollment.email,
      course: course.title,
      total: initialPayment,
      code: enrollment.code,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (done) {
    return (
      <main id="main-content" className="page-checkout checkout-success-page">
        <section className="enrollment-success" aria-live="polite">
          <div className="success-seal" aria-hidden="true">✓</div>
          <p className="section-kicker">Inscripción confirmada</p>
          <h1>Gracias por invertir en tu futuro, {done.name.split(" ")[0]}.</h1>
          <p className="success-lead">Tu inscripción quedó registrada y el pago de <strong>{formatMoney(done.total)}</strong> figura aprobado.</p>

          <div className="payment-approved">
            <span className="mp-logo" aria-hidden="true" translate="no">mp</span>
            <span><small>Estado del pago</small><strong>Pago aprobado</strong></span>
            <em translate="no">Mercado Pago</em>
          </div>

          <dl className="success-reference">
            <div><dt>Curso</dt><dd>{done.course}</dd></div>
            <div><dt>Número de inscripción</dt><dd>{done.code}</dd></div>
          </dl>

          <div className="success-next">
            <h2>¿Qué sigue ahora?</h2>
            <div className="success-next-grid">
              <article><span aria-hidden="true">01</span><strong>Comprobante por email</strong><p>Lo vas a recibir en {done.email} con el detalle de tu pago.</p></article>
              <article><span aria-hidden="true">02</span><strong>Factura de inscripción</strong><p>La administración te enviará la factura correspondiente al mismo correo.</p></article>
              <article><span aria-hidden="true">03</span><strong>Contacto por WhatsApp</strong><p>El equipo te escribirá para confirmar horarios, documentación e inicio.</p></article>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/" className="btn btn-enroll">Volver al inicio</Link>
            <Link to="/#catalogo" className="btn btn-line-ink">Explorar otros cursos</Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main id="main-content" className="page-checkout">
      <header className="checkout-head">
        <p className="section-kicker">Inscripción directa</p>
        <h1>Un paso para empezar.</h1>
        <p>Completá tus datos, revisá la inversión final y continuá de forma segura con Mercado Pago.</p>
      </header>

      <form className="checkout-grid" onSubmit={finishPayment}>
        <section className="panel-form checkout-form">
          <div className="checkout-form-title">
            <span>1</span>
            <div><h2>Tus datos</h2><p>Los usaremos para emitir la factura y coordinar el inicio.</p></div>
          </div>

          <label className="full">
            Curso
            <select name="course" value={course?.id || ""} onChange={selectCourse} autoComplete="off" required>
              <option value="">Elegí el curso en el que querés inscribirte…</option>
              {courses.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
            </select>
          </label>
          <label>Nombre y apellido<input required name="name" autoComplete="name" /></label>
          <label>DNI<input required name="dni" inputMode="numeric" autoComplete="off" /></label>
          <label>Correo<input required type="email" name="email" autoComplete="email" spellCheck={false} /></label>
          <label>Teléfono<input required type="tel" name="phone" autoComplete="tel" inputMode="tel" /></label>
          <label className="full">
            Turno preferido
            <select name="shift" defaultValue={course?.shift || "Tarde"} autoComplete="off">
              <option>Mañana</option>
              <option>Tarde</option>
              <option>Noche</option>
              <option>A confirmar</option>
            </select>
          </label>
          {formats.length > 1 ? (
            <label className="full">
              Modalidad
              <select name="modality" value={modality} onChange={selectModality}>
                {formats.map((id) => (
                  <option key={id} value={id}>
                    {modalityById.get(id)?.label} · {id === "presencial" ? "Liceo Laprida" : "Red Laprida"}
                  </option>
                ))}
              </select>
            </label>
          ) : <input type="hidden" name="modality" value={modality} />}

          <div className="payment-only full">
            <div className="checkout-form-title compact">
              <span>2</span>
              <div><h2>Pago</h2><p>Mercado Pago es el medio habilitado para completar la inscripción.</p></div>
            </div>
            <div className="mercadopago-choice" aria-label="Medio de pago: Mercado Pago">
              <span className="mp-logo" aria-hidden="true" translate="no">mp</span>
              <span><strong translate="no">Mercado Pago</strong><small>Pago protegido y confirmación inmediata</small></span>
              <em>Única opción</em>
            </div>
          </div>

          <button className="btn btn-mercadopago btn-full" type="submit" disabled={!course}>
            <span className="mp-mini" aria-hidden="true" translate="no">mp</span>
            Pagar con Mercado Pago
          </button>
          <p className="fine-print">Esta versión presenta el recorrido visual. La conexión real con Mercado Pago se incorporará en la siguiente etapa.</p>
        </section>

        <aside className="checkout-summary enrollment-summary" aria-live="polite">
          <p className="section-kicker">Tu inscripción</p>
          {course ? (
            <>
              <div className="summary-course" style={{ "--accent": category?.color }}>
                <img
                  src={course.image}
                  alt=""
                  width="1400"
                  height="900"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = "/class-team.webp"
                  }}
                />
                <div><span>{category?.name}</span><h2>{course.title}</h2><p>{course.durationMonths} meses · {modalityById.get(modality)?.label || course.shift}</p></div>
              </div>
              {discount > 0 ? <p className="summary-benefit">{hasGroupBenefit ? "10% de beneficio para cada integrante del grupo" : `${discount}% de descuento promocional aplicado`}</p> : null}
              <dl>
                <div><dt>Matrícula</dt><dd>{formatMoney(course.matricula)}</dd></div>
                <div><dt>Cuota mensual</dt><dd>{formatMoney(monthlyPrice)}</dd></div>
                <div><dt>Duración</dt><dd>{course.durationMonths} cuotas</dd></div>
                <div><dt>Inversión total del curso</dt><dd>{formatMoney(fullPrice)}</dd></div>
              </dl>
              <div className="summary-total">
                <span>Pagás hoy</span>
                <strong>{formatMoney(initialPayment)}</strong>
                <small>Matrícula + primera cuota</small>
              </div>
            </>
          ) : (
            <div className="summary-empty">
              <span aria-hidden="true">{brand.short}</span>
              <h2>Elegí un curso</h2>
              <p>Acá vas a ver el precio final y el detalle completo antes de pagar.</p>
            </div>
          )}
        </aside>
      </form>
    </main>
  )
}
