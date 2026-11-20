"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Reveals [data-reveal] blocks as they scroll into view. The page is server-rendered and
// fully visible without JS; only blocks that start below the fold are hidden, so nothing
// already on screen blinks. Children of [data-reveal-stagger] enter one after the other.
export function ScrollReveal() {
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scan the new page on each navigation
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    for (const group of document.querySelectorAll<HTMLElement>("[data-reveal-stagger]")) {
      group.querySelectorAll<HTMLElement>(":scope > [data-reveal]").forEach((child, index) => {
        child.style.setProperty("--reveal-i", String(index));
      });
    }

    const pending = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
      (element) =>
        !element.dataset.revealState &&
        element.getBoundingClientRect().top > window.innerHeight * 0.92,
    );
    for (const element of pending) element.dataset.revealState = "pending";

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          element.dataset.revealState = "in";
          // Drop the entrance transition afterwards so it doesn't slow hover effects.
          timers.push(window.setTimeout(() => (element.dataset.revealState = "done"), 1800));
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    for (const element of pending) observer.observe(element);

    return () => {
      observer.disconnect();
      for (const timer of timers) window.clearTimeout(timer);
      // Anything still waiting (e.g. the footer, which survives navigation) goes back to
      // its plain visible state; a new scan can pick it up again.
      for (const element of pending) {
        if (element.dataset.revealState === "pending") delete element.dataset.revealState;
      }
    };
  }, [pathname]);

  return null;
}
