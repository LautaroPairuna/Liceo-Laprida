import { useDeferredValue, useEffect, useMemo } from "react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { courseFormats } from "../data/courses"
import { accentFor, inkOn, intakes, modalities, modalityById } from "../data/institution"
import { useSite } from "../site/SiteContext"
import CatalogRow from "../components/CatalogRow"
import { IconBuilding, IconClock, IconGmail, IconPhone, IconPin, IconWhatsApp } from "../components/Icons"

function hourLabel(open, close) {
  if (!open || !close) return "Cerrado"
  const trim = (value) => value.replace(/^0/, "")
  return `${trim(open)} a ${trim(close)}`
}

function sedeSchedule(institution) {
  const byDay = new Map(institution.hours.map((item) => [item.day, item]))
  const weekdayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
  const weekdays = weekdayNames.map((day) => byDay.get(day))
  const sameWeek = weekdays.every((item) => item?.open === weekdays[0]?.open && item?.close === weekdays[0]?.close)
  const saturday = byDay.get("Sábado")
  const sunday = byDay.get("Domingo")
  return [
    ...(sameWeek
      ? [{ label: "Lunes a viernes", value: hourLabel(weekdays[0]?.open, weekdays[0]?.close) }]
      : weekdayNames.map((day) => {
          const item = byDay.get(day)
          return { label: day, value: hourLabel(item?.open, item?.close) }
        })),
    { label: "Sábados", value: hourLabel(saturday?.open, saturday?.close) },
    { label: "Domingos", value: hourLabel(sunday?.open, sunday?.close) },
  ]
}

