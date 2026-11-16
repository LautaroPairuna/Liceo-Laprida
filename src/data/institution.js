export const brand = {
  name: "Red Laprida",
  short: "RL",
  tagline: "Te brindamos las herramientas y el conocimiento para hallar tu mejor trabajo.",
}

export const institution = {
  name: "Liceo Laprida",
  legalName: "Liceo Profesional Laprida",
  short: "LPL",
  city: "San Juan",
  province: "Argentina",
  years: 50,
  address: "Gral. José María Paz Este 44",
  postal: "J5400",
  locality: "San Juan Capital",
  country: "Argentina",
  coords: { lat: -31.541431, lng: -68.524687 },
  phone: "+54 264 580-8222",
  phoneRaw: "542645808222",
  email: "instituto.superior.laprida@gmail.com",
  whatsapp: "https://wa.me/542645808222",
  instagram: "https://www.instagram.com/liceo_laprida/",
  instagramHandle: "@liceo_laprida",
  facebook: "https://www.facebook.com/635150843222009",
  hours: [
    { day: "Lunes", open: "08:30", close: "20:30" },
    { day: "Martes", open: "08:30", close: "20:30" },
    { day: "Miércoles", open: "08:30", close: "20:30" },
    { day: "Jueves", open: "08:30", close: "20:30" },
    { day: "Viernes", open: "08:30", close: "20:30" },
    { day: "Sábado", open: "09:00", close: "13:00" },
    { day: "Domingo", open: null, close: null },
  ],
  stats: {
    years: 50,
    certificatesYear: 1800,
    graduates: 12000,
    areas: 7,
    satisfaction: 96,
  },
}

export const institutionStory = {
  title: "Una red para aprender un oficio.",
  lead:
    "Red Laprida reúne la formación presencial, híbrida y virtual. En San Juan, las clases presenciales se dictan en el Liceo Profesional Laprida.",
  milestones: [
    {
      year: "1948",
      dateTime: "1948",
      title: "El origen de la sede",
      text: "Josefina Carta de Oro funda el proyecto del Liceo Profesional Laprida y abre camino a la enseñanza privada en San Juan.",
    },
    {
      year: "1968",
      dateTime: "1968",
      title: "La apertura",
      text: "El Liceo Profesional Laprida empieza a dictar capacitación laboral, informática y sistemas contables en la ciudad.",
    },
    {
      year: "Hoy",
      dateTime: null,
      title: "La tarea",
      text: "En la sede de General Paz Este se sigue enseñando el oficio en la práctica, y Red Laprida suma la cursada híbrida y virtual.",
    },
  ],
  purposeTitle: "Propósito",
  purpose:
    "Educar, para Red Laprida, es hacerse cargo de que cada persona pueda usar lo que aprende. Cada curso existe para salir a trabajar o a emprender: hay programa, docente y acompañamiento, y se enseña la técnica que después hay que hacer.",
  visionTitle: "Visión",
  vision:
    "El Liceo Profesional Laprida permanece en el centro de San Juan, con turnos de mañana, tarde y noche, para empezar o retomar. Red Laprida suma a esa sede la cursada híbrida y virtual, para que el oficio se pueda aprender de más de una manera.",
}

