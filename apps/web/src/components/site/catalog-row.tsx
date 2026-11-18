import Link from "next/link";
import type { CSSProperties } from "react";
import { accentStyle, formatIntakeDate, formatMoney } from "@/lib/institution";
import type { Category, Course, Format } from "@/lib/types";

function rhythmFor(modalityId: Format, course: Course) {
  if (modalityId === "virtual") return "A tu ritmo";
  if (modalityId === "hibrido") return "Clases en vivo";
  return course.shift;
}

type Props = {
  course: Course;
  category?: Category;
  modalityId: Format;
  modalityLabel: string;
  accent: string;
};

export function CatalogRow({ course, category, modalityId, modalityLabel, accent }: Props) {
  const detailHref = `/cursos/${course.id}?modalidad=${modalityId}`;
  const enrollHref = `/inscripcion?curso=${course.id}&modalidad=${modalityId}`;

  return (
    <article className="catalog-card" style={accentStyle(accent) as CSSProperties}>
      <div className="catalog-card-tags">
        <span className="catalog-card-tag">{category?.name}</span>
        {course.ministry ? <span className="catalog-card-note">Ministerio</span> : null}
      </div>
      <h3>
        <Link href={detailHref}>{course.title}</Link>
      </h3>
      <p>{course.summary}</p>
      <dl className="catalog-card-facts">
        <div>
          <dt>Duración</dt>
          <dd>
            {course.durationMonths} meses
            <small>{course.hours} horas</small>
          </dd>
        </div>
        <div>
          <dt>Inicio</dt>
          <dd>
            <time dateTime={course.start}>{formatIntakeDate(course.start)}</time>
          </dd>
        </div>
        <div>
          <dt>Modalidad</dt>
          <dd>
            {modalityLabel}
            <small>{rhythmFor(modalityId, course)}</small>
          </dd>
        </div>
        <div>
          <dt>Cuota</dt>
          <dd>
            {formatMoney(course.cuota)}
            <small>por mes</small>
          </dd>
        </div>
      </dl>
      <div className="catalog-card-actions">
        <Link href={detailHref} className="btn btn-ghost">
          Ver detalles
        </Link>
        <Link href={enrollHref} className="btn btn-enroll">
          Inscribirme
        </Link>
      </div>
    </article>
  );
}
