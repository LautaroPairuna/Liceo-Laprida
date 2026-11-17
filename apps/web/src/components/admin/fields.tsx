"use client";

import { type ChangeEvent, type ReactNode, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { prepareImage } from "@/lib/media";

type FieldProps = { label: string; hint?: string; className?: string; children: ReactNode };

export function Field({ label, hint, className = "", children }: FieldProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the control arrives as children
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

export function ImageField({ label, value, onChange, hint }: ImageFieldProps) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { url } = await adminApi.uploadImage(await prepareImage(file));
      onChange(url);
    } catch (uploadError) {
      setError((uploadError as Error).message);
    }
    setBusy(false);
  };

  return (
    <div className="field span">
      <span>{label}</span>
      <div className="image-field">
        {value ? <img src={value} alt="" /> : <span className="image-empty">Sin imagen</span>}
        <div className="image-controls">
          <input
            type="text"
            value={value || ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://… o /archivo.webp"
            inputMode="url"
            aria-label={`${label}: dirección de la imagen`}
          />
          <label className="admin-btn">
            Subir foto
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={upload} />
          </label>
          {value ? (
            <button type="button" className="linkish" onClick={() => onChange("")}>
              Quitar
            </button>
          ) : null}
          {busy ? <small>Subiendo la foto…</small> : null}
          {error ? <small className="field-error">{error}</small> : null}
          {hint ? <small>{hint}</small> : null}
        </div>
      </div>
    </div>
  );
}
