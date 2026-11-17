import Link from "next/link";
import type { CSSProperties } from "react";
import { courseFormats, formatMoney, inkOn, modalityById } from "@/lib/institution";
import type { Category, Course } from "@/lib/types";

export function CourseCard({ course, category }: { course: Course; category?: Category }) {
  const formats = courseFormats(course);
  const presencialOnly = formats.length === 1 && formats[0] === "presencial";
  const style = {
    "--accent": category?.color,
    "--soft": category?.soft,
    "--ink": inkOn(category?.color),
  } as CSSProperties;

  return (
    <article className="course-card" style={style}>
      <Link href={`/cursos/${course.id}`} className="card-media">
        <img src={course.image} alt={course.title} width="1400" height="900" loading="lazy" />
        <span className="card-chip">{category?.name}</span>
        {course.ministry ? <span className="card-seal">Ministerio</span> : null}
      </Link>
      <div className="card-body">
        <h3>
          <Link href={`/cursos/${course.id}`}>{course.title}</Link>
        </h3>
        <p>{course.summary}</p>
        <div className="card-meta">
          <span>{course.durationMonths} meses</span>
          <span>
            {formats.map((id) => modalityById.get(id)?.label || course.modality).join(", ")}
          </span>
          <span>{formatMoney(course.cuota)} / mes</span>
          {presencialOnly ? <span>Liceo Laprida</span> : null}
        </div>
        <div className="card-actions">
          <Link href={`/cursos/${course.id}`} className="btn btn-ghost">
            Ver detalles
          </Link>
          <Link href={`/inscripcion?curso=${course.id}`} className="btn btn-enroll">
            Inscribirme
          </Link>
        </div>
      </div>
    </article>
  );
}
