import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { formatMoney } from "../data/institution"
import { useSite } from "../site/SiteContext"
import { downloadExcel } from "./excel"
import { FORMAT_LABEL, PAYMENTS, SOURCES, STATUS, courseFormatsOf, formatDate, houseName, paymentLabel, statusLabel } from "./labels"

const SHIFTS = ["Mañana", "Tarde", "Noche", "Tarde y noche", "A confirmar", "A tu ritmo"]

function blankStudent(course) {
  const formats = courseFormatsOf(course)
  return {
    id: "",
    name: "",
    dni: "",
    email: "",
    phone: "",
    courseId: course?.id || "",
    modality: formats[0] || "presencial",
    shift: "Tarde",
    status: "contactado",
    payment: "pendiente",
    amount: course ? course.matricula + course.cuota : 0,
    notes: "",
    source: "equipo",
  }
}

function StudentForm({ initial, courses, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState("")
  const course = courses.find((item) => item.id === draft.courseId)
  const formats = courseFormatsOf(course)
  const mismatch = course && draft.modality && !formats.includes(draft.modality)
  const shifts = SHIFTS.includes(draft.shift) ? SHIFTS : [draft.shift, ...SHIFTS]
  const sorted = [...courses].sort((a, b) => a.title.localeCompare(b.title, "es"))

  const chooseCourse = (courseId) => {
    const nextCourse = courses.find((item) => item.id === courseId)
    const nextFormats = courseFormatsOf(nextCourse)
    setDraft((prev) => ({
      ...prev,
      courseId,
      modality: nextFormats.includes(prev.modality) ? prev.modality : nextFormats[0],
      amount: nextCourse ? nextCourse.matricula + nextCourse.cuota : prev.amount,
    }))
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
    <form className={`record ${draft.modality === "hibrido" ? "record-hibrido" : draft.modality === "virtual" ? "record-red" : "record-liceo"}`} onSubmit={submit}>
      <div className="record-head">
        <div>
          <h2>{draft.name || "Nueva ficha"}</h2>
          {initial.code ? <p>{initial.code} · {SOURCES[initial.source] || initial.source} · {formatDate(initial.createdAt)}</p> : <p>La carga el equipo. No viene de la web.</p>}
        </div>
        <button type="button" className="linkish" onClick={onClose}>Cerrar</button>
      </div>
      <div className="stack-fields">
        <label className="field">Nombre<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} autoComplete="name" required /></label>
        <label className="field">DNI<input value={draft.dni} onChange={(event) => setDraft({ ...draft, dni: event.target.value })} inputMode="numeric" /></label>
        <label className="field">Correo<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} autoComplete="email" /></label>
        <label className="field">Teléfono<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} autoComplete="tel" /></label>
        <label className="field">Curso
          <select value={draft.courseId} onChange={(event) => chooseCourse(event.target.value)} required>
            <option value="">Elegí un curso…</option>
            {sorted.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label className="field">Modalidad
          <select value={draft.modality} onChange={(event) => setDraft({ ...draft, modality: event.target.value })}>
            <option value="presencial">Presencial · Liceo Laprida</option>
            <option value="hibrido">Híbrido · Red Laprida</option>
            <option value="virtual">Virtual · Red Laprida</option>
          </select>
        </label>
        {mismatch ? <p className="field-error">Ese curso no se ofrece en esa modalidad.</p> : null}
        <label className="field">Turno
          <select value={draft.shift} onChange={(event) => setDraft({ ...draft, shift: event.target.value })}>
            {shifts.map((shift) => <option key={shift} value={shift}>{shift}</option>)}
          </select>
        </label>
        <label className="field">Estado
          <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
            {STATUS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="field">Pago
          <select value={draft.payment} onChange={(event) => setDraft({ ...draft, payment: event.target.value })}>
            {PAYMENTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="field">Importe de la inscripción
          <input type="number" min="0" step="1000" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} />
          <small>Al cambiar de curso se propone matrícula + primera cuota. Hoy: {formatMoney(Number(draft.amount) || 0)}.</small>
        </label>
        <label className="field">Notas<textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
      </div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <div className="form-actions">
        <button className="admin-btn admin-btn-save" type="submit">Guardar ficha</button>
        {initial.id ? <button className="admin-btn admin-btn-danger" type="button" onClick={onDelete}>Eliminar</button> : null}
      </div>
    </form>
  )
}

