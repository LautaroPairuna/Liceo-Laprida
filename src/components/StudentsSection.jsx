import { useSite } from "../site/SiteContext"
import { IconStar } from "./Icons"

function Stars({ value, className = "stars" }) {
  const label = Number.isInteger(value)
    ? `${value} de 5 estrellas`
    : `${value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5 estrellas`

  return (
    <span className={className} aria-label={label}>
      {[0, 1, 2, 3, 4].map((index) => (
        <IconStar key={index} amount={Math.min(1, Math.max(0, value - index))} />
      ))}
    </span>
  )
}

function ReviewCard({ item }) {
  return (
    <blockquote className={item.featured ? "review-card review-featured" : "review-card"}>
      <Stars value={item.rating} />
      <p>“{item.quote}”</p>
      <footer>
        <strong>{item.name}</strong>
        <small>{item.course} · {item.date}</small>
      </footer>
    </blockquote>
  )
}

export default function StudentsSection() {
  const { reviews } = useSite()
  const score = Number(reviews.average || 0).toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (
    <div id="alumnos" className="review-band" aria-labelledby="resenas-title">
      <div className="review-band-inner">
        <header className="review-band-label">
          <h3 id="resenas-title">Reseñas</h3>
          <div className="review-score">
            <strong className="review-score-value">{score}</strong>
            <Stars value={reviews.average} className="stars review-score-stars" />
            <p className="review-score-meta">de 5 · {reviews.count} opiniones</p>
          </div>
        </header>

        <div className="review-marquee" aria-label="Reseñas de alumnos en movimiento continuo">
          <div className="review-track">
            <div className="review-group">
              {reviews.items.map((item, index) => <ReviewCard key={`${item.name}-${index}`} item={item} />)}
            </div>
            <div className="review-group" aria-hidden="true">
              {reviews.items.map((item, index) => <ReviewCard key={`duplicate-${item.name}-${index}`} item={item} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
