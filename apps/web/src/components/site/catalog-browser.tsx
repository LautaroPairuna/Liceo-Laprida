"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type CSSProperties, useDeferredValue, useRef } from "react";
import {
  accentFor,
  accentStyle,
  courseFormats,
  intakes,
  modalities,
  modalityById,
} from "@/lib/institution";
import type { Category, Course, Format } from "@/lib/types";
import { CatalogRow } from "./catalog-row";

type Props = { modality: Format; courses: Course[]; categories: Category[] };

// 12 fills whole rows in the 3, 2 and 1 column layouts of the grid.
const PAGE_SIZE = 12;

/** Page numbers to show: first, last and the current one with its neighbours; null = gap. */
function pageItems(current: number, total: number): (number | null)[] {
  const pages = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  return pages.flatMap((page, index) =>
    index > 0 && page - pages[index - 1] > 1 ? [null, page] : [page],
  );
}

export function CatalogBrowser({ modality, courses, categories }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const boardRef = useRef<HTMLDivElement>(null);
  const activeModality = modalityById.get(modality) ?? modalities[0];
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const requestedArea = params.get("area") || "all";
  const query = params.get("q") || "";
  const duration = params.get("duracion") || "all";
  const inicio = params.get("inicio") || "all";
  const deferredQuery = useDeferredValue(query);
  const visibleCategories = categories.filter((category) =>
    (category.modes ?? ["presencial"]).includes(modality),
  );
  const area =
    requestedArea === "all" || visibleCategories.some((category) => category.id === requestedArea)
      ? requestedArea
      : "all";

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    // Any filter change starts over from the first page.
    if (!("pagina" in changes)) next.delete("pagina");
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
    }
    const nextModality = (next.get("modalidad") as Format | null) ?? modality;
    const nextArea = next.get("area");
    if (nextArea && !(categoryById.get(nextArea)?.modes ?? []).includes(nextModality)) {
      next.delete("area");
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setModality = (nextId: Format) => {
    const areaStillExists =
      area !== "all" && (categoryById.get(area)?.modes ?? []).includes(nextId);
    updateParams({ modalidad: nextId, ...(areaStillExists ? {} : { area: "all" }) });
  };

  const normalizedQuery = deferredQuery.toLocaleLowerCase("es").trim();
  const filtered = courses.filter((course) => {
    const matchModality = courseFormats(course).includes(modality);
    const matchArea = area === "all" || course.category === area;
    const categoryName = categoryById.get(course.category)?.name ?? "";
    const haystack = `${course.title} ${course.summary} ${categoryName}`.toLocaleLowerCase("es");
    const matchQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    const matchDuration =
      duration === "all" ||
      (duration === "short" && course.durationMonths <= 3) ||
      (duration === "mid" && course.durationMonths >= 4 && course.durationMonths <= 6) ||
      (duration === "long" && course.durationMonths >= 7);
    const matchStart = inicio === "all" || course.intakeId === inicio;
    return matchModality && matchArea && matchQuery && matchDuration && matchStart;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(params.get("pagina") ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const firstShown = (page - 1) * PAGE_SIZE;
  const pageCourses = filtered.slice(firstShown, firstShown + PAGE_SIZE);
  const pageHref = (target: number) => {
    const next = new URLSearchParams(params.toString());
    if (target === 1) next.delete("pagina");
    else next.set("pagina", String(target));
    return `${pathname}?${next.toString()}`;
  };
  const toBoardTop = () => {
    const board = boardRef.current;
    if (!board) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    board.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const narrowing = area !== "all" || query || duration !== "all" || inicio !== "all";
  const motionKey = `${modality}|${area}|${duration}|${inicio}|${page}`;
  const clearFilters = () => updateParams({ area: "all", q: "", duracion: "all", inicio: "all" });
  const noun = filtered.length === 1 ? "curso" : "cursos";
  const modeName =
    filtered.length === 1
      ? activeModality.label.toLocaleLowerCase("es")
      : activeModality.name.toLocaleLowerCase("es");
  const areaName = area !== "all" ? categoryById.get(area)?.name : null;
  const countLabel = areaName
    ? `${filtered.length} ${noun} de ${areaName}`
    : `${filtered.length} ${noun} ${modeName}`;

  return (
    <div className="catalog-workspace">
      <div
        className="area-rail"
        role="group"
        key={modality}
        aria-label={`Categorías ${activeModality.label.toLocaleLowerCase("es")}`}
      >
        {visibleCategories.map((category) => {
          const color = accentFor(modality, category);
          return (
            <button
              type="button"
              aria-pressed={area === category.id}
              key={category.id}
              className={area === category.id ? "is-active" : ""}
              style={accentStyle(color) as CSSProperties}
              onClick={() => updateParams({ area: area === category.id ? "all" : category.id })}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <div className="catalog-browse">
        <form
          className="catalog-filters"
          role="search"
          aria-label="Filtrar cursos"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="catalog-filters-title">Filtrar</p>
          <label className="catalog-search">
            <span>Buscar</span>
            <input
              type="search"
              name="course-search"
              value={query}
              onChange={(event) => updateParams({ q: event.target.value })}
              placeholder="Ej.: farmacia, Excel, refrigeración…"
              autoComplete="off"
            />
          </label>
          <label>
            <span>Inicio del cursado</span>
            <select
              value={inicio}
              onChange={(event) => updateParams({ inicio: event.target.value })}
            >
              <option value="all">Cualquier inicio</option>
              {intakes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Modalidad</span>
            <select
              value={modality}
              onChange={(event) => setModality(event.target.value as Format)}
            >
              {modalities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Categoría</span>
            <select
              value={area}
              onChange={(event) => updateParams({ area: event.target.value })}
              style={
                area !== "all"
                  ? { boxShadow: `inset 4px 0 0 ${accentFor(modality, categoryById.get(area))}` }
                  : undefined
              }
            >
              <option value="all">Todas</option>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Duración</span>
            <select
              value={duration}
              onChange={(event) => updateParams({ duracion: event.target.value })}
            >
              <option value="all">Todas</option>
              <option value="short">Hasta 3 meses</option>
              <option value="mid">De 4 a 6 meses</option>
              <option value="long">7 meses o más</option>
            </select>
          </label>
          {narrowing ? (
            <button type="button" className="btn btn-line-ink catalog-clear" onClick={clearFilters}>
              Limpiar filtros
            </button>
          ) : null}
        </form>

        <div className="catalog-board" ref={boardRef}>
          <h2 className="visually-hidden">Cursos disponibles</h2>
          <p className="catalog-count">
            {countLabel}
            {pageCount > 1 ? (
              <small>
                Mostrando {firstShown + 1}–{firstShown + pageCourses.length}
              </small>
            ) : null}
          </p>
          <div className="catalog-results" key={motionKey}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                {area === "mineria" ? (
                  <>
                    <h3>Los cursos de Minería se están definiendo.</h3>
                    <p>
                      El área ya está en el catálogo. Los nombres se suman cuando estén confirmados.
                    </p>
                  </>
                ) : (
                  <>
                    <h3>
                      No hay cursos {activeModality.name.toLocaleLowerCase("es")} con esos filtros.
                    </h3>
                    <p>Probá otro inicio, otra categoría o una búsqueda más amplia.</p>
                  </>
                )}
                <button type="button" className="btn btn-solid" onClick={clearFilters}>
                  Ver los {activeModality.name.toLocaleLowerCase("es")}
                </button>
              </div>
            ) : (
              <div className="catalog-grid">
                {pageCourses.map((course) => (
                  <CatalogRow
                    key={course.id}
                    course={course}
                    category={categoryById.get(course.category)}
                    modalityId={modality}
                    modalityLabel={activeModality.label}
                    accent={accentFor(modality, categoryById.get(course.category))}
                  />
                ))}
              </div>
            )}
          </div>

          {pageCount > 1 ? (
            <nav className="catalog-pagination" aria-label="Páginas del catálogo">
              {page > 1 ? (
                <Link
                  className="catalog-page-step"
                  href={pageHref(page - 1)}
                  scroll={false}
                  replace
                  onClick={toBoardTop}
                >
                  Anterior
                </Link>
              ) : (
                <span className="catalog-page-step" aria-disabled="true">
                  Anterior
                </span>
              )}
              <ol>
                {pageItems(page, pageCount).map((item, index) =>
                  item === null ? (
                    <li key={`gap-${index}`} className="catalog-page-gap" aria-hidden="true">
                      …
                    </li>
                  ) : (
                    <li key={item}>
                      <Link
                        href={pageHref(item)}
                        scroll={false}
                        replace
                        onClick={toBoardTop}
                        aria-current={item === page ? "page" : undefined}
                        aria-label={`Página ${item}`}
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ol>
              {page < pageCount ? (
                <Link
                  className="catalog-page-step"
                  href={pageHref(page + 1)}
                  scroll={false}
                  replace
                  onClick={toBoardTop}
                >
                  Siguiente
                </Link>
              ) : (
                <span className="catalog-page-step" aria-disabled="true">
                  Siguiente
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
