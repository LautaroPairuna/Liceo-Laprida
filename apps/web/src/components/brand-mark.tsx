export function BrandMark({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <span className={`brand-lockup brand-lockup-${variant}`}>
      <span className="brand-sigil" aria-hidden="true">
        <img src="/red-cima-mark.svg" alt="" width={192} height={192} />
      </span>
      <span className="brand-word">
        <span className="brand-red">RED</span>
        <span className="brand-laprida">CIMA</span>
      </span>
    </span>
  );
}
