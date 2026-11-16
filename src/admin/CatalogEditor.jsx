import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useSite } from "../site/SiteContext"
import { Field, ImageField } from "./fields"
import { courseFormatsOf } from "./labels"

const SHIFTS = ["Mañana", "Tarde", "Noche", "Tarde y noche", "A confirmar", "A tu ritmo"]
const FORMATS = [
  { id: "presencial", label: "Presencial, en el Liceo" },
  { id: "hibrido", label: "Híbrido, Red Laprida" },
  { id: "virtual", label: "Virtual, Red Laprida" },
]

function toDraft(course) {
  return {
    ...course,
    formats: courseFormatsOf(course),
    outcomesText: (course.outcomes || []).join("\n"),
    modulesText: (course.modules || []).join("\n"),
    requirementsText: (course.requirements || []).join("\n"),
  }
}

function blankCourse(categoryId) {
  return toDraft({
    id: "",
    title: "",
    category: categoryId || "educacion",
    durationMonths: 3,
    hours: 72,
    formats: ["presencial"],
    ministry: false,
    practices: false,
    seats: 18,
    shift: "Tarde",
    matricula: 30000,
    cuota: 45000,
    requirements: ["DNI vigente", "Fotocopia del DNI", "2 fotos 4×4"],
    start: "2027-03-08",
    image: "/class-team.webp",
    summary: "",
    description: "",
    outcomes: [],
    modules: [],
  })
}

function CourseForm({ initial, categories, onSave, onDelete, onDuplicate }) {
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState("")
  const shifts = SHIFTS.includes(draft.shift) ? SHIFTS : [draft.shift, ...SHIFTS]

  const toggleFormat = (id) => {
    setDraft((prev) => {
      const formats = prev.formats.includes(id) ? prev.formats.filter((item) => item !== id) : [...prev.formats, id]
      return { ...prev, formats }
    })
  }

  const submit = (event) => {
    event.preventDefault()
    try {
      onSave(draft)
      setError("")
    } catch (saveError) {
      setError(saveError.message)
    }
  }

  return (
    <form className="editor-card" onSubmit={submit}>
      <div className="fields">
        <Field className="span" label="Nombre"><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></Field>
        <Field label="Área">
          <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Turno">
          <select value={draft.shift} onChange={(event) => setDraft({ ...draft, shift: event.target.value })}>
            {shifts.map((shift) => <option key={shift} value={shift}>{shift}</option>)}
          </select>
        </Field>
        <div className="span">
          <span className="field-label">Dónde se cursa</span>
          <div className="checks">
            {FORMATS.map((format) => (
              <label key={format.id}>
                <input type="checkbox" checked={draft.formats.includes(format.id)} onChange={() => toggleFormat(format.id)} />
                {format.label}
              </label>
            ))}
          </div>
        </div>
        <Field label="Meses"><input type="number" min="1" value={draft.durationMonths} onChange={(event) => setDraft({ ...draft, durationMonths: event.target.value })} /></Field>
        <Field label="Horas"><input type="number" min="1" value={draft.hours} onChange={(event) => setDraft({ ...draft, hours: event.target.value })} /></Field>
        <Field label="Cupos"><input type="number" min="1" value={draft.seats} onChange={(event) => setDraft({ ...draft, seats: event.target.value })} /></Field>
        <Field label="Inicio"><input type="date" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} /></Field>
        <Field label="Matrícula"><input type="number" min="0" step="1000" value={draft.matricula} onChange={(event) => setDraft({ ...draft, matricula: event.target.value })} /></Field>
        <Field label="Cuota"><input type="number" min="0" step="1000" value={draft.cuota} onChange={(event) => setDraft({ ...draft, cuota: event.target.value })} /></Field>
        <label className="check-line"><input type="checkbox" checked={Boolean(draft.ministry)} onChange={(event) => setDraft({ ...draft, ministry: event.target.checked })} /> Ministerio de Educación</label>
        <label className="check-line"><input type="checkbox" checked={Boolean(draft.practices)} onChange={(event) => setDraft({ ...draft, practices: event.target.checked })} /> Prácticas profesionales</label>
        <ImageField label="Foto" value={draft.image} onChange={(value) => setDraft((current) => ({ ...current, image: value }))} />
        <Field className="span" label="Resumen"><textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></Field>
        <Field className="span" label="Descripción"><textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
        <Field className="span" label="Al terminar" hint="Una línea por resultado."><textarea value={draft.outcomesText} onChange={(event) => setDraft({ ...draft, outcomesText: event.target.value })} /></Field>
        <Field className="span" label="Módulos" hint="Uno por línea."><textarea value={draft.modulesText} onChange={(event) => setDraft({ ...draft, modulesText: event.target.value })} /></Field>
        <Field className="span" label="Requisitos" hint="Uno por línea."><textarea value={draft.requirementsText} onChange={(event) => setDraft({ ...draft, requirementsText: event.target.value })} /></Field>
      </div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <div className="form-actions">
        <button className="admin-btn admin-btn-save" type="submit">Guardar curso</button>
        {initial.id ? <button className="admin-btn" type="button" onClick={onDuplicate}>Duplicar</button> : null}
        {initial.id ? <button className="admin-btn admin-btn-danger" type="button" onClick={onDelete}>Eliminar</button> : null}
        {initial.id ? <a className="text-link" href={`/cursos/${initial.id}`}>Ver en la web</a> : null}
      </div>
    </form>
  )
}

