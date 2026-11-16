import { useState } from "react"
import { useSite } from "../site/SiteContext"
import { Field, ImageField } from "./fields"

const SECTIONS = [
  { id: "hero", label: "Portada", href: "/#inicio" },
  { id: "learning", label: "Aprender haciendo", href: "/#aprender-title" },
  { id: "story", label: "La institución", href: "/#institucion" },
  { id: "reviews", label: "Reseñas", href: "/#alumnos" },
  { id: "contact", label: "Sede y contacto", href: "/#contacto" },
  { id: "offers", label: "Ofertas", href: "/#ofertas" },
  { id: "categories", label: "Áreas", href: "/cursos?modalidad=presencial" },
  { id: "catalogCopy", label: "Textos del catálogo", href: "/cursos?modalidad=presencial" },
  { id: "brand", label: "Marca", href: "/" },
]

const MODES = [
  { id: "presencial", label: "Presencial" },
  { id: "hibrido", label: "Híbrido" },
  { id: "virtual", label: "Virtual" },
]

function validate(section, draft) {
  if (section === "hero" && !String(draft.title || "").trim()) return "La portada necesita un título."
  if (section === "learning" && !String(draft.title || "").trim()) return "Esta sección necesita un título."
  if (section === "story" && !String(draft.title || "").trim()) return "La institución necesita un título."
  if (section === "contact" && !String(draft.legalName || "").trim()) return "La sede necesita un nombre."
  if (section === "offers" && draft.courses.some((item) => !item.id)) return "Cada promoción necesita un curso."
  if (section === "categories" && draft.some((item) => !String(item.name || "").trim())) return "Cada área necesita un nombre."
  if (section === "categories" && draft.some((item) => !item.modes?.length)) return "Cada área necesita al menos una modalidad."
  if (section === "brand" && !String(draft.tagline || "").trim()) return "La marca necesita una frase."
  return ""
}

function withPhone(draft) {
  const phoneRaw = String(draft.phone || "").replace(/\D/g, "")
  return { ...draft, phoneRaw: phoneRaw || draft.phoneRaw }
}

function HeroFields({ draft, onChange }) {
  const set = (key, value) => onChange((current) => ({ ...current, [key]: value }))
  const setNote = (index, value) => onChange({ ...draft, notes: draft.notes.map((item, i) => (i === index ? value : item)) })
  return (
    <div className="fields">
      <Field className="span" label="Título"><input value={draft.title} onChange={(event) => set("title", event.target.value)} /></Field>
      <Field className="span" label="Texto"><textarea value={draft.lead} onChange={(event) => set("lead", event.target.value)} /></Field>
      <Field label="Botón"><input value={draft.cta} onChange={(event) => set("cta", event.target.value)} /></Field>
      <Field label="Video" hint="Archivo .mp4. Si lo dejás vacío, se ve la foto."><input value={draft.video} onChange={(event) => set("video", event.target.value)} /></Field>
      <ImageField label="Foto de la portada" value={draft.poster} onChange={(value) => set("poster", value)} />
      {draft.notes.map((note, index) => (
        <Field key={index} label={`Frase ${index + 1} del pie`}><input value={note} onChange={(event) => setNote(index, event.target.value)} /></Field>
      ))}
    </div>
  )
}

function LearningFields({ draft, onChange }) {
  const set = (key, value) => onChange((current) => ({ ...current, [key]: value }))
  const setPhoto = (index, patch) => onChange((current) => ({
    ...current,
    photos: current.photos.map((photo, i) => (i === index ? { ...photo, ...patch } : photo)),
  }))
  return (
    <div className="fields">
      <Field label="Rótulo"><input value={draft.kicker} onChange={(event) => set("kicker", event.target.value)} /></Field>
      <Field label="Botón"><input value={draft.cta} onChange={(event) => set("cta", event.target.value)} /></Field>
      <Field className="span" label="Título"><input value={draft.title} onChange={(event) => set("title", event.target.value)} /></Field>
      <Field className="span" label="Texto"><textarea value={draft.text} onChange={(event) => set("text", event.target.value)} /></Field>
      {draft.photos.map((photo, index) => (
        <div className="span" key={index}>
          <ImageField label={index === 0 ? "Foto grande" : `Foto ${index + 1}`} value={photo.src} onChange={(value) => setPhoto(index, { src: value })} />
          <div className="fields">
            <Field label="Epígrafe"><input value={photo.caption} onChange={(event) => setPhoto(index, { caption: event.target.value })} /></Field>
            <Field label="Descripción de la foto" hint="La lee quien no ve la imagen."><input value={photo.alt} onChange={(event) => setPhoto(index, { alt: event.target.value })} /></Field>
          </div>
        </div>
      ))}
    </div>
  )
}

