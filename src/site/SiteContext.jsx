import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { institution as baseInstitution } from "../data/institution"
import { createContent, initialCourses } from "./defaults"
import { createEnrollments } from "./enrollments"

const STORAGE_KEY = "laprida.panel.v1"
const FORMAT_ORDER = ["presencial", "hibrido", "virtual"]

const SiteContext = createContext(null)

function createState() {
  const catalog = initialCourses()
  return {
    version: 1,
    content: createContent(),
    courses: catalog,
    enrollments: createEnrollments(catalog),
  }
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createState()
    const parsed = JSON.parse(raw)
    if (parsed?.version !== 1 || !parsed.content || !Array.isArray(parsed.courses) || !Array.isArray(parsed.enrollments)) {
      return createState()
    }
    return parsed
  } catch {
    return createState()
  }
}

function slugify(text) {
  const base = String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return base || "curso"
}

function uniqueId(title, catalog) {
  const base = slugify(title)
  const ids = new Set(catalog.map((item) => item.id))
  if (!ids.has(base)) return base
  let count = 2
  while (ids.has(`${base}-${count}`)) count += 1
  return `${base}-${count}`
}

function asLines(value) {
  const source = Array.isArray(value) ? value : String(value || "").split("\n")
  return source.map((item) => String(item).trim()).filter(Boolean)
}

function normalizeCourse(draft, catalog) {
  const title = String(draft.title || "").trim()
  if (!title) throw new Error("El curso necesita un nombre.")
  const formats = FORMAT_ORDER.filter((id) => (draft.formats || []).includes(id))
  if (!formats.length) throw new Error("Elegí al menos una modalidad.")
  const editing = draft.id && catalog.some((item) => item.id === draft.id)
  const start = draft.start || "2027-03-08"
  const modality = formats[0] === "hibrido" ? "Híbrido" : formats[0] === "virtual" ? "Virtual" : "Presencial"
  return {
    id: editing ? draft.id : uniqueId(title, catalog),
    title,
    category: draft.category || "educacion",
    durationMonths: Math.max(1, Math.round(Number(draft.durationMonths) || 1)),
    hours: Math.max(1, Math.round(Number(draft.hours) || 1)),
    formats,
    modality,
    ministry: Boolean(draft.ministry),
    practices: Boolean(draft.practices),
    seats: Math.max(1, Math.round(Number(draft.seats) || 1)),
    shift: String(draft.shift || "Tarde").trim() || "Tarde",
    matricula: Math.max(0, Math.round(Number(draft.matricula) || 0)),
    cuota: Math.max(0, Math.round(Number(draft.cuota) || 0)),
    requirements: asLines(draft.requirementsText ?? draft.requirements),
    start,
    intakeId: String(start).slice(0, 7),
    image: String(draft.image || "").trim() || "/class-team.webp",
    summary: String(draft.summary || "").trim(),
    description: String(draft.description || "").trim(),
    outcomes: asLines(draft.outcomesText ?? draft.outcomes),
    modules: asLines(draft.modulesText ?? draft.modules),
  }
}

function normalizeEnrollment(input, existing) {
  const dni = String(input.dni || "").replace(/\D/g, "")
  return {
    id: existing?.id || input.id || `enr-${Date.now()}`,
    createdAt: existing?.createdAt || input.createdAt || new Date().toISOString(),
    name: String(input.name || "").trim(),
    dni,
    email: String(input.email || "").trim(),
    phone: String(input.phone || "").trim(),
    courseId: input.courseId || "",
    modality: input.modality || "presencial",
    shift: input.shift || "A confirmar",
    status: input.status || "nuevo",
    payment: input.payment || "pendiente",
    amount: Math.max(0, Math.round(Number(input.amount) || 0)),
    notes: String(input.notes || ""),
    source: input.source || existing?.source || "web",
    code: existing?.code || input.code || `RL-${dni.slice(-6).padStart(6, "0")}`,
  }
}

