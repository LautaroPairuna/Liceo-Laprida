"use client";

import { useEffect, useRef } from "react";

type Connection = { saveData?: boolean; effectiveType?: string };

// The poster is a real <img> with high priority because it is the LCP of the page. The
// video only starts after the page has loaded, so its megabytes never compete with the
// poster or the rest of the first paint, and it is skipped with data saver or a slow
// connection, where it would cost more than it adds.
export function AmbientVideo({ src, poster }: { src: string; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    if (connection?.saveData || /(^|-)2g|3g/.test(connection?.effectiveType ?? "")) return;

    const start = () => {
      const element = video.current;
      if (!element) return;
      element.src = src;
      element.play().catch(() => undefined);
    };
    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [src]);

  return (
    <>
      <img className="ambient-poster" src={poster} alt="" fetchPriority="high" />
      <video ref={video} className="ambient-video" muted loop playsInline preload="none" />
    </>
  );
}
