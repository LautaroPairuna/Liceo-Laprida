import { useSite } from "../site/SiteContext"

export default function InstitutionSection() {
  const { institution, content } = useSite()
  const story = content.story

  return (
    <section id="institucion" className="home-institution snap-section" aria-labelledby="institucion-title">
      <div className="section-wrap institution-layout">
        <header className="institution-intro">
          <p className="section-kicker">La institución</p>
          <h2 id="institucion-title">{story.title}</h2>
          <p>{story.lead}</p>
        </header>

        <ol className="history-rail" aria-label="Trayectoria del Liceo Profesional Laprida">
          {story.milestones.map((item) => (
            <li key={`${item.year}-${item.title}`}>
              {item.dateTime ? <time dateTime={item.dateTime}>{item.year}</time> : <span className="history-now">{item.year}</span>}
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
              <img className="facade-photo" src={story.facade} alt={story.facadeAlt || "Fachada del Liceo Profesional Laprida"} />
            ) : (
              <div className="facade-mount" role="img" aria-label={story.facadeAlt || "Espacio reservado para la fotografía de la fachada del Liceo Profesional Laprida"}>
                <span>Fachada del liceo</span>
              </div>
            )}
            <figcaption>{institution.legalName} · {institution.address}, {institution.locality}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
