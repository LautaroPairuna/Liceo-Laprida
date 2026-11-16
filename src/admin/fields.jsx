import { useState } from "react"
import { readImage } from "./media"

export function Field({ label, hint, className = "", children }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export function ImageField({ label, value, onChange, hint }) {
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const upload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setBusy(true)
    setError("")
    try {
      onChange(await readImage(file))
    } catch (uploadError) {
      setError(uploadError.message)
    }
    setBusy(false)
  }

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
          />
          <label className="admin-btn">
            Subir foto
            <input type="file" accept="image/*" hidden onChange={upload} />
          </label>
          {value ? <button type="button" className="linkish" onClick={() => onChange("")}>Quitar</button> : null}
          {busy ? <small>Preparando la foto…</small> : null}
          {error ? <small className="field-error">{error}</small> : null}
          {hint ? <small>{hint}</small> : null}
        </div>
      </div>
    </div>
  )
}