function StoryFields({ draft, onChange }) {
  const set = (key, value) => onChange((current) => ({ ...current, [key]: value }))
  const setMilestone = (index, patch) => onChange({
    ...draft,
    milestones: draft.milestones.map((item, i) => {
      if (i !== index) return item
      const next = { ...item, ...patch }
      if ("year" in patch) next.dateTime = /^\d{4}$/.test(patch.year) ? patch.year : null
      return next
    }),
  })
  return (
    <div className="fields">
      <Field className="span" label="Título"><input value={draft.title} onChange={(event) => set("title", event.target.value)} /></Field>
      <Field className="span" label="Texto"><textarea value={draft.lead} onChange={(event) => set("lead", event.target.value)} /></Field>
      {draft.milestones.map((item, index) => (
        <div className="repeat-block span" key={index}>
          <div className="repeat-head">
            <strong>Hito {index + 1}</strong>
            <button type="button" className="linkish" onClick={() => onChange({ ...draft, milestones: draft.milestones.filter((_, i) => i !== index) })}>Quitar</button>
          </div>
          <div className="fields">
            <Field label="Año"><input value={item.year} onChange={(event) => setMilestone(index, { year: event.target.value })} /></Field>
            <Field label="Título"><input value={item.title} onChange={(event) => setMilestone(index, { title: event.target.value })} /></Field>
            <Field className="span" label="Texto"><textarea value={item.text} onChange={(event) => setMilestone(index, { text: event.target.value })} /></Field>
          </div>
        </div>
      ))}
      <div className="span">
        <button type="button" className="admin-btn" onClick={() => onChange({ ...draft, milestones: [...draft.milestones, { year: "", dateTime: null, title: "", text: "" }] })}>Agregar hito</button>
      </div>
      <Field label="Título de propósito"><input value={draft.purposeTitle} onChange={(event) => set("purposeTitle", event.target.value)} /></Field>
      <Field label="Título de visión"><input value={draft.visionTitle} onChange={(event) => set("visionTitle", event.target.value)} /></Field>
      <Field className="span" label="Propósito"><textarea value={draft.purpose} onChange={(event) => set("purpose", event.target.value)} /></Field>
      <Field className="span" label="Visión"><textarea value={draft.vision} onChange={(event) => set("vision", event.target.value)} /></Field>
      <ImageField label="Foto de la fachada" value={draft.facade} onChange={(value) => set("facade", value)} hint="Si no hay foto, la web muestra el espacio reservado." />
      <Field className="span" label="Descripción de la fachada"><input value={draft.facadeAlt} onChange={(event) => set("facadeAlt", event.target.value)} /></Field>
    </div>
  )
}

