"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/institution";
import type { PaymentStatus } from "@/lib/types";

type Status = {
  firstName: string;
  course: string;
  code: string;
  amount: number;
  payment: PaymentStatus;
};

const POLL_MS = 3000;
const MAX_POLLS = 20;

export function PaymentResult({ id }: { id: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [missing, setMissing] = useState(!id);
  const [gaveUp, setGaveUp] = useState(false);

  // Mercado Pago confirms through the webhook, which can land a few seconds after the buyer returns,
  // so the page polls the enrollment until the payment leaves "pendiente" or the attempts run out.
  useEffect(() => {
    if (!id) return;
    let polls = 0;
    let timer: ReturnType<typeof setTimeout>;
    let active = true;

    const check = async () => {
      const response = await fetch(`/api/checkout/${encodeURIComponent(id)}`, {
        cache: "no-store",
      }).catch(() => null);
      if (!active) return;
      if (response?.status === 404) {
        setMissing(true);
        return;
      }
      const next: Status | null = response?.ok ? await response.json() : null;
      if (!active) return;
      if (next) setStatus(next);
      polls += 1;
      if (next && next.payment !== "pendiente") return;
      if (polls >= MAX_POLLS) {
        setGaveUp(true);
        return;
      }
      timer = setTimeout(check, POLL_MS);
    };

    check();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id]);

  if (missing) {
    return (
      <section className="enrollment-success" aria-live="polite">
        <p className="section-kicker">Inscripción</p>
        <h1>No encontramos esa inscripción.</h1>
        <p className="success-lead">Si ya pagaste, escribinos por WhatsApp y lo revisamos.</p>
        <div className="success-actions">
          <Link href="/inscripcion" className="btn btn-enroll">
            Volver a inscribirme
          </Link>
        </div>
      </section>
    );
  }

  if (!status || status.payment === "pendiente") {
    return (
      <section className="enrollment-success" aria-live="polite">
        <p className="section-kicker">Inscripción</p>
        <h1>{gaveUp ? "Tu pago está en proceso." : "Estamos confirmando tu pago…"}</h1>
        <p className="success-lead">
          {gaveUp
            ? "Mercado Pago todavía no lo acreditó. Queda registrado cuando se confirme; no hace falta pagar de nuevo."
            : "Esto tarda unos segundos. No cierres esta página."}
        </p>
        {status ? (
          <dl className="success-reference">
            <div>
              <dt>Curso</dt>
              <dd>{status.course}</dd>
            </div>
            <div>
              <dt>Número de inscripción</dt>
              <dd>{status.code}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    );
  }

  if (status.payment === "rechazado") {
    return (
      <section className="enrollment-success" aria-live="polite">
        <p className="section-kicker">Inscripción</p>
        <h1>El pago no se pudo completar.</h1>
        <p className="success-lead">
          Mercado Pago rechazó o canceló el pago de {formatMoney(status.amount)}. Podés intentarlo
          de nuevo con otro medio.
        </p>
        <div className="success-actions">
          <Link href="/inscripcion" className="btn btn-enroll">
            Intentar de nuevo
          </Link>
          <Link href="/#contacto" className="btn btn-line-ink">
            Hablar con el equipo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="enrollment-success" aria-live="polite">
      <div className="success-seal" aria-hidden="true">
        ✓
      </div>
      <p className="section-kicker">Inscripción confirmada</p>
      <h1>Gracias por invertir en tu futuro, {status.firstName}.</h1>
      <p className="success-lead">
        Tu inscripción quedó registrada y el pago de <strong>{formatMoney(status.amount)}</strong>{" "}
        figura aprobado.
      </p>

      <div className="payment-approved">
        <span className="mp-logo" aria-hidden="true" translate="no">
          mp
        </span>
        <span>
          <small>Estado del pago</small>
          <strong>Pago aprobado</strong>
        </span>
        <em translate="no">Mercado Pago</em>
      </div>

      <dl className="success-reference">
        <div>
          <dt>Curso</dt>
          <dd>{status.course}</dd>
        </div>
        <div>
          <dt>Número de inscripción</dt>
          <dd>{status.code}</dd>
        </div>
      </dl>

      <div className="success-next">
        <h2>¿Qué sigue ahora?</h2>
        <div className="success-next-grid">
          <article>
            <span aria-hidden="true">01</span>
            <strong>Comprobante por email</strong>
            <p>Lo vas a recibir en tu correo con el detalle de tu pago.</p>
          </article>
          <article>
            <span aria-hidden="true">02</span>
            <strong>Factura de inscripción</strong>
            <p>La administración te enviará la factura correspondiente al mismo correo.</p>
          </article>
          <article>
            <span aria-hidden="true">03</span>
            <strong>Contacto por WhatsApp</strong>
            <p>El equipo te escribirá para confirmar horarios, documentación e inicio.</p>
          </article>
        </div>
      </div>

      <div className="success-actions">
        <Link href="/" className="btn btn-enroll">
          Volver al inicio
        </Link>
        <Link href="/#catalogo" className="btn btn-line-ink">
          Explorar otros cursos
        </Link>
      </div>
    </section>
  );
}