export function SiteProvider({ children }) {
  const [state, setState] = useState(readState)
  const [saveError, setSaveError] = useState("")
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
    const serial = JSON.stringify(state)
    try {
      if (localStorage.getItem(STORAGE_KEY) !== serial) localStorage.setItem(STORAGE_KEY, serial)
      setSaveError("")
    } catch {
      setSaveError("No se pudo guardar en este navegador. Si subiste fotos grandes, probá con una más chica.")
    }
  }, [state])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      try {
        const parsed = JSON.parse(event.newValue)
        if (parsed?.version === 1) setState(parsed)
      } catch {
        /* otra pestaña escribió un valor que no se puede leer */
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const categories = state.content.categories
  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories])
  const place = useMemo(() => ({ ...baseInstitution, ...state.content.contact }), [state.content.contact])

  const updateContent = useCallback((key, value) => {
    const copy = structuredClone(value)
    setState((prev) => ({ ...prev, content: { ...prev.content, [key]: copy } }))
  }, [])

  const restoreContent = useCallback((key) => {
    const fresh = structuredClone(createContent()[key])
    setState((prev) => ({ ...prev, content: { ...prev.content, [key]: fresh } }))
    return fresh
  }, [])

  const saveCourse = useCallback((draft) => {
    const saved = normalizeCourse(draft, stateRef.current.courses)
    setState((prev) => {
      const exists = prev.courses.some((item) => item.id === saved.id)
      const courses = exists
        ? prev.courses.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...prev.courses]
      return { ...prev, courses }
    })
    return saved
  }, [])

  const removeCourse = useCallback((id) => {
    setState((prev) => ({ ...prev, courses: prev.courses.filter((item) => item.id !== id) }))
  }, [])

  const restoreCourses = useCallback(() => {
    setState((prev) => ({ ...prev, courses: initialCourses() }))
  }, [])

  const addEnrollment = useCallback((input) => {
    const enrollment = normalizeEnrollment(input)
    if (!enrollment.name) throw new Error("La ficha necesita un nombre.")
    if (!enrollment.courseId) throw new Error("Elegí un curso.")
    setState((prev) => ({ ...prev, enrollments: [enrollment, ...prev.enrollments] }))
    return enrollment
  }, [])

  const updateEnrollment = useCallback((id, patch) => {
    const current = stateRef.current.enrollments.find((item) => item.id === id)
    if (!current) throw new Error("No está esa ficha.")
    const saved = normalizeEnrollment({ ...current, ...patch }, current)
    if (!saved.name) throw new Error("La ficha necesita un nombre.")
    if (!saved.courseId) throw new Error("Elegí un curso.")
    setState((prev) => ({
      ...prev,
      enrollments: prev.enrollments.map((item) => (item.id === id ? saved : item)),
    }))
    return saved
  }, [])

  const removeEnrollment = useCallback((id) => {
    setState((prev) => ({ ...prev, enrollments: prev.enrollments.filter((item) => item.id !== id) }))
  }, [])

  const clearExamples = useCallback(() => {
    setState((prev) => ({ ...prev, enrollments: prev.enrollments.filter((item) => item.source !== "ejemplo") }))
  }, [])

  const value = useMemo(() => ({
    content: state.content,
    courses: state.courses,
    enrollments: state.enrollments,
    categories,
    categoryById,
    institution: place,
    brand: state.content.brand,
    reviews: state.content.reviews,
    saveError,
    updateContent,
    restoreContent,
    saveCourse,
    removeCourse,
    restoreCourses,
    addEnrollment,
    updateEnrollment,
    removeEnrollment,
    clearExamples,
  }), [
    state,
    categories,
    categoryById,
    place,
    saveError,
    updateContent,
    restoreContent,
    saveCourse,
    removeCourse,
    restoreCourses,
    addEnrollment,
    updateEnrollment,
    removeEnrollment,
    clearExamples,
  ])

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

export function useSite() {
  const value = useContext(SiteContext)
  if (!value) throw new Error("useSite se usa dentro de SiteProvider")
  return value
}
