"use client";

import { useState } from "react";

// The carousels are server-rendered; this button only flips an attribute that CSS reads,
// so the cards don't need to become client components.
export function MarqueePause({ target, label }: { target: string; label: string }) {
  const [paused, setPaused] = useState(false);

  function toggle() {
    const next = !paused;
    document.getElementById(target)?.toggleAttribute("data-paused", next);
    setPaused(next);
  }

  return (
    <button type="button" className="marquee-toggle" aria-controls={target} onClick={toggle}>
      <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
      {paused ? "Reanudar" : "Pausar"}
      <span className="visually-hidden"> {label}</span>
    </button>
  );
}
