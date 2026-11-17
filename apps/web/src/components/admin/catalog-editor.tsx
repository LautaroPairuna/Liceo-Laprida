"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { adminApi, type CourseDraft } from "@/lib/admin-api";
import { courseFormatsOf } from "@/lib/labels";
import type { Category, Course, Format } from "@/lib/types";
import { Field, ImageField } from "./fields";
import { LoadState, SITE_KEY, useSiteData } from "./use-admin-data";

const SHIFTS = ["Mañana", "Tarde", "Noche", "Tarde y noche", "A confirmar", "A tu ritmo"];
const FORMATS: { id: Format; label: string }[] = [
  { id: "presencial", label: "Presencial, en el Liceo" },
  { id: "hibrido", label: "Híbrido, Red Laprida" },
  { id: "virtual", label: "Virtual, Red Laprida" },
];

type Draft = Omit<CourseDraft, "durationMonths" | "hours" | "seats" | "matricula" | "cuota"> & {
  durationMonths: number | string;
  hours: number | string;
  seats: number | string;
  matricula: number | string;
  cuota: number | string;
  outcomesText: string;
  modulesText: string;
  requirementsText: string;
};

function toDraft(course: Course | CourseDraft): Draft {
  return {
    ...course,
    formats: courseFormatsOf(course as Course),
    outcomesText: course.outcomes.join("\n"),
    modulesText: course.modules.join("\n"),
    requirementsText: course.requirements.join("\n"),
  };
}

function blankCourse(categoryId: string | undefined): Draft {
  return toDraft({
    title: "",
    category: categoryId ?? "educacion",
    durationMonths: 3,
    hours: 72,
    formats: ["presencial"],
    ministry: false,
    practices: false,
    seats: 18,
    shift: "Tarde",
    matricula: 30000,
    cuota: 45000,
    requirements: ["DNI vigente", "Fotocopia del DNI", "2 fotos 4×4"],
    start: "2027-03-08",
    image: "/class-team.webp",
    summary: "",
    description: "",
    outcomes: [],
    modules: [],
  });
}

const lines = (text: string) =>
  text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

function fromDraft({ outcomesText, modulesText, requirementsText, ...draft }: Draft): CourseDraft {
  return {
    ...draft,
    durationMonths: Number(draft.durationMonths),
    hours: Number(draft.hours),
    seats: Number(draft.seats),
    matricula: Number(draft.matricula),
    cuota: Number(draft.cuota),
    outcomes: lines(outcomesText),
    modules: lines(modulesText),
    requirements: lines(requirementsText),
  };
}

type FormProps = {
  initial: Draft;
  categories: Category[];
  onSave: (draft: Draft) => Promise<void>;
  onDelete?: () => void;
  onDuplicate?: () => void;
};