function PresencialFacts() {
  const { institution } = useSite()
  const schedule = sedeSchedule(institution)
  const [mailbox, domain = ""] = String(institution.email || "").split("@")

  return (
    <div className="catalog-banner-facts">
      <article className="catalog-fact">
        <p className="catalog-fact-title">
          <span className="catalog-fact-icon" aria-hidden="true"><IconPin /></span>
          Ubicación
        </p>
        <p>
          {institution.address}
          <br />
          {institution.postal} {institution.locality}
        </p>
        <Link className="catalog-fact-map" to="/#contacto">Ver la sede</Link>
      </article>

      <article className="catalog-fact">
        <p className="catalog-fact-title">
          <span className="catalog-fact-icon" aria-hidden="true"><IconPhone /></span>
          Contacto
        </p>
        <ul className="catalog-fact-list">
          <li>
            <span className="catalog-fact-mark" aria-hidden="true"><IconPhone /></span>
            <a href={`tel:+${institution.phoneRaw}`}>{institution.phone}</a>
          </li>
          <li>
            <span className="catalog-fact-mark catalog-fact-mark-wa" aria-hidden="true"><IconWhatsApp /></span>
            <a href={institution.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          </li>
          <li>
            <span className="catalog-fact-mark" aria-hidden="true"><IconGmail /></span>
            <a href={`mailto:${institution.email}`}>
              {mailbox}
              <wbr />
              @{domain}
            </a>
          </li>
        </ul>
      </article>

      <article className="catalog-fact">
        <p className="catalog-fact-title">
          <span className="catalog-fact-icon" aria-hidden="true"><IconBuilding /></span>
          Datos generales
        </p>
        <p className="catalog-fact-name">{institution.legalName}</p>
        <div className="catalog-fact-hours-wrap">
          <span className="catalog-fact-mark" aria-hidden="true"><IconClock /></span>
          <ul className="catalog-fact-hours">
            {schedule.map((item) => (
              <li key={item.label}><span>{item.label}</span> {item.value}</li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  )
}

function DigitalAside({ modality }) {
  const { content } = useSite()
  const items = (content.catalogCopy?.[modality]?.points || []).filter(Boolean)

  return (
    <aside className="catalog-banner-aside" aria-label="Cómo se cursa">
      <ul className="catalog-banner-points">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </aside>
  )
}

function CatalogBanner({ modality }) {
  const { content } = useSite()
  const copy = content.catalogCopy?.[modality] || { title: "", lead: "" }
  const digital = modality !== "presencial"
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <section className={`catalog-banner${digital ? "" : " catalog-banner-media"}`} aria-labelledby="catalog-title">
      {digital ? null : (
        <div className="catalog-banner-video" aria-hidden="true">
          <video autoPlay={!prefersReducedMotion} muted loop playsInline poster="/catalog-sede-poster.jpg" preload="metadata">
            <source src="/catalog-sede.mp4" type="video/mp4" />
          </video>
        </div>
      )}
      <div className={`catalog-banner-inner${digital ? "" : " catalog-banner-inner-liceo"}`}>
        {digital ? (
          <span className="format-lockup catalog-lockup">
            <span className="format-sigil" aria-hidden="true">R</span>
            <span className="format-word">
              <span className="format-red">RED</span>
              <span className="format-name">LAPRIDA</span>
            </span>
          </span>
        ) : (
          <span className="catalog-banner-logo">
            <img src="/logo.png" alt="Liceo Profesional Laprida" />
          </span>
        )}
        <div className="catalog-banner-copy">
          <Link className="catalog-back" to="/#catalogo">Elegir otro formato</Link>
          <h1 id="catalog-title">{copy.title}</h1>
          <p>{copy.lead}</p>
        </div>
        {digital ? <DigitalAside modality={modality} /> : <PresencialFacts />}
      </div>
    </section>
  )
}

export default function Catalog() {
  const { courses, categories, categoryById } = useSite()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const requestedModality = params.get("modalidad")
  const modality = modalityById.has(requestedModality) ? requestedModality : null

  useEffect(() => {
    if (!modality) return undefined
    window.scrollTo({ top: 0, behavior: "instant" })
    return undefined
  }, [modality])

  const activeModality = modality ? modalityById.get(modality) : null
  const requestedArea = params.get("area") || "all"
  const query = params.get("q") || ""
  const duration = params.get("duracion") || "all"
  const inicio = params.get("inicio") || "all"
  const deferredQuery = useDeferredValue(query)
  const visibleCategories = categories.filter((category) => (category.modes || ["presencial"]).includes(modality))
  const areaOk = requestedArea === "all" || visibleCategories.some((category) => category.id === requestedArea)
  const area = areaOk ? requestedArea : "all"

  const updateParams = (changes) => {
    const next = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === "all") next.delete(key)
      else next.set(key, String(value))
    }
    if (!modalityById.has(next.get("modalidad"))) next.set("modalidad", modality)
    const nextModality = next.get("modalidad")
    const nextArea = next.get("area")
    if (nextArea && !(categoryById.get(nextArea)?.modes || []).includes(nextModality)) next.delete("area")
    navigate({ pathname: "/cursos", search: `?${next.toString()}` }, { replace: true })
  }

  const setModality = (nextId) => {
    const areaStillExists = area !== "all" && (categoryById.get(area)?.modes || []).includes(nextId)
    updateParams({ modalidad: nextId, ...(areaStillExists ? {} : { area: "all" }) })
  }

  const filtered = useMemo(() => {
    if (!modality) return []
    const normalizedQuery = deferredQuery.toLocaleLowerCase("es").trim()
    return courses.filter((course) => {
      const matchModality = courseFormats(course).includes(modality)
      const matchArea = area === "all" || course.category === area
      const categoryName = categories.find((item) => item.id === course.category)?.name || ""
      const haystack = `${course.title} ${course.summary} ${categoryName}`.toLocaleLowerCase("es")
      const matchQuery = !normalizedQuery || haystack.includes(normalizedQuery)
      const matchDuration =
        duration === "all" ||
        (duration === "short" && course.durationMonths <= 3) ||
        (duration === "mid" && course.durationMonths >= 4 && course.durationMonths <= 6) ||
        (duration === "long" && course.durationMonths >= 7)
      const matchStart = inicio === "all" || course.intakeId === inicio
      return matchModality && matchArea && matchQuery && matchDuration && matchStart
    })
  }, [area, categories, courses, deferredQuery, duration, inicio, modality])

  if (!modality) return <Navigate to="/#catalogo" replace />

  const narrowing = area !== "all" || query || duration !== "all" || inicio !== "all"
  const motionKey = `${modality}|${area}|${duration}|${inicio}`
  const clearFilters = () => updateParams({ area: "all", q: "", duracion: "all", inicio: "all" })
  const noun = filtered.length === 1 ? "curso" : "cursos"
  const modeName = filtered.length === 1
    ? activeModality.label.toLocaleLowerCase("es")
    : activeModality.name.toLocaleLowerCase("es")
  const areaName = area !== "all" ? categoryById.get(area)?.name : null
  const countLabel = areaName ? `${filtered.length} ${noun} de ${areaName}` : `${filtered.length} ${noun} ${modeName}`

  return (
    <main id="main-content" className={`page-catalog catalog-theme-${modality}`}>
      <CatalogBanner modality={modality} />
      <div className="catalog-workspace">
        <div className="area-rail" key={modality} role="group" aria-label={`Categorías ${activeModality.label.toLocaleLowerCase("es")}`}>
          {visibleCategories.map((category) => {
            const color = accentFor(modality, category.id)
            return (
              <button
                type="button"
                aria-pressed={area === category.id}
                key={category.id}
                className={area === category.id ? "is-active" : ""}
                style={{ "--accent": color, "--ink": inkOn(color) }}
                onClick={() => updateParams({ area: area === category.id ? "all" : category.id })}
              >
                {category.name}
              </button>
            )
          })}
        </div>

        <div className="catalog-browse">
          <form className="catalog-filters" role="search" aria-label="Filtrar cursos" onSubmit={(event) => event.preventDefault()}>
            <p className="catalog-filters-title">Filtrar</p>
            <label className="catalog-search">
              <span>Buscar</span>
              <input
                type="search"
                name="course-search"
                value={query}
                onChange={(event) => updateParams({ q: event.target.value })}
                placeholder="Ej.: farmacia, Excel, refrigeración…"
                autoComplete="off"
              />
            </label>
            <label>
              <span>Inicio del cursado</span>
              <select value={inicio} onChange={(event) => updateParams({ inicio: event.target.value })}>
                <option value="all">Cualquier inicio</option>
                {intakes.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Modalidad</span>
              <select value={modality} onChange={(event) => setModality(event.target.value)}>
                {modalities.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Categoría</span>
              <select
                value={area}
                onChange={(event) => updateParams({ area: event.target.value })}
                style={area !== "all" ? { boxShadow: `inset 4px 0 0 ${accentFor(modality, area)}` } : undefined}
              >
                <option value="all">Todas</option>
                {visibleCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Duración</span>
              <select value={duration} onChange={(event) => updateParams({ duracion: event.target.value })}>
                <option value="all">Todas</option>
                <option value="short">Hasta 3 meses</option>
                <option value="mid">De 4 a 6 meses</option>
                <option value="long">7 meses o más</option>
              </select>
            </label>
            {narrowing ? (
              <button type="button" className="btn btn-line-ink catalog-clear" onClick={clearFilters}>
                Limpiar filtros
              </button>
            ) : null}
          </form>

          <div className="catalog-board">
            <p className="catalog-count">{countLabel}</p>
            <div className="catalog-results" key={motionKey}>
              {filtered.length === 0 ? (
                <div className="empty-state">
                  {area === "mineria" ? (
                    <>
                      <h3>Los cursos de Minería se están definiendo.</h3>
                      <p>El área ya está en el catálogo. Los nombres se suman cuando estén confirmados.</p>
                    </>
                  ) : (
                    <>
                      <h3>No hay cursos {activeModality.name.toLocaleLowerCase("es")} con esos filtros.</h3>
                      <p>Probá otro inicio, otra categoría o una búsqueda más amplia.</p>
                    </>
                  )}
                  <button type="button" className="btn btn-solid" onClick={clearFilters}>
                    Ver los {activeModality.name.toLocaleLowerCase("es")}
                  </button>
                </div>
              ) : (
                <div className="catalog-grid">
                  {filtered.map((course) => (
                    <CatalogRow
                      key={course.id}
                      course={course}
                      modalityId={modality}
                      modalityLabel={activeModality.label}
                      accent={accentFor(modality, course.category)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
