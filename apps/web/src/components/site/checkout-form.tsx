"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type CSSProperties, type FormEvent, useState } from "react";
import { courseFormats, formatMoney, modalityById } from "@/lib/institution";
import { discountFor, type Promo, priceFor } from "@/lib/pricing";
import type { Course, Format, SiteContent } from "@/lib/types";

type Props = { courses: Course[]; content: SiteContent };

export function CheckoutForm({ courses, content }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const course = courses.find((item) => item.id === params.get("curso"));
  const formats = course ? courseFormats(course) : [];
  const requested = params.get("modalidad") as Format | null;
  const modality: Format =
    requested && formats.includes(requested) ? requested : (formats[0] ?? "presencial");
  const promo: Promo | undefined =
    params.get("promo") === "grupo3"
      ? "grupo3"
      : params.get("oferta") === "1"
        ? "oferta"
        : undefined;
  const price = course ? priceFor(course, discountFor(course, content.offers, promo)) : null;
  const category = course
    ? content.categories.find((item) => item.id === course.category)
    : undefined;

  const replaceParams = (next: URLSearchParams) =>
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });

  const selectCourse = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("curso", value);
    else next.delete("curso");
    const nextFormats = courseFormats(courses.find((item) => item.id === value));
    if (!nextFormats.includes(next.get("modalidad") as Format)) {
      next.set("modalidad", nextFormats[0]);
    }
    replaceParams(next);
  };

  const selectModality = (value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("modalidad", value);
    replaceParams(next);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!course || sending) return;
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          modality,
          promo,
          name: form.get("name"),
          dni: form.get("dni"),
          email: form.get("email"),
          phone: form.get("phone"),
          shift: form.get("shift"),
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        throw new Error(message || "No pudimos iniciar el pago. Probá de nuevo en unos minutos.");
      }
      window.location.assign(body.checkoutUrl);
    } catch (submitError) {
      setError((submitError as Error).message);
      setSending(false);
    }
  }

  return (
    <form className="checkout-grid" onSubmit={submit}>
      <section className="panel-form checkout-form">
        <div className="checkout-form-title">
          <span>1</span>
          <div>
            <h2>Tus datos</h2>
            <p>Los usaremos para emitir la factura y coordinar el inicio.</p>
          </div>
        </div>

        <label className="full">
          Curso
          <select
            name="course"
            value={course?.id ?? ""}
            onChange={(event) => selectCourse(event.target.value)}
            autoComplete="off"
            required
          >
            <option value="">Elegí el curso en el que querés inscribirte…</option>
            {courses.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nombre y apellido
          <input required name="name" autoComplete="name" minLength={3} />
        </label>
        <label>
          DNI
          <input
            required
            name="dni"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9.\s]{7,11}"
          />
        </label>
        <label>
          Correo
          <input required type="email" name="email" autoComplete="email" spellCheck={false} />
        </label>
        <label>
          Teléfono
          <input required type="tel" name="phone" autoComplete="tel" inputMode="tel" />
        </label>
        <label className="full">
          Turno preferido
          <select
            name="shift"
            key={course?.id ?? "sin-curso"}
            defaultValue={
              ["Mañana", "Tarde", "Noche"].includes(course?.shift ?? "") ? course?.shift : "Tarde"
            }
            autoComplete="off"
          >
            <option>Mañana</option>
            <option>Tarde</option>
            <option>Noche</option>
            <option>A confirmar</option>
          </select>
        </label>
        {formats.length > 1 ? (
          <label className="full">
            Modalidad
            <select
              name="modality"
              value={modality}
              onChange={(event) => selectModality(event.target.value)}
            >
              {formats.map((id) => (
                <option key={id} value={id}>
                  {modalityById.get(id)?.label} ·{" "}
                  {id === "presencial" ? "Liceo Laprida" : "Red Laprida"}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="payment-only full">
          <div className="checkout-form-title compact">
            <span>2</span>
            <div>
              <h2>Pago</h2>
              <p>Mercado Pago es el medio habilitado para completar la inscripción.</p>
            </div>
          </div>
          <div className="mercadopago-choice">
            <span className="mp-logo" aria-hidden="true" translate="no">
              mp
            </span>
            <span>
              <strong translate="no">Mercado Pago</strong>
              <small>Pago protegido y confirmación inmediata</small>
            </span>
            <em>Única opción</em>
          </div>
        </div>

        {error ? (
          <p className="field-error full" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="btn btn-mercadopago btn-full"
          type="submit"
          disabled={!course || sending}
          aria-busy={sending}
        >
          <span className="mp-mini" aria-hidden="true" translate="no">
            mp
          </span>
          {sending ? "Te llevamos a Mercado Pago…" : "Pagar con Mercado Pago"}
        </button>
        <p className="fine-print">
          Vas a completar el pago en Mercado Pago y volver acá con la confirmación.
        </p>
      </section>

      <aside className="checkout-summary enrollment-summary" aria-live="polite">
        <p className="section-kicker">Tu inscripción</p>
        {course && price ? (
          <>
            <div
              className="summary-course"
              style={{ "--accent": category?.color } as CSSProperties}
            >
              <img src={course.image} alt="" width="1400" height="900" loading="lazy" />
              <div>
                <span>{category?.name}</span>
                <h2>{course.title}</h2>
                <p>
                  {course.durationMonths} meses ·{" "}
                  {modalityById.get(modality)?.label ?? course.shift}
                </p>
              </div>
            </div>
            {price.discount > 0 ? (
              <p className="summary-benefit">
                {promo === "grupo3"
                  ? `${price.discount}% de beneficio para cada integrante del grupo`
                  : `${price.discount}% de descuento promocional aplicado`}
              </p>
            ) : null}
            <dl>
              <div>
                <dt>Matrícula</dt>
                <dd>{formatMoney(course.matricula)}</dd>
              </div>
              <div>
                <dt>Cuota mensual</dt>
                <dd>{formatMoney(price.monthly)}</dd>
              </div>
              <div>
                <dt>Duración</dt>
                <dd>{course.durationMonths} cuotas</dd>
              </div>
              <div>
                <dt>Inversión total del curso</dt>
                <dd>{formatMoney(price.total)}</dd>
              </div>
            </dl>
            <div className="summary-total">
              <span>Pagás hoy</span>
              <strong>{formatMoney(price.initialPayment)}</strong>
              <small>Matrícula + primera cuota</small>
            </div>
          </>
        ) : (
          <div className="summary-empty">
            <span aria-hidden="true">{content.brand.short}</span>
            <h2>Elegí un curso</h2>
            <p>Acá vas a ver el precio final y el detalle completo antes de pagar.</p>
          </div>
        )}
      </aside>
    </form>
  );
}
