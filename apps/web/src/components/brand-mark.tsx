export function BrandMark({ variant = "header" }: { variant?: "header" | "footer" }) {
  return (
    <span className={`brand-lockup brand-lockup-${variant}`}>
      <span className="brand-sigil" aria-hidden="true">
        R
      </span>
      <span className="brand-word">
        <span className="brand-red">RED</span>
        <span className="brand-laprida">LAPRIDA</span>
      </span>
    </span>
  );
}
