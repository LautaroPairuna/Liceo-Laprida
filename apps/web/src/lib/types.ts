export type Format = "presencial" | "hibrido" | "virtual";

export type Course = {
  id: string;
  title: string;
  category: string;
  durationMonths: number;
  hours: number;
  formats: Format[];
  modality: string;
  ministry: boolean;
  practices: boolean;
  seats: number;
  shift: string;
  matricula: number;
  cuota: number;
  requirements: string[];
  start: string;
  intakeId: string;
  image: string;
  summary: string;
  description: string;
  outcomes: string[];
  modules: string[];
};

export type Category = {
  id: string;
  name: string;
  short: string;
  modes: Format[];
  color: string;
  soft: string;
  icon: string;
  image: string;
};

export type Hours = { day: string; open: string | null; close: string | null };

export type Contact = {
  name: string;
  legalName: string;
  address: string;
  postal: string;
  locality: string;
  province: string;
  phone: string;
  phoneRaw: string;
  email: string;
  whatsapp: string;
  instagram: string;
  instagramHandle: string;
  facebook: string;
  hours: Hours[];
};

export type Review = {
  name: string;
  role: string;
  course: string;
  rating: number;
  date: string;
  quote: string;
  featured?: boolean;
};

export type Milestone = { year: string; dateTime: string | null; title: string; text: string };

export type CourseOffer = {
  id: string;
  discount: number | string;
  start: string;
  deadline: string;
};

export type CatalogCopy = Record<
  Format,
  { title: string; lead: string; detail: string; points: string[] }
>;

export type SiteContent = {
  hero: {
    title: string;
    lead: string;
    cta: string;
    video: string;
    poster: string;
    notes: string[];
  };
  learning: {
    kicker: string;
    title: string;
    text: string;
    cta: string;
    photos: { src: string; alt: string; caption: string }[];
  };
  story: {
    title: string;
    lead: string;
    milestones: Milestone[];
    purposeTitle: string;
    purpose: string;
    visionTitle: string;
    vision: string;
    facade: string;
    facadeAlt: string;
  };
  reviews: {
    average: number;
    count: number;
    recommend: number;
    breakdown: { stars: number; percent: number }[];
    items: Review[];
  };
  contact: Contact;
  offers: {
    title: string;
    courses: CourseOffer[];
    group: {
      id: string;
      title: string;
      image: string;
      deadline: string;
      value: string;
      valueNote: string;
    };
  };
  categories: Category[];
  catalogCopy: CatalogCopy;
  brand: { name: string; short: string; tagline: string };
};

export type ContentKey = keyof SiteContent;

export type Site = { content: SiteContent; courses: Course[] };

export type EnrollmentStatus = "nuevo" | "contactado" | "inscripto" | "baja";
export type PaymentStatus = "pendiente" | "sena" | "aprobado" | "rechazado";
export type AccessStatus = "no_solicitado" | "pendiente" | "otorgado" | "fallido";

export type Enrollment = {
  id: string;
  code: string;
  createdAt: string;
  name: string;
  dni: string;
  email: string;
  phone: string;
  courseId: string;
  courseTitle: string;
  modality: Format;
  shift: string;
  status: EnrollmentStatus;
  payment: PaymentStatus;
  amount: number;
  notes: string;
  source: "web" | "equipo" | "ejemplo";
  access: AccessStatus;
  accessNote: string;
  mpOrderId: string;
  mpStatus: string;
  paidAt: string | null;
  updatedAt: string;
};
