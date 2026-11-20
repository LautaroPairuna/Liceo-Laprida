import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { CourseCard } from "@/components/site/course-card";
import { imageSrcSet, sizedImage } from "@/lib/image-url";
import { courseFormats, formatMoney, isFormat, modalityById } from "@/lib/institution";
import { getCourse } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/cursos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const found = await getCourse(id);
  if (!found) notFound();
  const { course, content } = found;
  return {
    title: `${course.title} | ${content.brand.name}`,
    description: course.summary,
    alternates: { canonical: `/cursos/${course.id}` },
    openGraph: { title: course.title, description: course.summary, images: [course.image] },
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: PageProps<"/cursos/[id]">) {
  const [{ id }, { modalidad }] = await Promise.all([params, searchParams]);
  const found = await getCourse(id);
  if (!found) notFound();
  const { course, content, courses } = found;

  const category = content.categories.find((item) => item.id === course.category) ?? {
    id: course.category,
    name: "Curso",
    color: "#1769a7",
  };
  const formats = courseFormats(course);
  const requested = typeof modalidad === "string" && isFormat(modalidad) ? modalidad : undefined;
  const activeFormat = modalityById.get(
    requested && formats.includes(requested) ? requested : formats[0],
  );
  const related = courses
    .filter((item) => item.category === course.category && item.id !== course.id)
    .slice(0, 3);
  const total = course.matricula + course.cuota * course.durationMonths;
  const categoryById = new Map(content.categories.map((item) => [item.id, item]));
  const contact = content.contact;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary,
    provider: { "@type": "EducationalOrganization", name: contact.legalName },
    offers: { "@type": "Offer", price: course.matricula, priceCurrency: "ARS" },
  };

  return (
    <main id="main-content" className="page-detail">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD needs a raw script body; "<" is escaped
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section
        className="detail-hero"
        data-theme="dark"
        style={{ "--accent": category.color } as CSSProperties}
      >
        <img
          src={sizedImage(course.image, 1600)}
          srcSet={imageSrcSet(course.image, [800, 1200, 1600])}
          sizes="100vw"
          alt=""
          width="1400"
          height="900"
          fetchPriority="high"
        />
        <div className="detail-hero-copy enter">
          <Link
            href={`/cursos?modalidad=${activeFormat?.id ?? "presencial"}&area=${course.category}`}
            className="eyebrow light"
          >
            {category.name}
          </Link>
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          {activeFormat?.id === "presencial" ? (
            <p>
              Se cursa en el {contact.legalName}, {contact.locality}.
            </p>
          ) : null}
          <div className="detail-pills">
            <span>{course.durationMonths} meses</span>
            <span>{course.hours} horas</span>
            <span>{activeFormat?.label ?? course.modality}</span>
            <span>
              {activeFormat?.id === "hibrido"
                ? "Campus y Zoom"
                : activeFormat?.id === "virtual"
                  ? "A tu ritmo"
                  : course.shift}
            </span>
            {course.ministry ? <span>Ministerio de Educación</span> : null}
            {course.practices ? <span>Prácticas profesionales</span> : null}
          </div>
        </div>
      </section>

      <section className="detail-layout">
        <article>
          <h2>El trayecto</h2>
          <p>{course.description}</p>
          <h3>Cuando termines</h3>
          <ul>
            {course.outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Módulos</h3>
          <ol className="module-list">
            {course.modules.map((item, index) => (
              <li key={item}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                {item}
              </li>
            ))}
          </ol>
          <h3>Requisitos</h3>
          <ul>
            {course.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <section className="enroll-card" aria-label="Inscripción">
          <p className="section-kicker">Inscripción</p>
          <h3>Reservá tu lugar</h3>
          <dl>
            <div>
              <dt>Matrícula</dt>
              <dd>{formatMoney(course.matricula)}</dd>
            </div>
            <div>
              <dt>Cuota mensual</dt>
              <dd>{formatMoney(course.cuota)}</dd>
            </div>
            <div>
              <dt>Inversión total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
            <div>
              <dt>Cupos</dt>
              <dd>{course.seats} alumnos</dd>
            </div>
          </dl>
          <Link
            href={`/inscripcion?curso=${course.id}&modalidad=${activeFormat?.id ?? "presencial"}`}
            className="btn btn-enroll btn-full"
          >
            Inscribirme
          </Link>
          <p className="fine-print">
            Completá tus datos, revisá el precio final y continuá con Mercado Pago.
          </p>
        </section>
      </section>

      {related.length > 0 ? (
        <section className="related">
          <h2>También en {category.name}</h2>
          <div className="course-grid">
            {related.map((item) => (
              <CourseCard key={item.id} course={item} category={categoryById.get(item.category)} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
