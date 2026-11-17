"use client";

import { useEffect, useRef } from "react";

export function AmbientVideo({ src, poster }: { src: string; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);

  // The reduced-motion preference only exists in the browser, so playback starts after mount.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.current?.play().catch(() => undefined);
  }, []);

  return (
    <video ref={video} muted loop playsInline poster={poster} preload="metadata">
      <source src={src} type="video/mp4" />
    </video>
  );
}
