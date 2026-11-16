import { useMemo } from "react"
import { Link } from "react-router-dom"
import { formatMoney, inkOn } from "../data/institution"
import { useSite } from "../site/SiteContext"

const offerDate = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "America/Argentina/Buenos_Aires" })
const formatOfferDate = (date) => {
  if (!date) return "a confirmar"
  const parsed = new Date(`${date}T12:00:00-03:00`)
  if (Number.isNaN(parsed.getTime())) return "a confirmar"
  return offerDate.format(parsed).replace(".", "")
}

function OfferCard({ offer }) {
  const { categoryById } = useSite()
  const category = offer.kind === "course" ? categoryById.get(offer.category) : null
  const href = offer.kind === "benefit"
    ? "/inscripcion?promo=grupo3"
    : `/inscripcion?curso=${offer.id}&oferta=1`

  return (
    <article
      className={`offer-card offer-card-${offer.kind}`}
      style={category ? { "--accent": category.color, "--ink": inkOn(category.color) } : undefined}
    >
      <div className="offer-media">
        <img src={offer.image} alt="" width="1400" height="900" />
      </div>
      <div className="offer-body">
        {category
          ? <p className="offer-category">{category.name}</p>
          : <p className="offer-category offer-category-empty" aria-hidden="true">Categoría</p>}
        <h3>{offer.title}</h3>
        <div className="offer-price">
          {offer.kind === "course"
            ? <del>Antes {formatMoney(offer.cuota)}</del>
            : <span className="offer-price-gap" aria-hidden="true" />}
          <strong>{offer.kind === "course" ? formatMoney(offer.offerPrice) : offer.value}</strong>
          <span>{offer.kind === "course" ? "por mes" : offer.valueNote}</span>
        </div>
        <p className="offer-when">
          {offer.kind === "course" ? (
            <>
              Inicio <time dateTime={offer.start}>{formatOfferDate(offer.start)}</time>
              {" · "}
              Vigente hasta <time dateTime={offer.deadline}>{formatOfferDate(offer.deadline)}</time>
            </>
          ) : (
            <>
              Vigente hasta <time dateTime={offer.deadline}>{formatOfferDate(offer.deadline)}</time>
              {" · "}
              3 personas
            </>
          )}
        </p>
        <Link className="btn btn-enroll btn-full" to={href}>Inscribirme</Link>
      </div>
    </article>
  )
}

export default function OffersSection() {
  const { courses, content } = useSite()
  const offers = useMemo(() => {
    const courseOffers = (content.offers?.courses || []).flatMap((offer) => {
      const course = courses.find((item) => item.id === offer.id)
      if (!course) return []
      return [{
        ...course,
        ...offer,
        kind: "course",
        offerPrice: Math.round((course.cuota * (100 - (Number(offer.discount) || 0))) / 100 / 1000) * 1000,
      }]
    })
    const group = { ...content.offers.group, kind: "benefit" }
    if (courseOffers.length < 2) return [...courseOffers, group]
    return [courseOffers[0], courseOffers[1], group, ...courseOffers.slice(2)]
  }, [content.offers, courses])

  return (
    <section id="ofertas" className="home-offers snap-section">
      <div className="section-wrap offers-shell">
        <header className="offers-head">
          <h2>{content.offers.title}</h2>
        </header>

        <div className="offer-marquee">
          <div
            className="offer-track"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Beneficios y promociones vigentes"
          >
            <div className="offer-group">
              {offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
            </div>
            <div className="offer-group" aria-hidden="true" inert>
              {offers.map((offer) => <OfferCard key={`copia-${offer.id}`} offer={offer} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