function ReviewsFields({ draft, onChange }) {
  const set = (key, value) => onChange((current) => ({ ...current, [key]: value }))
  const setItem = (index, patch) => onChange({
    ...draft,
    items: draft.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
  })
  return (
    <div className="fields">
      <Field label="Puntaje" hint="El número grande de la franja."><input type="number" min="0" max="5" step="0.1" value={draft.average} onChange={(event) => set("average", Number(event.target.value))} /></Field>
      <Field label="Cantidad de opiniones"><input type="number" min="0" value={draft.count} onChange={(event) => set("count", Number(event.target.value))} /></Field>
      {draft.items.map((item, index) => (
        <div className="repeat-block span" key={index}>
          <div className="repeat-head">
            <strong>{item.name || `Reseña ${index + 1}`}</strong>
            <button type="button" className="linkish" onClick={() => onChange({ ...draft, items: draft.items.filter((_, i) => i !== index) })}>Quitar</button>
          </div>
          <div className="fields">
            <Field label="Nombre"><input value={item.name} onChange={(event) => setItem(index, { name: event.target.value })} /></Field>
            <Field label="Curso"><input value={item.course} onChange={(event) => setItem(index, { course: event.target.value })} /></Field>
            <Field label="Fecha"><input value={item.date} onChange={(event) => setItem(index, { date: event.target.value })} /></Field>
            <Field label="Estrellas">
              <select value={item.rating} onChange={(event) => setItem(index, { rating: Number(event.target.value) })}>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </Field>
            <Field className="span" label="Frase"><textarea value={item.quote} onChange={(event) => setItem(index, { quote: event.target.value })} /></Field>
            <label className="check-line"><input type="checkbox" checked={Boolean(item.featured)} onChange={(event) => setItem(index, { featured: event.target.checked })} /> Destacada</label>
          </div>
        </div>
      ))}
      <div className="span">
        <button type="button" className="admin-btn" onClick={() => onChange({ ...draft, items: [...draft.items, { name: "", role: "Alumno", course: "", rating: 5, date: "", quote: "", featured: false }] })}>Agregar reseña</button>
      </div>
    </div>
  )
}

