import { lazy, Suspense } from "react"
import { Link } from "react-router-dom"
import { modalities } from "../data/institution"
import { useSite } from "../site/SiteContext"
import { IconArrow, IconClock, IconFacebook, IconGmail, IconInstagram, IconPhone, IconPin, IconWhatsApp } from "./Icons"

const LiceoMap = lazy(() => import("./LiceoMap"))

function hourLabel(open, close) {
  if (!open || !close) return "Cerrado"
  const trim = (value) => value.replace(/^0/, "")
  return `${trim(open)} a ${trim(close)}`
}

export default function ContactSection() {
  const { institution, brand, content } = useSite()
  const byDay = new Map(institution.hours.map((item) => [item.day, item]))
  const weekdayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
  const weekdays = weekdayNames.map((day) => byDay.get(day))
  const sameWeek = weekdays.every((item) => item?.open === weekdays[0]?.open && item?.close === weekdays[0]?.close)
  const saturday = byDay.get("Sábado")
  const sunday = byDay.get("Domingo")
  const schedule = [
    ...(sameWeek
      ? [{ label: "Lunes a viernes", value: hourLabel(weekdays[0]?.open, weekdays[0]?.close) }]
      : weekdayNames.map((day) => {
          const item = byDay.get(day)
          return { label: day, value: hourLabel(item?.open, item?.close) }
        })),
    { label: "Sábados", value: hourLabel(saturday?.open, saturday?.close) },
    { label: "Domingos", value: hourLabel(sunday?.open, sunday?.close) },
  ]
  const digital = modalities.filter((item) => item.id !== "presencial")

  return (
    <section id="contacto" className="home-contact snap-section" aria-label="Ubicación y contacto">
      <div className="contact-halves">
        <article className="contact-liceo" aria-labelledby="contacto-liceo">
          <div className="contact-liceo-brand">
            <span className="contact-liceo-logo">
              <img src="/logo.png" alt="" />
            </span>
            <div>
              <small>Sede presencial</small>
              <h2 id="contacto-liceo">{institution.name}</h2>
            </div>
          </div>

          <div className="contact-liceo-main">
            <div className="contact-facts">
              <p className="contact-line">
                <IconPin />
                <span>
                  {institution.legalName}<br />
                  {institution.address}<br />
                  {institution.postal} {institution.locality}
                </span>
              </p>
              <p className="contact-line">
                <IconClock />
                <span className="contact-hours">
                  {schedule.map((item) => (
                    <span key={item.label}><em>{item.label}</em> {item.value}</span>
                  ))}
                </span>
              </p>
              <p className="contact-line">
                <IconPhone />
                <a href={`tel:+${institution.phoneRaw}`}>{institution.phone}</a>
              </p>

              <div className="contact-actions" aria-label="Canales del Liceo Laprida">
                <a className="contact-whatsapp" href={institution.whatsapp} target="_blank" rel="noreferrer">
                  <IconWhatsApp />
                  <span><strong>WhatsApp</strong><small>Consultas directas</small></span>
                </a>
                <a className="contact-mail" href={`mailto:${institution.email}`}>
                  <IconGmail />
                  <span><strong>Correo</strong><small>{institution.email}</small></span>
                </a>
                <a className="contact-instagram" href={institution.instagram} target="_blank" rel="noreferrer">
                  <IconInstagram />
                  <span><strong>Instagram</strong><small>{institution.instagramHandle}</small></span>
                </a>
                <a className="contact-facebook" href={institution.facebook} target="_blank" rel="noreferrer">
                  <IconFacebook />
                  <span><strong>Facebook</strong><small>Liceo Laprida</small></span>
                </a>
              </div>
            </div>

            <div className="contact-map">
              <Suspense fallback={<div className="map-loading" role="status">Cargando mapa…</div>}>
                <LiceoMap />
              </Suspense>
            </div>
          </div>
        </article>

        <article className="contact-red" aria-labelledby="contacto-red">
          <div className="contact-red-lockup">
            <span className="contact-red-sigil" aria-hidden="true">R</span>
            <h2 id="contacto-red">
              <span className="contact-red-word">
                <span>RED</span>
                Laprida
              </span>
            </h2>
          </div>
          <p className="contact-red-lead">{brand.tagline}</p>
          <div className="contact-red-formats">
            {digital.map((item) => (
              <div key={item.id} className={`contact-red-format contact-red-${item.id}`}>
                <strong>{item.name}</strong>
                <p>{content.catalogCopy?.[item.id]?.detail || item.detail}</p>
                <Link to={`/cursos?modalidad=${item.id}`}>
                  Ver cursos {item.name.toLocaleLowerCase("es")} <IconArrow />
                </Link>
              </div>
            ))}
          </div>
          <p className="contact-red-note">La cursada digital no tiene sede. El material está en el campus.</p>
        </article>
      </div>
    </section>
  )
}
