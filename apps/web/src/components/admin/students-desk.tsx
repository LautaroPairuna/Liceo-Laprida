"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { adminApi, type EnrollmentDraft } from "@/lib/admin-api";
import { downloadExcel } from "@/lib/excel";
import { formatMoney, houseName } from "@/lib/institution";
import {
  ACCESS,
  accessLabel,
  courseFormatsOf,
  FORMAT_LABEL,
  formatDate,
  PAYMENTS,
  paymentLabel,
  SOURCES,
  STATUS,
  statusLabel,
} from "@/lib/labels";
import type { Course, Enrollment, Format } from "@/lib/types";
import { ENROLLMENTS_KEY, LoadState, useEnrollments, useSiteData } from "./use-admin-data";

const SHIFTS = ["Mañana", "Tarde", "Noche", "Tarde y noche", "A confirmar", "A tu ritmo"];

type Draft = Omit<EnrollmentDraft, "amount"> & { amount: number | string };

function blankStudent(course: Course | undefined): Draft {
  return {
    name: "",
    dni: "",
    email: "",
    phone: "",
    courseId: course?.id ?? "",
    modality: courseFormatsOf(course)[0],
    shift: "Tarde",
    status: "contactado",
    payment: "pendiente",
    access: "no_solicitado",
    amount: course ? course.matricula + course.cuota : 0,
    notes: "",
  };
}

type FormProps = {
  initial: Draft;
  record?: Enrollment;
  courses: Course[];
  onSave: (draft: Draft) => Promise<Enrollment>;
  onDelete?: () => void;
  onClose: () => void;
};