function ContactFields({ draft, onChange }) {
  const set = (key, value) => onChange((current) => ({ ...current, [key]: value }))
  const setHour = (index, patch) => onChange({
    ...draft,
    hours: draft.hours.map((item, i) => (i === index ? { ...item, ...patch } : item)),
  })
  return (
    <div className="fields">
      <Field label="Nombre de la sede"><input value={draft.name} onChange={(event) => set("name", event.target.value)} /></Field>
      <Field label="Nombre completo"><input value={draft.legalName} onChange={(event) => set("legalName", event.target.value)} /></Field>
      <Field className="span" label="Dirección"><input value={draft.address} onChange={(event) => set("address", event.target.value)} /></Field>
      <Field label="Código postal"><input value={draft.postal} onChange={(event) => set("postal", event.target.value)} /></Field>
      <Field label="Localidad"><input value={draft.locality} onChange={(event) => set("locality", event.target.value)} /></Field>
      <Field label="Provincia"><input value={draft.province} onChange={(event) => set("province", event.target.value)} /></Field>
      <Field label="Teléfono" hint="Se usa también para llamar."><input value={draft.phone} onChange={(event) => set("phone", event.target.value)} /></Field>
      <Field label="Correo"><input type="email" value={draft.email} onChange={(event) => set("email", event.target.value)} /></Field>
      <Field className="span" label="WhatsApp" hint="Enlace completo, por ejemplo https://wa.me/542645808222"><input value={draft.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} /></Field>
      <Field label="Instagram"><input value={draft.instagramHandle} onChange={(event) => set("instagramHandle", event.target.value)} /></Field>
      <Field label="Enlace de Instagram"><input value={draft.instagram} onChange={(event) => set("instagram", event.target.value)} /></Field>
      <Field className="span" label="Facebook"><input value={draft.facebook} onChange={(event) => set("facebook", event.target.value)} /></Field>
      <div className="span">
        <span className="field-label">Horarios</span>
        <div className="hours">
          {draft.hours.map((row, index) => (
            <div className="hours-row" key={row.day}>
              <span>{row.day}</span>
              <input aria-label={`${row.day}, abre`} type="time" value={row.open || ""} onChange={(event) => setHour(index, { open: event.target.value || null })} />
              <input aria-label={`${row.day}, cierra`} type="time" value={row.close || ""} onChange={(event) => setHour(index, { close: event.target.value || null })} />
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={!row.open && !row.close}
                  onChange={(event) => setHour(index, event.target.checked ? { open: null, close: null } : { open: "08:30", close: "20:30" })}
                />
                Cerrado
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OffersFields({ draft, onChange }) {
  const { courses } = useSite()
  const sorted = [...courses].sort((a, b) => a.title.localeCompare(b.title, "es"))
  const set = (key, value) => onChange((current) => ({ ...current, [key]: value }))
  const setOffer = (index, patch) => onChange({
    ...draft,
    courses: draft.courses.map((item, i) => (i === index ? { ...item, ...patch } : item)),
  })
  return (
    <div className="fields">
      <Field className="span" label="Título de la sección"><input value={draft.title} onChange={(event) => set("title", event.target.value)} /></Field>
      {draft.courses.map((offer, index) => (
        <div className="repeat-block span" key={index}>
          <div className="repeat-head">
            <strong>Promoción {index + 1}</strong>
            <button type="button" className="linkish" onClick={() => onChange({ ...draft, courses: draft.courses.filter((_, i) => i !== index) })}>Quitar</button>
          </div>
          <div className="fields">
            <Field className="span" label="Curso">
              <select value={offer.id} onChange={(event) => setOffer(index, { id: event.target.value })}>
                <option value="">Elegí un curso…</option>
                {sorted.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </Field>
            <Field label="Descuento %" hint="Sobre la cuota."><input type="number" min="0" max="80" value={offer.discount} onChange={(event) => setOffer(index, { discount: event.target.value })} /></Field>
            <Field label="Inicio"><input type="date" value={offer.start} onChange={(event) => setOffer(index, { start: event.target.value })} /></Field>
            <Field label="Vigente hasta"><input type="date" value={offer.deadline} onChange={(event) => setOffer(index, { deadline: event.target.value })} /></Field>
          </div>
        </div>
      ))}
      <div className="span">
        <button type="button" className="admin-btn" onClick={() => onChange({ ...draft, courses: [...draft.courses, { id: "", discount: 10, start: "", deadline: "" }] })}>Agregar promoción</button>
      </div>
      <div className="repeat-block span">
        <strong>Beneficio de grupo</strong>
        <div className="fields">
          <Field label="Título"><input value={draft.group.title} onChange={(event) => set("group", { ...draft.group, title: event.target.value })} /></Field>
          <Field label="Valor visible"><input value={draft.group.value} onChange={(event) => set("group", { ...draft.group, value: event.target.value })} /></Field>
          <Field className="span" label="Aclaración"><input value={draft.group.valueNote} onChange={(event) => set("group", { ...draft.group, valueNote: event.target.value })} /></Field>
          <Field label="Vigente hasta"><input type="date" value={draft.group.deadline} onChange={(event) => set("group", { ...draft.group, deadline: event.target.value })} /></Field>
          <ImageField label="Foto" value={draft.group.image} onChange={(value) => onChange((current) => ({ ...current, group: { ...current.group, image: value } }))} />
        </div>
      </div>
    </div>
  )
}

function CategoriesFields({ draft, onChange }) {
  const update = (index, patch) => onChange((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const toggleMode = (index, mode) => {
    const current = draft[index].modes || []
    const next = current.includes(mode) ? current.filter((id) => id !== mode) : [...current, mode]
    update(index, { modes: MODES.map((item) => item.id).filter((id) => next.includes(id)) })
  }
  return (
    <div className="fields">
      <p className="span page-lead">El nombre y las modalidades se ven en el catálogo. Presencial pertenece al Liceo. Híbrido y virtual, a Red Laprida.</p>
      {draft.map((category, index) => (
        <div className="repeat-block span" key={category.id}>
          <div className="fields">
            <Field label="Nombre"><input value={category.name} onChange={(event) => update(index, { name: event.target.value, short: event.target.value })} /></Field>
            <div>
              <span className="field-label">Modalidades</span>
              <div className="checks">
                {MODES.map((mode) => (
                  <label key={mode.id}>
                    <input type="checkbox" checked={category.modes?.includes(mode.id)} onChange={() => toggleMode(index, mode.id)} />
                    {mode.label}
                  </label>
                ))}
              </div>
            </div>
            <ImageField label="Foto del área" value={category.image} onChange={(value) => update(index, { image: value })} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CatalogCopyFields({ draft, onChange }) {
  const setFormat = (id, patch) => onChange({ ...draft, [id]: { ...draft[id], ...patch } })
  const setPoint = (id, index, value) => setFormat(id, { points: draft[id].points.map((item, i) => (i === index ? value : item)) })
  return (
    <div className="fields">
      {["presencial", "hibrido", "virtual"].map((id) => (
        <div className="repeat-block span" key={id}>
          <h3>{id === "presencial" ? "Liceo Laprida · presencial" : id === "hibrido" ? "Red Laprida · híbrido" : "Red Laprida · virtual"}</h3>
          <div className="fields">
            <Field className="span" label="Título"><input value={draft[id].title} onChange={(event) => setFormat(id, { title: event.target.value })} /></Field>
            <Field className="span" label="Texto"><textarea value={draft[id].lead} onChange={(event) => setFormat(id, { lead: event.target.value })} /></Field>
            <Field className="span" label="Detalle en el inicio"><input value={draft[id].detail} onChange={(event) => setFormat(id, { detail: event.target.value })} /></Field>
            {id === "presencial" ? null : draft[id].points.map((point, index) => (
              <Field key={index} label={`Punto ${index + 1}`}>
                <input value={point} onChange={(event) => setPoint(id, index, event.target.value)} />
              </Field>
            ))}
          </div>
          {id === "presencial" ? null : (
            <button type="button" className="admin-btn" onClick={() => setFormat(id, { points: [...draft[id].points, ""] })}>Agregar punto</button>
          )}
        </div>
      ))}
    </div>
  )
}

function BrandFields({ draft, onChange }) {
  return (
    <div className="fields">
      <Field label="Nombre"><input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} /></Field>
      <Field className="span" label="Frase del pie"><textarea value={draft.tagline} onChange={(event) => onChange({ ...draft, tagline: event.target.value })} /></Field>
    </div>
  )
}

const FIELDS = {
  hero: HeroFields,
  learning: LearningFields,
  story: StoryFields,
  reviews: ReviewsFields,
  contact: ContactFields,
  offers: OffersFields,
  categories: CategoriesFields,
  catalogCopy: CatalogCopyFields,
  brand: BrandFields,
}

function ContentForm({ section, initial, onSave, onRestore, preview }) {
  const [draft, setDraft] = useState(() => structuredClone(initial))
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const Fields = FIELDS[section]

  const save = (event) => {
    event.preventDefault()
    const problem = validate(section, draft)
    if (problem) {
      setError(problem)
      setNotice("")
      return
    }
    const base = section === "contact" ? withPhone(draft) : structuredClone(draft)
    const next = section === "offers"
      ? {
          ...base,
          courses: base.courses.map((item) => ({
            ...item,
            discount: Math.min(80, Math.max(0, Number(item.discount) || 0)),
          })),
        }
      : base
    onSave(section, next)
    setError("")
    setNotice("Guardado. Ya se ve en la web.")
  }

  const restore = () => {
    const ok = window.confirm("¿Restaurar esta sección al contenido original? Se pierden los cambios guardados de esta parte.")
    if (!ok) return
    const fresh = onRestore(section)
    setDraft(structuredClone(fresh))
    setError("")
    setNotice("Sección restaurada.")
  }

  return (
    <form className="editor-card" onSubmit={save}>
      <Fields draft={draft} onChange={setDraft} />
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      {notice ? <p className="notice" role="status">{notice}</p> : null}
      <div className="form-actions">
        <button className="admin-btn admin-btn-save" type="submit">Guardar</button>
        <button className="admin-btn" type="button" onClick={restore}>Restaurar esta sección</button>
        <a className="text-link" href={preview}>Ver en la web</a>
      </div>
    </form>
  )
}

export default function ContentEditor() {
  const { content, updateContent, restoreContent } = useSite()
  const [section, setSection] = useState("hero")
  const current = SECTIONS.find((item) => item.id === section) || SECTIONS[0]

  return (
    <>
      <h1>Contenido</h1>
      <p className="page-lead">Textos y fotos de la web. Lo que guardás reemplaza lo que ve el público en este navegador.</p>
      <div className="content-desk">
        <div className="section-nav" aria-label="Partes de la web">
          {SECTIONS.map((item) => (
            <button key={item.id} type="button" className={item.id === section ? "is-active" : ""} aria-pressed={item.id === section} onClick={() => setSection(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <ContentForm
          key={section}
          section={section}
          initial={content[section]}
          preview={current.href}
          onSave={updateContent}
          onRestore={restoreContent}
        />
      </div>
    </>
  )
}
