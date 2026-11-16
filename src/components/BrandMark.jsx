export default function BrandMark({ variant = "header" }) {
  return (
    <span className={`brand-lockup brand-lockup-${variant}`}>
      <span className="brand-sigil" aria-hidden="true">R</span>
      <span className="brand-word">
        <span className="brand-red">RED</span>
        <span className="brand-laprida">LAPRIDA</span>
      </span>
    </span>
  )
}
