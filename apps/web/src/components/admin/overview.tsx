"use client";

import Link from "next/link";
import { formatMoney, houseName } from "@/lib/institution";
import { courseFormatsOf, FORMAT_LABEL, formatDate } from "@/lib/labels";
import type { Course, Enrollment, Format } from "@/lib/types";
import { LoadState, useEnrollments, useSiteData } from "./use-admin-data";

type Row = { id: string; title: string; total: number } & Record<Format, number>;

function summarize(courses: Course[], enrollments: Enrollment[]) {
  const courseCount: Record<Format, number> = { presencial: 0, hibrido: 0, virtual: 0 };
  for (const course of courses) {
    for (const format of courseFormatsOf(course)) courseCount[format] += 1;
  }

  const people: Record<Format, number> = { presencial: 0, hibrido: 0, virtual: 0 };
  const pending: Record<Format, number> = { presencial: 0, hibrido: 0, virtual: 0 };
  const money: Record<Format, number> = { presencial: 0, hibrido: 0, virtual: 0 };
  let bajas = 0;
  let thisMonth = 0;
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const byCourse = new Map<string, Row>(
    courses.map((course) => [
      course.id,
      { id: course.id, title: course.title, presencial: 0, hibrido: 0, virtual: 0, total: 0 },
    ]),
  );

  for (const item of enrollments) {
    if (item.createdAt.slice(0, 7) === monthPrefix) thisMonth += 1;
    if (item.status === "baja") {
      bajas += 1;
      continue;
    }
    const modality = item.modality;
    people[modality] += 1;
    if (item.status === "nuevo") pending[modality] += 1;
    if (item.payment === "aprobado") money[modality] += item.amount;
    const key = item.courseId || `baja:${item.courseTitle}`;
    const row = byCourse.get(key) ?? {
      id: key,
      title: `${item.courseTitle} (dado de baja)`,
      presencial: 0,
      hibrido: 0,
      virtual: 0,
      total: 0,
    };
    row[modality] += 1;
    row.total += 1;
    byCourse.set(key, row);
  }

  const rows = [...byCourse.values()].sort(
    (a, b) => b.total - a.total || a.title.localeCompare(b.title, "es"),
  );
  return {
    courseCount,
    people,
    pending,
    money,
    bajas,
    thisMonth,
    rows,
    recent: enrollments.slice(0, 6),
    totalPeople: people.presencial + people.hibrido + people.virtual,
  };
}

const peopleLabel = (count: number) => (count === 1 ? "persona inscripta" : "personas inscriptas");