function StudentForm({ initial, record, courses, onSave, onDelete, onClose }: FormProps) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const course = courses.find((item) => item.id === draft.courseId);
  const formats = courseFormatsOf(course);
  const mismatch = course && !formats.includes(draft.modality);
  const shifts = SHIFTS.includes(draft.shift) ? SHIFTS : [draft.shift, ...SHIFTS];
  const sorted = [...courses].sort((a, b) => a.title.localeCompare(b.title, "es"));
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const chooseCourse = (courseId: string) => {
    const nextCourse = courses.find((item) => item.id === courseId);
    const nextFormats = courseFormatsOf(nextCourse);
    setDraft((prev) => ({
      ...prev,
      courseId,
      modality: nextFormats.includes(prev.modality) ? prev.modality : nextFormats[0],
      amount: nextCourse ? nextCourse.matricula + nextCourse.cuota : prev.amount,
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return setError("La ficha necesita un nombre.");
    if (!draft.courseId) return setError("Elegí un curso.");
    setSaving(true);
    try {
      const saved = await onSave(draft);
      setDraft((current) => ({ ...current, expectedUpdatedAt: saved.updatedAt }));
      setError("");
    } catch (saveError) {
      setError((saveError as Error).message);
    }
    setSaving(false);
  };

  const tone =
    draft.modality === "hibrido"
      ? "record-hibrido"
      : draft.modality === "virtual"
        ? "record-red"
        : "record-liceo";

  return (
    <form className={`record ${tone}`} onSubmit={submit}>
      <div className="record-head">
        <div>
          <h2>{draft.name || "Nueva ficha"}</h2>
          {record ? (
            <p>
              {record.code} · {SOURCES[record.source] ?? record.source} ·{" "}
              {formatDate(record.createdAt)}
            </p>
          ) : (
            <p>La carga el equipo. No viene de la web.</p>
          )}
        </div>
        <button type="button" className="linkish" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <div className="stack-fields">
        <label className="field">
          Nombre
          <input
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label className="field">
          DNI
          <input
            value={draft.dni}
            onChange={(event) => set("dni", event.target.value)}
            inputMode="numeric"
          />
        </label>
        <label className="field">
          Correo
          <input
            type="email"
            value={draft.email}
            onChange={(event) => set("email", event.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="field">
          Teléfono
          <input
            value={draft.phone}
            onChange={(event) => set("phone", event.target.value)}
            autoComplete="tel"
          />
        </label>
        <label className="field">
          Curso
          <select
            value={draft.courseId}
            onChange={(event) => chooseCourse(event.target.value)}
            required
          >
            <option value="">Elegí un curso…</option>
            {record && !record.courseId ? (
              <option value="">{record.courseTitle} (dado de baja)</option>
            ) : null}
            {sorted.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Modalidad
          <select
            value={draft.modality}
            onChange={(event) => set("modality", event.target.value as Format)}
          >
            <option value="presencial">Presencial · Liceo Laprida</option>
            <option value="hibrido">Híbrido · Red Laprida</option>
            <option value="virtual">Virtual · Red Laprida</option>
          </select>
        </label>
        {mismatch ? <p className="field-error">Ese curso no se ofrece en esa modalidad.</p> : null}
        <label className="field">
          Turno
          <select value={draft.shift} onChange={(event) => set("shift", event.target.value)}>
            {shifts.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Estado
          <select
            value={draft.status}
            onChange={(event) => set("status", event.target.value as Draft["status"])}
          >
            {STATUS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Pago
          <select
            value={draft.payment}
            onChange={(event) => set("payment", event.target.value as Draft["payment"])}
          >
            {PAYMENTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          {record?.mpOrderId ? (
            <small>
              Mercado Pago: {record.mpOrderId}
              {record.mpStatus ? ` · ${record.mpStatus}` : ""}
              {record.paidAt ? ` · acreditado el ${formatDate(record.paidAt)}` : ""}
            </small>
          ) : null}
        </label>
        <label className="field">
          Plataforma educativa
          <select
            value={draft.access}
            onChange={(event) => set("access", event.target.value as Draft["access"])}
          >
            {ACCESS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          {record?.accessNote ? <small>{record.accessNote}</small> : null}
        </label>
        <label className="field">
          Importe de la inscripción
          <input
            type="number"
            min="0"
            step="1000"
            value={draft.amount}
            onChange={(event) => set("amount", event.target.value)}
          />
          <small>
            Al cambiar de curso se propone matrícula + primera cuota. Hoy:{" "}
            {formatMoney(Number(draft.amount) || 0)}.
          </small>
        </label>
        <label className="field">
          Notas
          <textarea value={draft.notes} onChange={(event) => set("notes", event.target.value)} />
        </label>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="form-actions">
        <button className="admin-btn admin-btn-save" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar ficha"}
        </button>
        {record ? (
          <button className="admin-btn admin-btn-danger" type="button" onClick={onDelete}>
            Eliminar
          </button>
        ) : null}
      </div>
    </form>
  );
}

type Filters = Record<"q" | "casa" | "modalidad" | "curso" | "estado" | "pago" | "acceso", string>;

function matches(item: Enrollment, filters: Filters) {
  if (filters.casa === "liceo" && item.modality !== "presencial") return false;
  if (filters.casa === "red" && item.modality === "presencial") return false;
  if (filters.modalidad && item.modality !== filters.modalidad) return false;
  if (filters.curso && item.courseId !== filters.curso) return false;
  if (filters.estado && item.status !== filters.estado) return false;
  if (filters.pago && item.payment !== filters.pago) return false;
  if (filters.acceso === "pendiente" && item.access !== "pendiente" && item.access !== "fallido") {
    return false;
  }
  const needle = filters.q.toLocaleLowerCase("es").trim();
  if (!needle) return true;
  const haystack =
    `${item.name} ${item.dni} ${item.email} ${item.phone} ${item.code} ${item.courseTitle}`.toLocaleLowerCase(
      "es",
    );
  return haystack.includes(needle);
}

const toDraft = (item: Enrollment): Draft => ({
  id: item.id,
  expectedUpdatedAt: item.updatedAt,
  name: item.name,
  dni: item.dni,
  email: item.email,
  phone: item.phone,
  courseId: item.courseId,
  modality: item.modality,
  shift: item.shift,
  status: item.status,
  payment: item.payment,
  access: item.access,
  amount: item.amount,
  notes: item.notes,
});

export function StudentsDesk() {
  const site = useSiteData();
  const enrollmentsQuery = useEnrollments();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [notice, setNotice] = useState("");
  const refresh = () => queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
  const save = useMutation({ mutationFn: adminApi.saveEnrollment, onSuccess: refresh });
  const remove = useMutation({ mutationFn: adminApi.removeEnrollment, onSuccess: refresh });
  const clearExamples = useMutation({ mutationFn: adminApi.removeExamples, onSuccess: refresh });
  const selectedId = params.get("alumno") ?? "";

  const setFilter = (partial: Partial<Filters & { alumno: string }>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(partial)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // Escape closes the open record, except while typing in a field.
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const next = new URLSearchParams(window.location.search);
      next.delete("alumno");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, pathname, router]);

  if (!site.data || !enrollmentsQuery.data) {
    return <LoadState error={site.error ?? enrollmentsQuery.error} />;
  }

  const courses = site.data.courses;
  const enrollments = enrollmentsQuery.data;
  const filters: Filters = {
    q: params.get("q") ?? "",
    casa: params.get("casa") ?? "",
    modalidad: params.get("modalidad") ?? "",
    curso: params.get("curso") ?? "",
    estado: params.get("estado") ?? "",
    pago: params.get("pago") ?? "",
    acceso: params.get("acceso") ?? "",
  };
  const filtered = enrollments.filter((item) => matches(item, filters));
  const selected = enrollments.find((item) => item.id === selectedId);
  const hasExamples = enrollments.some((item) => item.source === "ejemplo");
  const filtering = Object.values(filters).some(Boolean);
  const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title, "es"));

  const saveDraft = async (draft: Draft) => {
    const saved = await save.mutateAsync({ ...draft, amount: Number(draft.amount) || 0 });
    if (draft.id) {
      setNotice("Ficha guardada.");
      return saved;
    }
    setFilter({ alumno: saved.id });
    setNotice("Ficha cargada.");
    return saved;
  };

  const removeSelected = async () => {
    if (!selected) return;
    if (!window.confirm(`¿Eliminar la ficha de ${selected.name}?`)) return;
    await remove.mutateAsync(selected.id);
    setFilter({ alumno: "" });
    setNotice("Ficha eliminada.");
  };

  const exportRows = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadExcel(
      `alumnos-laprida-${stamp}.xls`,
      filtered.map((item) => ({
        Nombre: item.name,
        DNI: item.dni,
        Correo: item.email,
        Teléfono: item.phone,
        Curso: item.courseTitle,
        Casa: houseName(item.modality),
        Modalidad: FORMAT_LABEL[item.modality] ?? item.modality,
        Turno: item.shift,
        Estado: statusLabel(item.status),
        Pago: paymentLabel(item.payment),
        Plataforma: accessLabel(item.access),
        Importe: item.amount,
        Fecha: formatDate(item.createdAt),
        Código: item.code,
        Origen: SOURCES[item.source] ?? item.source,
        Notas: item.notes,
      })),
    );
  };

  const clearFilters = () =>
    router.replace(selectedId ? `${pathname}?alumno=${selectedId}` : pathname, { scroll: false });

  const dropExamples = async () => {
    if (
      !window.confirm(
        "¿Borrar todas las fichas de ejemplo? Las inscripciones de la web se conservan.",
      )
    ) {
      return;
    }
    await clearExamples.mutateAsync();
    if (selected?.source === "ejemplo") setFilter({ alumno: "" });
    setNotice("Ejemplos borrados.");
  };

  return (
    <>
      <h1>Alumnos</h1>
      <p className="page-lead">
        Inscripciones que llegan por la web y fichas que carga el equipo. El Excel sale con el
        listado que estás viendo.
      </p>
      {hasExamples ? (
        <p className="admin-note">
          Hay fichas de ejemplo para ver el panel. Las inscripciones reales se suman cuando alguien
          completa el formulario de la web.{" "}
          <button type="button" className="linkish" onClick={dropExamples}>
            Borrar ejemplos
          </button>
        </p>
      ) : null}
      {notice ? (
        <p className="notice" role="status">
          {notice}
        </p>
      ) : null}
      {remove.error || clearExamples.error ? (
        <p className="admin-banner" role="alert">
          {(remove.error ?? clearExamples.error)?.message}
        </p>
      ) : null}

      <div className="student-tools">
        <div className="tool-line">
          <button
            type="button"
            className="admin-btn admin-btn-save"
            onClick={() => setFilter({ alumno: "nuevo" })}
          >
            Cargar alumno
          </button>
          <button
            type="button"
            className="admin-btn"
            onClick={exportRows}
            disabled={!filtered.length}
          >
            Descargar Excel
          </button>
          <span className="result-count">
            {filtered.length} {filtered.length === 1 ? "ficha" : "fichas"}
            {filtering ? ` de ${enrollments.length}` : ""}
          </span>
        </div>
        <input
          type="search"
          value={filters.q}
          onChange={(event) => setFilter({ q: event.target.value })}
          placeholder="Nombre, DNI, correo o código"
          aria-label="Buscar alumno"
        />
        <div className="chip-row" role="group" aria-label="Casa">
          {[
            ["", "Todas"],
            ["liceo", "Liceo"],
            ["red", "Red"],
          ].map(([id, label]) => (
            <button
              key={label}
              type="button"
              className={filters.casa === id ? "chip is-active" : "chip"}
              aria-pressed={filters.casa === id}
              onClick={() =>
                setFilter({ casa: id, modalidad: id === "liceo" ? "" : filters.modalidad })
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="chip-row" role="group" aria-label="Modalidad">
          {[
            ["", "Todas las modalidades"],
            ["presencial", "Presencial"],
            ["hibrido", "Híbrido"],
            ["virtual", "Virtual"],
          ].map(([id, label]) => (
            <button
              key={label}
              type="button"
              className={filters.modalidad === id ? "chip is-active" : "chip"}
              aria-pressed={filters.modalidad === id}
              onClick={() =>
                setFilter({
                  modalidad: id,
                  casa: id === "presencial" ? "liceo" : id ? "red" : filters.casa,
                })
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="tool-line">
          <label className="field">
            Curso
            <select
              value={filters.curso}
              onChange={(event) => setFilter({ curso: event.target.value })}
            >
              <option value="">Todos</option>
              {sortedCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Estado
            <select
              value={filters.estado}
              onChange={(event) => setFilter({ estado: event.target.value })}
            >
              <option value="">Todos</option>
              {STATUS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Pago
            <select
              value={filters.pago}
              onChange={(event) => setFilter({ pago: event.target.value })}
            >
              <option value="">Todos</option>
              {PAYMENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Plataforma
            <select
              value={filters.acceso}
              onChange={(event) => setFilter({ acceso: event.target.value })}
            >
              <option value="">Todos</option>
              <option value="pendiente">Esperan el alta</option>
            </select>
          </label>
          {filtering ? (
            <button type="button" className="linkish" onClick={clearFilters}>
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </div>

      <div className={selectedId ? "students-layout has-record" : "students-layout"}>
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
              {filtered.length ? (
                filtered.map((item) => (
                  <tr key={item.id} className={item.id === selectedId ? "is-selected" : ""}>
                    <td>
                      <button
                        type="button"
                        className="row-open"
                        onClick={() => setFilter({ alumno: item.id })}
                      >
                        {item.name}
                      </button>
                    </td>
                    <td>{item.courseTitle}</td>
                    <td>
                      <span className={`tone-${item.modality}`}>{FORMAT_LABEL[item.modality]}</span>
                      <small className="house-hint">{houseName(item.modality)}</small>
                    </td>
                    <td className={`status-${item.status}`}>{statusLabel(item.status)}</td>
                    <td className="col-optional">
                      {paymentLabel(item.payment)}
                      {item.access === "pendiente" || item.access === "fallido" ? (
                        <small className="house-hint">Alta: {accessLabel(item.access)}</small>
                      ) : null}
                    </td>
                    <td className="col-optional">{formatDate(item.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No hay alumnos con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selectedId === "nuevo" ? (
          <StudentForm
            key="nuevo"
            initial={blankStudent(courses[0])}
            courses={courses}
            onSave={saveDraft}
            onClose={() => setFilter({ alumno: "" })}
          />
        ) : selected ? (
          <StudentForm
            key={selected.id}
            initial={toDraft(selected)}
            record={selected}
            courses={courses}
            onSave={saveDraft}
            onDelete={removeSelected}
            onClose={() => setFilter({ alumno: "" })}
          />
        ) : null}
      </div>
    </>
  );
}