function matches(item, filters, title) {
  if (filters.casa === "liceo" && item.modality !== "presencial") return false
  if (filters.casa === "red" && item.modality === "presencial") return false
  if (filters.modalidad && item.modality !== filters.modalidad) return false
  if (filters.curso && item.courseId !== filters.curso) return false
  if (filters.estado && item.status !== filters.estado) return false
  if (filters.pago && item.payment !== filters.pago) return false
  const needle = filters.q.toLocaleLowerCase("es").trim()
  if (!needle) return true
  const haystack = `${item.name} ${item.dni} ${item.email} ${item.phone} ${item.code} ${title}`.toLocaleLowerCase("es")
  return haystack.includes(needle)
}

export default function StudentsDesk() {
  const { courses, enrollments, addEnrollment, updateEnrollment, removeEnrollment, clearExamples } = useSite()
  const [params, setParams] = useSearchParams()
  const [notice, setNotice] = useState("")
  const filters = {
    q: params.get("q") || "",
    casa: params.get("casa") || "",
    modalidad: params.get("modalidad") || "",
    curso: params.get("curso") || "",
    estado: params.get("estado") || "",
    pago: params.get("pago") || "",
    alumno: params.get("alumno") || "",
  }
  const titles = useMemo(() => new Map(courses.map((course) => [course.id, course.title])), [courses])
  const { q, casa, modalidad, curso, estado, pago } = filters
  const filtered = useMemo(() => {
    const active = { q, casa, modalidad, curso, estado, pago }
    return [...enrollments]
      .filter((item) => matches(item, active, titles.get(item.courseId) || ""))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  }, [casa, curso, enrollments, estado, modalidad, pago, q, titles])
  const selected = enrollments.find((item) => item.id === filters.alumno)
  const hasExamples = enrollments.some((item) => item.source === "ejemplo")
  const filtering = Boolean(filters.q || filters.casa || filters.modalidad || filters.curso || filters.estado || filters.pago)

  const setFilter = (partial) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(partial)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  useEffect(() => {
    if (!params.get("alumno")) return undefined
    const onKey = (event) => {
      if (event.key !== "Escape") return
      const tag = event.target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      const next = new URLSearchParams(params)
      next.delete("alumno")
      setParams(next, { replace: true })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [params, setParams])

  const save = (draft) => {
    if (draft.id) {
      updateEnrollment(draft.id, draft)
      setNotice("Ficha guardada.")
      return
    }
    const created = addEnrollment({ ...draft, source: "equipo" })
    setFilter({ alumno: created.id })
    setNotice("Ficha cargada.")
  }

  const remove = () => {
    if (!selected) return
    const ok = window.confirm(`¿Eliminar la ficha de ${selected.name}?`)
    if (!ok) return
    removeEnrollment(selected.id)
    setFilter({ alumno: "" })
    setNotice("Ficha eliminada.")
  }

  const exportRows = () => {
    const stamp = new Date().toISOString().slice(0, 10)
    downloadExcel(`alumnos-laprida-${stamp}.xls`, filtered.map((item) => ({
      Nombre: item.name,
      DNI: item.dni,
      Correo: item.email,
      Teléfono: item.phone,
      Curso: titles.get(item.courseId) || "Curso dado de baja",
      Casa: houseName(item.modality),
      Modalidad: FORMAT_LABEL[item.modality] || item.modality,
      Turno: item.shift,
      Estado: statusLabel(item.status),
      Pago: paymentLabel(item.payment),
      Importe: Number(item.amount) || 0,
      Fecha: formatDate(item.createdAt),
      Código: item.code,
      Origen: SOURCES[item.source] || item.source,
      Notas: item.notes,
    })))
  }

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (filters.alumno) next.set("alumno", filters.alumno)
    setParams(next, { replace: true })
  }

  const dropExamples = () => {
    const ok = window.confirm("¿Borrar todas las fichas de ejemplo? Las inscripciones de la web se conservan.")
    if (!ok) return
    clearExamples()
    if (selected?.source === "ejemplo") setFilter({ alumno: "" })
    setNotice("Ejemplos borrados.")
  }

  return (
    <>
      <h1>Alumnos</h1>
      <p className="page-lead">Inscripciones que llegan por la web y fichas que carga el equipo. El Excel sale con el listado que estás viendo.</p>
      {hasExamples ? (
        <p className="admin-note">
          Hay fichas de ejemplo para ver el panel. Las inscripciones reales se suman cuando alguien completa el formulario de la web.{" "}
          <button type="button" className="linkish" onClick={dropExamples}>Borrar ejemplos</button>
        </p>
      ) : null}
      {notice ? <p className="notice" role="status">{notice}</p> : null}

      <div className="student-tools">
        <div className="tool-line">
          <button type="button" className="admin-btn admin-btn-save" onClick={() => setFilter({ alumno: "nuevo" })}>Cargar alumno</button>
          <button type="button" className="admin-btn" onClick={exportRows} disabled={!filtered.length}>Descargar Excel</button>
          <span className="result-count">{filtered.length} {filtered.length === 1 ? "ficha" : "fichas"}{filtering ? ` de ${enrollments.length}` : ""}</span>
        </div>
        <input type="search" value={filters.q} onChange={(event) => setFilter({ q: event.target.value })} placeholder="Nombre, DNI, correo o código" aria-label="Buscar alumno" />
        <div className="chip-row" role="group" aria-label="Casa">
          {[
            ["", "Todas"],
            ["liceo", "Liceo"],
            ["red", "Red"],
          ].map(([id, label]) => (
            <button key={label} type="button" className={filters.casa === id ? "chip is-active" : "chip"} aria-pressed={filters.casa === id} onClick={() => setFilter({ casa: id, modalidad: id === "liceo" ? "" : filters.modalidad })}>{label}</button>
          ))}
        </div>
        <div className="chip-row" role="group" aria-label="Modalidad">
          {[
            ["", "Todas las modalidades"],
            ["presencial", "Presencial"],
            ["hibrido", "Híbrido"],
            ["virtual", "Virtual"],
          ].map(([id, label]) => (
            <button key={label} type="button" className={filters.modalidad === id ? "chip is-active" : "chip"} aria-pressed={filters.modalidad === id} onClick={() => setFilter({ modalidad: id, casa: id === "presencial" ? "liceo" : id ? "red" : filters.casa })}>{label}</button>
          ))}
        </div>
        <div className="tool-line">
          <label className="field">Curso
            <select value={filters.curso} onChange={(event) => setFilter({ curso: event.target.value })}>
              <option value="">Todos</option>
              {[...courses].sort((a, b) => a.title.localeCompare(b.title, "es")).map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </label>
          <label className="field">Estado
            <select value={filters.estado} onChange={(event) => setFilter({ estado: event.target.value })}>
              <option value="">Todos</option>
              {STATUS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="field">Pago
            <select value={filters.pago} onChange={(event) => setFilter({ pago: event.target.value })}>
              <option value="">Todos</option>
              {PAYMENTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          {filtering ? <button type="button" className="linkish" onClick={clearFilters}>Limpiar filtros</button> : null}
        </div>
      </div>

      <div className={filters.alumno ? "students-layout has-record" : "students-layout"}>
        <div className="table-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Curso</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th className="col-optional">Pago</th>
                <th className="col-optional">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((item) => (
                <tr key={item.id} className={item.id === filters.alumno ? "is-selected" : ""}>
                  <td><button type="button" className="row-open" onClick={() => setFilter({ alumno: item.id })}>{item.name}</button></td>
                  <td>{titles.get(item.courseId) || "Curso dado de baja"}</td>
                  <td>
                    <span className={`tone-${item.modality}`}>{FORMAT_LABEL[item.modality]}</span>
                    <small className="house-hint">{houseName(item.modality)}</small>
                  </td>
                  <td className={`status-${item.status}`}>{statusLabel(item.status)}</td>
                  <td className="col-optional">{paymentLabel(item.payment)}</td>
                  <td className="col-optional">{formatDate(item.createdAt)}</td>
                </tr>
              )) : (
                <tr><td colSpan={6}>No hay alumnos con esos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filters.alumno === "nuevo" ? (
          <StudentForm key="nuevo" initial={blankStudent(courses[0])} courses={courses} onSave={save} onClose={() => setFilter({ alumno: "" })} />
        ) : selected ? (
          <StudentForm key={selected.id} initial={selected} courses={courses} onSave={save} onDelete={remove} onClose={() => setFilter({ alumno: "" })} />
        ) : null}
      </div>
    </>
  )
}
