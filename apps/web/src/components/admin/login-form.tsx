"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { authClient } from "@/lib/admin-api";
import { BrandMark } from "../brand-mark";

// Solo el 401 es una clave equivocada; el resto son problemas del servidor y conviene
// que se distingan, para no buscar el error en la clave.
function loginError(status: number) {
  if (status === 401) return "El correo o la contraseña no coinciden.";
  if (status === 429) return "Demasiados intentos. Esperá un minuto.";
  if (status === 403) return "El servidor rechazó el origen del pedido (revisá PUBLIC_SITE_URL).";
  return `No se pudo iniciar sesión (error ${status}). Probá de nuevo en un rato.`;
}

export function LoginForm() {
  const titleId = useId();
  const router = useRouter();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError("");
    const { error: signInError } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (signInError) {
      setError(loginError(signInError.status));
      setSending(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="admin-lock">
      <form className="admin-lock-card" aria-labelledby={titleId} onSubmit={submit}>
        <div className="admin-lock-head">
          <BrandMark />
          <h1 id={titleId}>Administración</h1>
          <p>Ingresá con tu cuenta para gestionar el sitio.</p>
        </div>
        <label>
          Correo
          <input type="email" name="email" autoComplete="username" required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            aria-invalid={error ? true : undefined}
          />
        </label>
        {error ? (
          <p className="admin-lock-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-lock-actions">
          <button className="btn btn-ink" type="submit" disabled={sending}>
            {sending ? "Entrando…" : "Entrar"}
          </button>
          <Link className="admin-lock-cancel" href="/">
            Volver a la web
          </Link>
        </div>
      </form>
    </main>
  );
}
