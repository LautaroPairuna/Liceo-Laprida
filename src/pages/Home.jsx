import { IconArrow } from "../components/Icons"
import CatalogSection from "../components/CatalogSection"
import InstitutionSection from "../components/InstitutionSection"
import StudentsSection from "../components/StudentsSection"
import ContactSection from "../components/ContactSection"
import OffersSection from "../components/OffersSection"
import { useSite } from "../site/SiteContext"

export default function Home() {
  const { content } = useSite()
  const hero = content.hero
  const learning = content.learning
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <main id="main-content" className="page-home">
      <section id="inicio" className="hero snap-section" data-theme="dark">
        <div className="hero-video" aria-hidden="true">
          {hero.video ? (
            <video autoPlay={!prefersReducedMotion} muted loop playsInline poster={hero.poster} preload="metadata">
              <source src={hero.video} type="video/mp4" />
            </video>
          ) : (
            <img src={hero.poster} alt="" />
          )}
        </div>
        <div className="hero-inner">
          <div className="hero-copy enter">
            <h1>{hero.title}</h1>
            <p className="hero-lead">{hero.lead}</p>
            <div className="hero-actions">
              <a href="#catalogo" className="btn btn-accent">
                {hero.cta} <IconArrow />
              </a>
            </div>
          </div>
        </div>
        <ul className="hero-foot">
          {(hero.notes || []).map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}
        </ul>
      </section>

      <CatalogSection />
      <OffersSection />

      <div className="home-record">
        <section className="home-bridge snap-section" aria-labelledby="aprender-title">
          <div className="section-wrap bridge-layout">
            <div className="bridge-copy">
              <p className="section-kicker">{learning.kicker}</p>
              <h2 id="aprender-title">{learning.title}</h2>
              <p>{learning.text}</p>
              <div className="bridge-actions">
                <a href="#alumnos" className="btn btn-ink">{learning.cta}</a>
              </div>
            </div>

            <div className="learning-gallery" aria-label="Alumnos aprendiendo en clases prácticas">
              {learning.photos.map((photo, index) => (
                <figure key={`${photo.caption}-${index}`} className={index === 0 ? "learning-gallery-main" : undefined}>
                  {photo.src ? <img src={photo.src} alt={photo.alt} width={index === 0 ? 1200 : 1000} height={index === 0 ? 858 : 900} loading="lazy" /> : null}
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <StudentsSection />
        </section>

        <InstitutionSection />
      </div>

      <ContactSection />
    </main>
  )
}