export default function CatalogEditor() {
  const { courses, categories, saveCourse, removeCourse, restoreCourses } = useSite()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState("")
  const [house, setHouse] = useState("todas")
  const [notice, setNotice] = useState("")
  const selectedId = params.get("curso") || ""
  const selected = courses.find((course) => course.id === selectedId)

  const visible = useMemo(() => {
    const needle = query.toLocaleLowerCase("es").trim()
    return courses
      .filter((course) => {
        const formats = courseFormatsOf(course)
        if (house === "liceo" && !formats.includes("presencial")) return false
        if (house === "hibrido" && !formats.includes("hibrido")) return false
        if (house === "virtual" && !formats.includes("virtual")) return false
        if (needle && !course.title.toLocaleLowerCase("es").includes(needle)) return false
        return true
      })
      .sort((a, b) => a.title.localeCompare(b.title, "es"))
  }, [courses, house, query])

  const open = (id) => {
    const next = new URLSearchParams(params)
    if (id) next.set("curso", id)
    else next.delete("curso")
    setParams(next, { replace: true })
    setNotice("")
  }

  const save = (draft) => {
    const saved = saveCourse(draft)
    open(saved.id)
    setNotice(`Guardado «${saved.title}». Ya está en la web.`)
  }

  const duplicate = () => {
    if (!selected) return
    const saved = saveCourse({ ...selected, id: "", title: `${selected.title} (copia)` })
    open(saved.id)
    setNotice(`Listo. «${saved.title}» quedó en el catálogo.`)
  }

  const remove = () => {
    if (!selected) return
    const ok = window.confirm(`¿Eliminar ${selected.title} del catálogo? Las inscripciones de ese curso se conservan.`)
    if (!ok) return
    removeCourse(selected.id)
    open("")
    setNotice("Curso eliminado del catálogo.")
  }

  const restore = () => {
    const ok = window.confirm("¿Volver al catálogo original? Se pierden los cursos agregados y los cambios.")
    if (!ok) return
    restoreCourses()
    open("")
    setNotice("Catálogo restaurado.")
  }

  return (
    <>
      <h1>Catálogo</h1>
      <p className="page-lead">Los cursos presenciales son del Liceo Laprida. Híbrido y virtual son de Red Laprida. Un curso puede estar en más de un formato.</p>
      {notice ? <p className="notice" role="status">{notice}</p> : null}
      <div className="catalog-desk">
        <div>
          <div className="picker-actions">
            <button type="button" className="admin-btn admin-btn-save" onClick={() => open("nuevo")}>Nuevo curso</button>
            <button type="button" className="linkish" onClick={restore}>Restaurar original</button>
          </div>
          <div className="course-tools">
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar curso" aria-label="Buscar curso" />
            <div className="chip-row" role="group" aria-label="Filtrar por casa">
              {[
                ["todas", "Todos"],
                ["liceo", "Liceo"],
                ["hibrido", "Híbrido"],
                ["virtual", "Virtual"],
              ].map(([id, label]) => (
                <button key={id} type="button" className={house === id ? "chip is-active" : "chip"} aria-pressed={house === id} onClick={() => setHouse(id)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="course-list">
            {visible.length ? visible.map((course) => {
              const formats = courseFormatsOf(course)
              return (
                <button key={course.id} type="button" className={course.id === selectedId ? "course-pick is-active" : "course-pick"} aria-current={course.id === selectedId ? "true" : undefined} onClick={() => open(course.id)}>
                  <strong>{course.title}</strong>
                  <span className="format-marks">
                    {formats.includes("presencial") ? <span className="mark-liceo">Liceo</span> : null}
                    {formats.includes("hibrido") ? <span className="mark-hibrido">Híbrido</span> : null}
                    {formats.includes("virtual") ? <span className="mark-virtual">Virtual</span> : null}
                  </span>
                </button>
              )
            }) : <p className="page-lead">No hay cursos con ese filtro.</p>}
          </div>
        </div>
        <div>
          {selectedId === "nuevo" ? (
            <CourseForm key="nuevo" initial={blankCourse(categories[0]?.id)} categories={categories} onSave={save} />
          ) : selected ? (
            <CourseForm key={selected.id} initial={toDraft(selected)} categories={categories} onSave={save} onDelete={remove} onDuplicate={duplicate} />
          ) : (
            <div className="editor-card"><p>Elegí un curso de la lista o creá uno nuevo.</p></div>
          )}
        </div>
      </div>
    </>
  )
}
