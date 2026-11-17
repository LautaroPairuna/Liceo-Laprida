import Link from "next/link";
import type { CSSProperties } from "react";
import {
  courseFormats,
  formatMoney,
  inkOn,
  modalities,
  modalityById,
  weekSchedule,
} from "@/lib/institution";
import type { Category, Course, Review, SiteContent } from "@/lib/types";
import {
  IconArrow,
  IconClock,
  IconFacebook,
  IconGmail,
  IconInstagram,
  IconPhone,
  IconPin,
  IconStar,
  IconWhatsApp,
} from "../icons";
import { LiceoMapLoader } from "./liceo-map-loader";

export function CatalogSection({ content, courses }: { content: SiteContent; courses: Course[] }) {
  const counts = new Map(modalities.map((item) => [item.id, 0]));
  for (const course of courses) {
    for (const format of courseFormats(course)) counts.set(format, (counts.get(format) ?? 0) + 1);
  }
  const { contact } = content;

  return (
    <section id="catalogo" className="home-catalog snap-section" aria-label="Formatos de cursado">
      <div className="section-wrap">
        <div className="format-rail">
          {modalities.map((item) => {
            const count = counts.get(item.id) ?? 0;
            return (
              <Link
                key={item.id}
                className={`format-card format-${item.id}`}
                href={`/cursos?modalidad=${item.id}`}
              >
                {item.id === "presencial" ? (
                  <span className="modality-seal">
                    <span className="modality-seal-mark" aria-hidden="true">
                      <img src="/logo.png" alt="" />
                    </span>
                    <span>
                      <small>En el</small>
                      <b>Liceo Laprida</b>
                    </span>
                  </span>
                ) : (
                  <span className="format-lockup">
                    <span className="format-sigil" aria-hidden="true">
                      R
                    </span>
                    <span className="format-word">
                      <span className="format-red">RED</span>
                      <span className="format-name">LAPRIDA</span>
                    </span>
                  </span>
                )}
                <span className="format-copy">
                  <strong>{item.name}</strong>
                  <small>{content.catalogCopy?.[item.id]?.detail || item.detail}</small>
                  <span className="format-net">
                    {item.id === "presencial"
                      ? `${contact.address}, ${contact.locality}`
                      : "Formatos digitales de Red Laprida"}
                  </span>
                </span>
                <span className="format-foot">
                  <em>
                    {count} {count === 1 ? "curso" : "cursos"}
                  </em>
                  <span className="format-open">
                    Abrir catálogo <IconArrow />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const offerDate = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

function formatOfferDate(date: string | undefined) {
  if (!date) return "a confirmar";
  const parsed = new Date(`${date}T12:00:00-03:00`);
  if (Number.isNaN(parsed.getTime())) return "a confirmar";
  return offerDate.format(parsed).replace(".", "");
}

type OfferItem =
  | (Course & {
      kind: "course";
      offerId: string;
      start: string;
      deadline: string;
      offerPrice: number;
    })
  | (SiteContent["offers"]["group"] & { kind: "benefit"; offerId: string });

function OfferCard({ offer, category }: { offer: OfferItem; category?: Category }) {
  const href =
    offer.kind === "benefit"
      ? "/inscripcion?promo=grupo3"
      : `/inscripcion?curso=${offer.id}&oferta=1`;
  const style = category
    ? ({ "--accent": category.color, "--ink": inkOn(category.color) } as CSSProperties)
    : undefined;

  return (
    <article className={`offer-card offer-card-${offer.kind}`} style={style}>
      <div className="offer-media">
        <img src={offer.image} alt="" width="1400" height="900" />
      </div>
      <div className="offer-body">
        {category ? (
          <p className="offer-category">{category.name}</p>
        ) : (
          <p className="offer-category offer-category-empty" aria-hidden="true">
            Categoría
          </p>
        )}
        <h3>{offer.title}</h3>
        <div className="offer-price">
          {offer.kind === "course" ? (
            <del>Antes {formatMoney(offer.cuota)}</del>
          ) : (
            <span className="offer-price-gap" aria-hidden="true" />
          )}
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
              {" · "}3 personas
            </>
          )}
        </p>
        <Link className="btn btn-enroll btn-full" href={href}>
          Inscribirme
        </Link>
      </div>
    </article>
  );
}

export function OffersSection({ content, courses }: { content: SiteContent; courses: Course[] }) {
  const categoryById = new Map(content.categories.map((category) => [category.id, category]));
  const courseOffers: OfferItem[] = (content.offers?.courses ?? []).flatMap((offer) => {
    const course = courses.find((item) => item.id === offer.id);
    if (!course) return [];
    return [
      {
        ...course,
        kind: "course" as const,
        offerId: offer.id,
        start: offer.start,
        deadline: offer.deadline,
        offerPrice:
          Math.round((course.cuota * (100 - (Number(offer.discount) || 0))) / 100 / 1000) * 1000,
      },
    ];
  });
  const group: OfferItem = { ...content.offers.group, kind: "benefit", offerId: "grupo" };
  const offers =
    courseOffers.length < 2
      ? [...courseOffers, group]
      : [courseOffers[0], courseOffers[1], group, ...courseOffers.slice(2)];
  const categoryOf = (offer: OfferItem) =>
    offer.kind === "course" ? categoryById.get(offer.category) : undefined;

  return (
    <section id="ofertas" className="home-offers snap-section">
      <div className="section-wrap offers-shell">
        <header className="offers-head">
          <h2>{content.offers.title}</h2>
        </header>

        <div className="offer-marquee">
          <section
            className="offer-track"
            aria-roledescription="carrusel"
            aria-label="Beneficios y promociones vigentes"
          >
            <div className="offer-group">
              {offers.map((offer) => (
                <OfferCard key={offer.offerId} offer={offer} category={categoryOf(offer)} />
              ))}
            </div>
            <div className="offer-group" aria-hidden="true" inert>
              {offers.map((offer) => (
                <OfferCard
                  key={`copia-${offer.offerId}`}
                  offer={offer}
                  category={categoryOf(offer)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function Stars({ value, className = "stars" }: { value: number; className?: string }) {
  const label = Number.isInteger(value)
    ? `${value} de 5 estrellas`
    : `${value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5 estrellas`;

  return (
    <span className={className} role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((index) => (
        <IconStar key={index} amount={Math.min(1, Math.max(0, value - index))} />
      ))}
    </span>
  );
}

function ReviewCard({ item }: { item: Review }) {
  return (
    <blockquote className={item.featured ? "review-card review-featured" : "review-card"}>
      <Stars value={item.rating} />
      <p>“{item.quote}”</p>
      <footer>
        <strong>{item.name}</strong>
        <small>
          {item.course} · {item.date}
        </small>
      </footer>
    </blockquote>
  );
}

export function StudentsSection({ reviews }: { reviews: SiteContent["reviews"] }) {
  const score = Number(reviews.average || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <section id="alumnos" className="review-band" aria-labelledby="resenas-title">
      <div className="review-band-inner">
        <header className="review-band-label">
          <h3 id="resenas-title">Reseñas</h3>
          <div className="review-score">
            <strong className="review-score-value">{score}</strong>
            <Stars value={reviews.average} className="stars review-score-stars" />
            <p className="review-score-meta">de 5 · {reviews.count} opiniones</p>
          </div>
        </header>

        <div className="review-marquee">
          <div className="review-track">
            <div className="review-group">
              {reviews.items.map((item, index) => (
                <ReviewCard key={`${item.name}-${index}`} item={item} />
              ))}
            </div>
            <div className="review-group" aria-hidden="true">
              {reviews.items.map((item, index) => (
                <ReviewCard key={`duplicate-${item.name}-${index}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InstitutionSection({ content }: { content: SiteContent }) {
  const { story, contact } = content;

  return (
    <section
      id="institucion"
      className="home-institution snap-section"
      aria-labelledby="institucion-title"
    >
      <div className="section-wrap institution-layout">
        <header className="institution-intro">
          <p className="section-kicker">La institución</p>
          <h2 id="institucion-title">{story.title}</h2>
          <p>{story.lead}</p>
        </header>

        <ol className="history-rail" aria-label="Trayectoria del Liceo Profesional Laprida">
          {story.milestones.map((item) => (
            <li key={`${item.year}-${item.title}`}>
              {item.dateTime ? (
                <time dateTime={item.dateTime}>{item.year}</time>
              ) : (
                <span className="history-now">{item.year}</span>
              )}
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>

        <div className="institution-split">
          <div className="institution-copy">
            <article>
              <h3>{story.purposeTitle}</h3>
              <p>{story.purpose}</p>
            </article>
            <article>
              <h3>{story.visionTitle}</h3>
              <p>{story.vision}</p>
            </article>
          </div>

          <figure className="facade-slot">
            {story.facade ? (
              <img
                className="facade-photo"
                src={story.facade}
                alt={story.facadeAlt || "Fachada del Liceo Profesional Laprida"}
              />
            ) : (
              <div
                className="facade-mount"
                role="img"
                aria-label={
                  story.facadeAlt ||
                  "Espacio reservado para la fotografía de la fachada del Liceo Profesional Laprida"
                }
              >
                <span>Fachada del liceo</span>
              </div>
            )}
            <figcaption>
              {contact.legalName} · {contact.address}, {contact.locality}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function ContactSection({ content }: { content: SiteContent }) {
  const { contact, brand } = content;
  const schedule = weekSchedule(contact.hours);
  const digital = modalities.filter((item) => item.id !== "presencial");

  return (
    <section id="contacto" className="home-contact snap-section" aria-label="Ubicación y contacto">
      <div className="contact-halves">
        <article className="contact-liceo" aria-labelledby="contacto-liceo">
          <div className="contact-liceo-brand">
            <span className="contact-liceo-logo">
              <img src="/logo.png" alt="" />
            </span>
            <div>
              <small>Sede presencial</small>
              <h2 id="contacto-liceo">{contact.name}</h2>
            </div>
          </div>

          <div className="contact-liceo-main">
            <div className="contact-facts">
              <p className="contact-line">
                <IconPin />
                <span>
                  {contact.legalName}
                  <br />
                  {contact.address}
                  <br />
                  {contact.postal} {contact.locality}
                </span>
              </p>
              <p className="contact-line">
                <IconClock />
                <span className="contact-hours">
                  {schedule.map((item) => (
                    <span key={item.label}>
                      <em>{item.label}</em> {item.value}
                    </span>
                  ))}
                </span>
              </p>
              <p className="contact-line">
                <IconPhone />
                <a href={`tel:+${contact.phoneRaw}`}>{contact.phone}</a>
              </p>

              <div className="contact-actions">
                <a
                  className="contact-whatsapp"
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconWhatsApp />
                  <span>
                    <strong>WhatsApp</strong>
                    <small>Consultas directas</small>
                  </span>
                </a>
                <a className="contact-mail" href={`mailto:${contact.email}`}>
                  <IconGmail />
                  <span>
                    <strong>Correo</strong>
                    <small>{contact.email}</small>
                  </span>
                </a>
                <a
                  className="contact-instagram"
                  href={contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconInstagram />
                  <span>
                    <strong>Instagram</strong>
                    <small>{contact.instagramHandle}</small>
                  </span>
                </a>
                <a
                  className="contact-facebook"
                  href={contact.facebook}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconFacebook />
                  <span>
                    <strong>Facebook</strong>
                    <small>Liceo Laprida</small>
                  </span>
                </a>
              </div>
            </div>

            <div className="contact-map">
              <LiceoMapLoader name={contact.legalName} address={contact.address} />
            </div>
          </div>
        </article>

        <article className="contact-red" aria-labelledby="contacto-red">
          <div className="contact-red-lockup">
            <span className="contact-red-sigil" aria-hidden="true">
              R
            </span>
            <h2 id="contacto-red">
              <span className="contact-red-word">
                <span>RED</span>
                Laprida
              </span>
            </h2>
          </div>
          <p className="contact-red-lead">{brand.tagline}</p>
          <div className="contact-red-formats">
            {digital.map((item) => (
              <div key={item.id} className={`contact-red-format contact-red-${item.id}`}>
                <strong>{item.name}</strong>
                <p>{content.catalogCopy?.[item.id]?.detail || item.detail}</p>
                <Link href={`/cursos?modalidad=${item.id}`}>
                  Ver cursos {item.name.toLocaleLowerCase("es")} <IconArrow />
                </Link>
              </div>
            ))}
          </div>
          <p className="contact-red-note">
            La cursada digital no tiene sede. El material está en el campus.
          </p>
        </article>
      </div>
    </section>
  );
}

export { modalityById };
