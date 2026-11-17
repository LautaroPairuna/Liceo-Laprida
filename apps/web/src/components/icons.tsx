import { useId } from "react";

export function IconPhone() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="7" y="3" width="10" height="18" rx="2.2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function IconArrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconBuilding() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-6h6v6" />
      <path d="M9 11h.01M12 11h.01M15 11h.01" />
    </svg>
  );
}

export function IconPin() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

const STAR_PATH =
  "M12 3.6l2.35 5.05 5.55.68-4.12 3.86 1.12 5.5L12 16.2 7.1 18.69l1.12-5.5L4.1 9.33l5.55-.68L12 3.6z";
const STAR_MIN_X = 4.05;
const STAR_MAX_X = 19.95;

export function IconStar({ amount }: { amount: number }) {
  const ratio = Math.max(0, Math.min(1, amount));
  const clipId = `star-${useId().replace(/[:«»]/g, "")}`;
  const clipWidth = ratio >= 0.999 ? 24 : STAR_MIN_X + (STAR_MAX_X - STAR_MIN_X) * ratio;

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {ratio < 1 && (
        <path
          d={STAR_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity={ratio === 0 ? 1 : 0.72}
        />
      )}
      {ratio > 0 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={clipWidth} height="24" />
            </clipPath>
          </defs>
          <path d={STAR_PATH} fill="currentColor" clipPath={`url(#${clipId})`} />
        </>
      )}
    </svg>
  );
}

export function IconWhatsApp() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.87 9.87 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.52 3.68-8.2 8.21-8.2 2.19 0 4.25.85 5.8 2.4a8.15 8.15 0 0 1 2.4 5.8c0 4.53-3.68 8.21-8.17 8.21zm4.49-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.3.18-.55.06-.25-.12-1.06-.39-2.02-1.25-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74 1.48.64 2.07.7 2.81.59.43-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28z" />
    </svg>
  );
}

export function IconInstagram() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconFacebook() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5H17V3.6c-.7-.1-1.5-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.3H8V13h2.5v8h3.2z" />
    </svg>
  );
}

export function IconGmail() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path fill="#4285f4" d="M3 6.6v11.1c0 .7.6 1.3 1.3 1.3H7V9.6L3 6.6z" />
      <path fill="#34a853" d="M17 9.6V19h2.7c.7 0 1.3-.6 1.3-1.3V6.6l-4 3z" />
      <path fill="#fbbc04" d="M17 19H7v-9.4l5 3.8 5-3.8V19z" />
      <path
        fill="#ea4335"
        d="M21 6.6V5.5c0-1.6-1.8-2.5-3.1-1.6L12 8.3 6.1 3.9C4.8 3 3 3.9 3 5.5v1.1l9 6.8 9-6.8z"
      />
    </svg>
  );
}