export function Overview() {
  const site = useSiteData();
  const enrollmentsQuery = useEnrollments();
  if (!site.data || !enrollmentsQuery.data) {
    return <LoadState error={site.error ?? enrollmentsQuery.error} />;
  }

  const courses = site.data.courses;
  const enrollments = enrollmentsQuery.data;
  const stats = summarize(courses, enrollments);
  const activeRows = stats.rows.filter((row) => row.total > 0);
  const emptyRows = stats.rows.filter((row) => row.total === 0);
  const hasExamples = enrollments.some((item) => item.source === "ejemplo");
  const pendingAccess = enrollments.filter(
    (item) => item.access === "pendiente" || item.access === "fallido",
  ).length;
  const redPeople = stats.people.hibrido + stats.people.virtual;
  const redMoney = stats.money.hibrido + stats.money.virtual;
  const redPending = stats.pending.hibrido + stats.pending.virtual;

  return (
    <>
      <h1>General</h1>
      <p className="page-lead">
        Cursos e inscriptos, con la sede del Liceo separada de los formatos digitales de Red
        Laprida.
      </p>
      {hasExamples ? (
        <p className="admin-note">
          Los totales incluyen fichas de ejemplo. En Alumnos se pueden borrar cuando lleguen
          inscripciones reales.
        </p>
      ) : null}
      {pendingAccess ? (
        <p className="admin-note">
          Hay {pendingAccess} {pendingAccess === 1 ? "alumno pagó" : "alumnos pagaron"} y{" "}
          {pendingAccess === 1 ? "espera" : "esperan"} el alta en la plataforma educativa.{" "}
          <Link className="text-link" href="/admin/alumnos?acceso=pendiente">
            Ver alumnos
          </Link>
        </p>
      ) : null}
      <p className="desk-facts">
        Hay {courses.length} cursos y {stats.totalPeople} inscriptos activos. Este mes entraron{" "}
        {stats.thisMonth} fichas.
        {stats.bajas
          ? ` Hay ${stats.bajas} ${stats.bajas === 1 ? "baja" : "bajas"}, fuera de los inscriptos.`
          : " No hay bajas."}
      </p>

      <div className="houses">
        <article className="house house-liceo">
          <header className="house-head">
            <img className="house-logo" src="/logo.png" alt="" />
            <div>
              <p className="house-kicker">Sede en San Juan</p>
              <h2>Liceo Laprida</h2>
            </div>
          </header>
          <p className="house-sentence">
            <strong>{stats.people.presencial}</strong> {peopleLabel(stats.people.presencial)} para
            cursar en la sede.
          </p>
          <dl className="house-stats">
            <div>
              <dt>Cursos presenciales</dt>
              <dd>{stats.courseCount.presencial}</dd>
            </div>
            <div>
              <dt>Sin contactar</dt>
              <dd>{stats.pending.presencial}</dd>
            </div>
            <div>
              <dt>Pagos aprobados</dt>
              <dd>{formatMoney(stats.money.presencial)}</dd>
            </div>
          </dl>
          <Link className="text-link" href="/admin/alumnos?casa=liceo">
            Ver inscriptos del Liceo
          </Link>
        </article>

        <article className="house house-red">
          <header className="house-head">
            <span className="house-sigil" aria-hidden="true">
              R
            </span>
            <div>
              <p className="house-kicker">Formatos digitales</p>
              <h2>Red Laprida</h2>
            </div>
          </header>
          <p className="house-sentence">
            <strong>{redPeople}</strong> {peopleLabel(redPeople)} en híbrido y virtual.
          </p>
          <div className="red-split">
            <article>
              <h3 className="tone-hibrido">Híbrido</h3>
              <strong className="tone-hibrido">{stats.people.hibrido}</strong>
              <p>{stats.courseCount.hibrido} cursos</p>
              <Link className="text-link" href="/admin/alumnos?modalidad=hibrido">
                Ver híbridos
              </Link>
            </article>
            <article>
              <h3 className="tone-virtual">Virtual</h3>
              <strong className="tone-virtual">{stats.people.virtual}</strong>
              <p>{stats.courseCount.virtual} cursos</p>
              <Link className="text-link" href="/admin/alumnos?modalidad=virtual">
                Ver virtuales
              </Link>
            </article>
          </div>
          <dl className="house-stats">
            <div>
              <dt>Sin contactar</dt>
              <dd>{redPending}</dd>
            </div>
            <div>
              <dt>Pagos aprobados</dt>
              <dd>{formatMoney(redMoney)}</dd>
            </div>
          </dl>
        </article>
      </div>

      <section className="ledger-block" aria-labelledby="por-curso">
        <h2 id="por-curso">Inscripciones por curso</h2>
        <div className="table-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Curso</th>
                <th className="num">Liceo</th>
                <th className="num">Híbrido</th>
                <th className="num">Virtual</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.length ? (
                activeRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={`/admin/alumnos?curso=${row.id}`}>{row.title}</Link>
                    </td>
                    <td className={row.presencial ? "num num-liceo" : "num num-zero"}>
                      {row.presencial}
                    </td>
                    <td className={row.hibrido ? "num num-hibrido" : "num num-zero"}>
                      {row.hibrido}
                    </td>
                    <td className={row.virtual ? "num num-virtual" : "num num-zero"}>
                      {row.virtual}
                    </td>
                    <td className="num">{row.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>Todavía no hay inscriptos activos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {emptyRows.length ? (
          <details className="empty-courses">
            <summary>Cursos sin inscriptos ({emptyRows.length})</summary>
            <ul>
              {emptyRows.map((row) => (
                <li key={row.id}>
                  <Link href={`/admin/catalogo?curso=${row.id}`}>{row.title}</Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section className="ledger-block" aria-labelledby="ultimas">
        <h2 id="ultimas">Últimas fichas</h2>
        {stats.recent.length ? (
          <div className="recent">
            {stats.recent.map((item) => (
              <Link key={item.id} href={`/admin/alumnos?alumno=${item.id}`}>
                <span className="recent-date">{formatDate(item.createdAt)}</span>
                <strong>{item.name}</strong>
                <span>{item.courseTitle}</span>
                <span className={`tone-${item.modality}`}>
                  {FORMAT_LABEL[item.modality]} · {houseName(item.modality)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p>Cuando alguien se inscriba en la web, la ficha va a aparecer acá.</p>
        )}
      </section>
    </>
  );
}
