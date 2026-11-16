import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { unlockAdmin } from "../admin/access"
import "./admin-lock.css"

export default function AdminLock({ onClose, onUnlock }) {
  const titleId = useId()
  const inputRef = useRef(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function submit(event) {
    event.preventDefault()
    if (!unlockAdmin(password)) {
      setError(true)
      inputRef.current?.select()
      return
    }
    onUnlock()
  }

  return createPortal(
    <div
      className="admin-lock"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        className="admin-lock-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
      >
        <h2 id={titleId}>Administración</h2>
        <label>
          Contraseña
          <input
            ref={inputRef}
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            aria-invalid={error || undefined}
            onChange={(event) => {
              setPassword(event.target.value)
              if (error) setError(false)
            }}
          />
        </label>
        {error ? <p className="admin-lock-error" role="alert">La contraseña no coincide.</p> : null}
        <div className="admin-lock-actions">
          <button className="btn btn-ink" type="submit">Entrar</button>
          <button className="admin-lock-cancel" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
