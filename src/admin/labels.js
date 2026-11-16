export const FORMAT_LABEL = {
  presencial: "Presencial",
  hibrido: "Híbrido",
  virtual: "Virtual",
}

export const STATUS = [
  { id: "nuevo", label: "Nuevo" },
  { id: "contactado", label: "Contactado" },
  { id: "inscripto", label: "Inscripto" },
  { id: "baja", label: "Baja" },
]

export const PAYMENTS = [
  { id: "aprobado", label: "Aprobado" },
  { id: "sena", label: "Seña" },
  { id: "pendiente", label: "Pendiente" },
]

export const SOURCES = {
  ejemplo: "Ejemplo",
  web: "Web",
  equipo: "Equipo",
}

const dateFormat = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatDate(iso) {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return dateFormat.format(date).replace(".", "")
}

export function houseOf(modality) {
  return modality === "presencial" ? "liceo" : "red"
}

export function houseName(modality) {
  return modality === "presencial" ? "Liceo Laprida" : "Red Laprida"
}

export function statusLabel(id) {
  return STATUS.find((item) => item.id === id)?.label || id
}

export function paymentLabel(id) {
  return PAYMENTS.find((item) => item.id === id)?.label || id
}

export function courseFormatsOf(course) {
  return course?.formats?.length ? course.formats : ["presencial"]
}
