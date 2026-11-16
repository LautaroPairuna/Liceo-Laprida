import { courses } from "../data/courses"
import { brand, categories, institution, institutionStory, reviews } from "../data/institution"

export function createContent() {
  return {
    hero: {
      title: "Aprendé un oficio. Empezá algo propio.",
      lead: "Formación práctica, horarios flexibles y herramientas para salir a trabajar.",
      cta: "Explorar cursos",
      video: "/hero-inicio.mp4",
      poster: "/hero-inicio-poster.webp",
      notes: [
        "Inscripciones abiertas",
        "Turnos mañana, tarde y noche",
        "Modalidad presencial, híbrida y virtual",
      ],
    },
    learning: {
      kicker: "Aprender haciendo",
      title: "El oficio se aprende haciéndolo.",
      text: "Práctica guiada, herramientas reales y docentes presentes en cada paso.",
      cta: "Ver reseñas",
      photos: [
        {
          src: "/class-cooking.webp",
          alt: "Estudiantes adultos trabajando en una clase práctica de cocina",
          caption: "Práctica desde la primera clase",
        },
        {
          src: "/hero-adults-poster.webp",
          alt: "Docente de gastronomía explicando una técnica frente a sus alumnos",
          caption: "Docentes presentes",
        },
        {
          src: "/class-team.webp",
          alt: "Grupo de estudiantes adultos compartiendo una actividad",
          caption: "Aprender con otros",
        },
      ],
    },
    story: {
      title: institutionStory.title,
      lead: institutionStory.lead,
      milestones: institutionStory.milestones.map((item) => ({ ...item })),
      purposeTitle: institutionStory.purposeTitle,
      purpose: institutionStory.purpose,
      visionTitle: institutionStory.visionTitle,
      vision: institutionStory.vision,
      facade: "",
      facadeAlt: "Fachada del Liceo Profesional Laprida",
    },
    reviews: {
      average: reviews.average,
      count: reviews.count,
      recommend: reviews.recommend,
      breakdown: reviews.breakdown.map((item) => ({ ...item })),
      items: reviews.items.map((item) => ({ ...item })),
    },
    contact: {
      name: institution.name,
      legalName: institution.legalName,
      address: institution.address,
      postal: institution.postal,
      locality: institution.locality,
      province: institution.province,
      phone: institution.phone,
      phoneRaw: institution.phoneRaw,
      email: institution.email,
      whatsapp: institution.whatsapp,
      instagram: institution.instagram,
      instagramHandle: institution.instagramHandle,
      facebook: institution.facebook,
      hours: institution.hours.map((item) => ({ ...item })),
    },
    offers: {
      title: "Beneficios y promociones vigentes",
      courses: [
        { id: "excel-profesional", discount: 20, start: "2026-11-12", deadline: "2026-11-08" },
        { id: "auxiliar-farmacia", discount: 15, start: "2026-11-18", deadline: "2026-11-12" },
        { id: "organizacion-eventos", discount: 18, start: "2026-11-22", deadline: "2026-11-15" },
        { id: "electricista-instalador", discount: 12, start: "2026-11-26", deadline: "2026-11-19" },
      ],
      group: {
        id: "grupo-3",
        title: "10% para grupos de 3",
        image: "/class-team.webp",
        deadline: "2026-11-30",
        value: "10% OFF",
        valueNote: "en la cuota de cada integrante",
      },
    },
    categories: categories.map((category) => ({ ...category, modes: [...category.modes] })),
    catalogCopy: {
      presencial: {
        title: "Cursos presenciales",
        lead: "Todo el cursado ocurre de forma presencial en el Liceo Profesional Laprida.",
        detail: "Clases en el Liceo Profesional Laprida, San Juan.",
        points: [],
      },
      hibrido: {
        title: "Cursos híbridos",
        lead: "Se realizan en los formatos digitales de Red Laprida: el material está en el campus y las clases son en vivo.",
        detail: "Material de estudio en el campus y clases en vivo por Zoom.",
        points: ["Material de estudio en el campus", "Clases en vivo por Zoom", "Sin cursada en la sede"],
      },
      virtual: {
        title: "Cursos virtuales",
        lead: "Se realizan en los formatos digitales de Red Laprida. No hay clases en vivo: avanzás en tu propio tiempo.",
        detail: "Sin clases en vivo. Avanzás en tu propio tiempo.",
        points: ["Material de estudio en el campus", "Sin clases en vivo", "Avanzás en tu propio tiempo"],
      },
    },
    brand: { ...brand },
  }
}

export function initialCourses() {
  return structuredClone(courses)
}