function CourseForm({ initial, categories, onSave, onDelete, onDuplicate }: FormProps) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const shifts = SHIFTS.includes(draft.shift) ? SHIFTS : [draft.shift, ...SHIFTS];
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const toggleFormat = (id: Format) =>
    setDraft((prev) => ({
      ...prev,
      formats: prev.formats.includes(id)
        ? prev.formats.filter((item) => item !== id)
        : [...prev.formats, id],
    }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return setError("El curso necesita un nombre.");
    if (!draft.formats.length) return setError("Elegí al menos una modalidad.");
    setSaving(true);
    try {
      await onSave(draft);
      setError("");
    } catch (saveError) {
      setError((saveError as Error).message);
    }
    setSaving(false);
  };

  return (
    <form className="editor-card" onSubmit={submit}>
      <div className="fields">
        <Field className="span" label="Nombre">
          <input
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
            required
          />
        </Field>
        <Field label="Área">
          <select value={draft.category} onChange={(event) => set("category", event.target.value)}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Turno">
          <select value={draft.shift} onChange={(event) => set("shift", event.target.value)}>
            {shifts.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
        </Field>
        <div className="span">
          <span className="field-label">Dónde se cursa</span>
          <div className="checks">
            {FORMATS.map((format) => (
              <label key={format.id}>
                <input
                  type="checkbox"
                  checked={draft.formats.includes(format.id)}
                  onChange={() => toggleFormat(format.id)}
                />
                {format.label}
              </label>
            ))}
          </div>
        </div>
        <Field label="Meses">
          <input
            type="number"
            min="1"
            value={draft.durationMonths}
            onChange={(event) => set("durationMonths", event.target.value)}
          />
        </Field>
        <Field label="Horas">
          <input
            type="number"
            min="1"
            value={draft.hours}
            onChange={(event) => set("hours", event.target.value)}
          />
        </Field>
        <Field label="Cupos">
          <input
            type="number"
            min="1"
            value={draft.seats}
            onChange={(event) => set("seats", event.target.value)}
          />
        </Field>
        <Field label="Inicio">
          <input
            type="date"
            value={draft.start}
            onChange={(event) => set("start", event.target.value)}
          />
        </Field>
        <Field label="Matrícula">
          <input
            type="number"
            min="0"
            step="1000"
            value={draft.matricula}
            onChange={(event) => set("matricula", event.target.value)}
          />
        </Field>
        <Field label="Cuota">
          <input
            type="number"
            min="0"
            step="1000"
            value={draft.cuota}
            onChange={(event) => set("cuota", event.target.value)}
          />
        </Field>
        <label className="check-line">
          <input
            type="checkbox"
            checked={draft.ministry}
            onChange={(event) => set("ministry", event.target.checked)}
          />{" "}
          Ministerio de Educación
        </label>
        <label className="check-line">
          <input
            type="checkbox"
            checked={draft.practices}
            onChange={(event) => set("practices", event.target.checked)}
          />{" "}
          Prácticas profesionales
        </label>
        <ImageField label="Foto" value={draft.image} onChange={(value) => set("image", value)} />
        <Field className="span" label="Resumen">
          <textarea
            value={draft.summary}
            onChange={(event) => set("summary", event.target.value)}
          />
        </Field>
        <Field className="span" label="Descripción">
          <textarea
            value={draft.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </Field>
        <Field className="span" label="Al terminar" hint="Una línea por resultado.">
          <textarea
            value={draft.outcomesText}
            onChange={(event) => set("outcomesText", event.target.value)}
          />
        </Field>
        <Field className="span" label="Módulos" hint="Uno por línea.">
          <textarea
            value={draft.modulesText}
            onChange={(event) => set("modulesText", event.target.value)}
          />
        </Field>
        <Field className="span" label="Requisitos" hint="Uno por línea.">
          <textarea
            value={draft.requirementsText}
            onChange={(event) => set("requirementsText", event.target.value)}
          />
        </Field>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="form-actions">
        <button className="admin-btn admin-btn-save" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar curso"}
        </button>
        {initial.id ? (
          <button className="admin-btn" type="button" onClick={onDuplicate}>
            Duplicar
          </button>
        ) : null}
        {initial.id ? (
          <button className="admin-btn admin-btn-danger" type="button" onClick={onDelete}>
            Eliminar
          </button>
        ) : null}
        {initial.id ? (
          <a className="text-link" href={`/cursos/${initial.id}`}>
            Ver en la web
          </a>
        ) : null}
      </div>
    </form>
  );
}

export function CatalogEditor() {
  const site = useSiteData();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [house, setHouse] = useState("todas");
  const [notice, setNotice] = useState("");
  const refresh = () => queryClient.invalidateQueries({ queryKey: SITE_KEY });
  const save = useMutation({ mutationFn: adminApi.saveCourse, onSuccess: refresh });
  const remove = useMutation({ mutationFn: adminApi.removeCourse, onSuccess: refresh });
  const restore = useMutation({ mutationFn: adminApi.restoreCourses, onSuccess: refresh });

  if (!site.data) return <LoadState error={site.error} />;
  const { courses, content } = site.data;
  const categories = content.categories;
  const selectedId = params.get("curso") ?? "";
  const selected = courses.find((course) => course.id === selectedId);

  const needle = query.toLocaleLowerCase("es").trim();
  const visible = courses
    .filter((course) => {
      const formats = courseFormatsOf(course);
      if (house === "liceo" && !formats.includes("presencial")) return false;
      if (house === "hibrido" && !formats.includes("hibrido")) return false;
      if (house === "virtual" && !formats.includes("virtual")) return false;
      return !needle || course.title.toLocaleLowerCase("es").includes(needle);
    })
    .sort((a, b) => a.title.localeCompare(b.title, "es"));

  const open = (id: string) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("curso", id);
    else next.delete("curso");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    setNotice("");
  };

  const saveDraft = async (draft: Draft) => {
    const saved = await save.mutateAsync(fromDraft(draft));
    open(saved.id);
    setNotice(`Guardado «${saved.title}». Ya está en la web.`);
  };

  const duplicate = async () => {
    if (!selected) return;
    const saved = await save.mutateAsync({
      ...fromDraft(toDraft(selected)),
      id: undefined,
      title: `${selected.title} (copia)`,
    });
    open(saved.id);
    setNotice(`Listo. «${saved.title}» quedó en el catálogo.`);
  };

  const removeSelected = async () => {
    if (!selected) return;
    const ok = window.confirm(
      `¿Eliminar ${selected.title} del catálogo? Las inscripciones de ese curso se conservan.`,
    );
    if (!ok) return;
    await remove.mutateAsync(selected.id);
    open("");
    setNotice("Curso eliminado del catálogo.");
  };

  const restoreAll = async () => {
    const ok = window.confirm(
      "¿Volver al catálogo original? Se pierden los cursos agregados y los cambios.",
    );
    if (!ok) return;
    await restore.mutateAsync();
    open("");
    setNotice("Catálogo restaurado.");
  };

  return (
    <>
      <h1>Catálogo</h1>
      <p className="page-lead">
        Los cursos presenciales son del Liceo Laprida. Híbrido y virtual son de Red Laprida. Un
        curso puede estar en más de un formato.
      </p>
      {notice ? (
        <p className="notice" role="status">
          {notice}
        </p>
      ) : null}
      {remove.error || restore.error ? (
        <p className="admin-banner" role="alert">
          {(remove.error ?? restore.error)?.message}
        </p>
      ) : null}
      <div className="catalog-desk">
        <div>
          <div className="picker-actions">
            <button
              type="button"
              className="admin-btn admin-btn-save"
              onClick={() => open("nuevo")}
            >
              Nuevo curso
            </button>
            <button type="button" className="linkish" onClick={restoreAll}>
              Restaurar original
            </button>
          </div>
          <div className="course-tools">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar curso"
              aria-label="Buscar curso"
            />
            <div className="chip-row" role="group" aria-label="Filtrar por casa">
              {[
                ["todas", "Todos"],
                ["liceo", "Liceo"],
                ["hibrido", "Híbrido"],
                ["virtual", "Virtual"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={house === id ? "chip is-active" : "chip"}
                  aria-pressed={house === id}
                  onClick={() => setHouse(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="course-list">
            {visible.length ? (
              visible.map((course) => {
                const formats = courseFormatsOf(course);
                return (
                  <button
                    key={course.id}
                    type="button"
                    className={course.id === selectedId ? "course-pick is-active" : "course-pick"}
                    aria-current={course.id === selectedId ? "true" : undefined}
                    onClick={() => open(course.id)}
                  >
                    <strong>{course.title}</strong>
                    <span className="format-marks">
                      {formats.includes("presencial") ? (
                        <span className="mark-liceo">Liceo</span>
                      ) : null}
                      {formats.includes("hibrido") ? (
                        <span className="mark-hibrido">Híbrido</span>
                      ) : null}
                      {formats.includes("virtual") ? (
                        <span className="mark-virtual">Virtual</span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="page-lead">No hay cursos con ese filtro.</p>
            )}
          </div>
        </div>
        <div>
          {selectedId === "nuevo" ? (
            <CourseForm
              key="nuevo"
              initial={blankCourse(categories[0]?.id)}
              categories={categories}
              onSave={saveDraft}
            />
          ) : selected ? (
            <CourseForm
              key={selected.id}
              initial={toDraft(selected)}
              categories={categories}
              onSave={saveDraft}
              onDelete={removeSelected}
              onDuplicate={duplicate}
            />
          ) : (
            <div className="editor-card">
              <p>Elegí un curso de la lista o creá uno nuevo.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