export const reviews = {
  average: 4.8,
  count: 214,
  recommend: 96,
  breakdown: [
    { stars: 5, percent: 78 },
    { stars: 4, percent: 16 },
    { stars: 3, percent: 4 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
  ],
  items: [
    {
      name: "Diego R.",
      role: "Egresado",
      course: "Electricista Domiciliario",
      rating: 5,
      date: "Marzo 2026",
      quote:
        "Los profesores de electricidad enseñan de verdad. Salís sabiendo cablear, no recitando el reglamento de memoria.",
      featured: true,
    },
    {
      name: "Lucía P.",
      role: "Egresada",
      course: "Preceptora",
      rating: 5,
      date: "Febrero 2026",
      quote: "Hice preceptora y el trato fue excelente. El curso me abrió la puerta a la escuela.",
    },
    {
      name: "Mariana G.",
      role: "Egresada",
      course: "Auxiliar de Farmacia",
      rating: 5,
      date: "Noviembre 2025",
      quote: "Las prácticas en salud marcan la diferencia. Entendés el ritmo de una clínica antes de pedir trabajo.",
    },
    {
      name: "Pablo S.",
      role: "Egresado",
      course: "Técnico en Refrigeración",
      rating: 4,
      date: "Octubre 2025",
      quote: "Horario nocturno y herramientas en serio. En tres meses ya estaba saliendo a domicilios con un colega.",
    },
    {
      name: "Carla M.",
      role: "Egresada",
      course: "Organización de Eventos",
      rating: 5,
      date: "Agosto 2025",
      quote: "Aprendí a armar una propuesta y un presupuesto. Hoy organizo eventos y el certificado me sirvió para los primeros clientes.",
    },
    {
      name: "Hernán V.",
      role: "Egresado",
      course: "Excel",
      rating: 4,
      date: "Julio 2025",
      quote: "Iba a un curso más caro en Capital. Acá el docente va al caso: planillas que se usan en una oficina de San Juan.",
    },
  ],
}

export const categories = [
  {
    id: "educacion",
    name: "Educación",
    short: "Educación",
    modes: ["presencial", "hibrido", "virtual"],
    color: "#1d4ed8",
    soft: "#e8efff",
    icon: "book",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "administrativa",
    name: "Administrativa",
    short: "Administrativa",
    modes: ["presencial", "hibrido", "virtual"],
    color: "#0369a1",
    soft: "#e0f2fe",
    icon: "pen",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "salud",
    name: "Salud",
    short: "Salud",
    modes: ["presencial", "hibrido", "virtual"],
    color: "#e11d48",
    soft: "#ffe4e9",
    icon: "heart",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "tecnica",
    name: "Técnica",
    short: "Técnica",
    modes: ["presencial"],
    color: "#b45309",
    soft: "#fff4e0",
    icon: "plug",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "informatica",
    name: "Informática",
    short: "Informática",
    modes: ["presencial", "hibrido", "virtual"],
    color: "#047857",
    soft: "#e6f7f0",
    icon: "monitor",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "laboral",
    name: "Laboral Propia",
    short: "Laboral Propia",
    modes: ["presencial"],
    color: "#6d28d9",
    soft: "#f3e8ff",
    icon: "phone",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "mineria",
    name: "Minería",
    short: "Minería",
    modes: ["presencial"],
    color: "#c2410c",
    soft: "#ffedd5",
    icon: "pick",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
  },
]

export const categoryById = new Map(categories.map((category) => [category.id, category]))

const digitalAccents = {
  educacion: "#7c649e",
  administrativa: "#3e7560",
  salud: "#b15e66",
  tecnica: "#2f5e4c",
  informatica: "#4e8a72",
  laboral: "#6a508c",
  mineria: "#8e4a52",
}

export const catalogAccents = {
  presencial: {
    educacion: "#1d4ed8",
    administrativa: "#0c4a6e",
    salud: "#0e7490",
    tecnica: "#1e3a8a",
    informatica: "#0284c7",
    laboral: "#155e75",
    mineria: "#082f5b",
  },
  hibrido: digitalAccents,
  virtual: digitalAccents,
}

export function accentFor(modalityId, categoryId) {
  return catalogAccents[modalityId]?.[categoryId] || categoryById.get(categoryId)?.color || "#1769a7"
}

export const modalities = [
  {
    id: "presencial",
    name: "Presenciales",
    label: "Presencial",
    detail: "Clases en el Liceo Profesional Laprida, San Juan.",
    tone: "#0a4f92",
  },
  {
    id: "hibrido",
    name: "Híbridos",
    label: "Híbrido",
    detail: "Material de estudio en el campus y clases en vivo por Zoom.",
    tone: "#12392a",
  },
  {
    id: "virtual",
    name: "Virtuales",
    label: "Virtual",
    detail: "Sin clases en vivo. Avanzás en tu propio tiempo.",
    tone: "#3b1654",
  },
]

export const modalityById = new Map(modalities.map((modality) => [modality.id, modality]))

export const intakes = [
  { id: "2026-11", label: "Noviembre 2026", date: "2026-11-16" },
  { id: "2027-02", label: "Febrero 2027", date: "2027-02-09" },
  { id: "2027-03", label: "Marzo 2027", date: "2027-03-08" },
  { id: "2027-04", label: "Abril 2027", date: "2027-04-12" },
]

export function startForCourse(id = "") {
  let index = 0
  const key = String(id)
  for (let i = 0; i < key.length; i += 1) index = (index + key.charCodeAt(i) * (i + 1)) % intakes.length
  return intakes[index]
}

function linearChannel(value) {
  const channel = value / 255
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

export function inkOn(hex) {
  if (!hex || hex[0] !== "#") return "#ffffff"
  const raw = hex.slice(1)
  const luminance =
    0.2126 * linearChannel(parseInt(raw.slice(0, 2), 16)) +
    0.7152 * linearChannel(parseInt(raw.slice(2, 4), 16)) +
    0.0722 * linearChannel(parseInt(raw.slice(4, 6), 16))
  return 1.05 / (luminance + 0.05) >= 3.1 ? "#ffffff" : "#082f5b"
}

const intakeFormat = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
})

export const formatIntakeDate = (iso) => {
  if (!iso) return "A confirmar"
  return intakeFormat.format(new Date(`${iso}T12:00:00-03:00`)).replaceAll(".", "")
}

export const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value)
