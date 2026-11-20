import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IconArrow } from "@/components/icons";
import { AmbientVideo } from "@/components/site/ambient-video";
import {
  CatalogSection,
  ContactSection,
  InstitutionSection,
  OffersSection,
  StudentsSection,
} from "@/components/site/home-sections";
import { isFormat } from "@/lib/institution";
import { getSite } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";

const CATALOG_KEYS = ["modalidad", "area", "q", "duracion", "inicio"];

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const [query, { content, courses }] = await Promise.all([searchParams, getSite()]);
  if (CATALOG_KEYS.some((key) => typeof query[key] === "string")) {
    const next = new URLSearchParams(
      Object.entries(query).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
    if (!isFormat(next.get("modalidad"))) {
      const area = content.categories.find((category) => category.id === next.get("area"));
      next.set("modalidad", area?.modes[0] ?? "presencial");
    }
    redirect(`/cursos?${next.toString()}`);
  }
  const { hero, learning, contact } = content;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: content.brand.name,
    url: siteUrl,
    logo: `${siteUrl}/red-cima-logo.svg`,
    email: contact.email,
    telephone: `+${contact.phoneRaw}`,
    sameAs: [contact.instagram, contact.facebook].filter(Boolean),
    subOrganization: {
      "@type": "EducationalOrganization",
      name: contact.legalName,
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.address,
        postalCode: contact.postal,
        addressLocality: contact.locality,
        addressCountry: "AR",
      },
    },
  };

  return (
    <main id="main-content" className="page-home">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD needs a raw script body; "<" is escaped
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section id="inicio" className="hero snap-section" data-theme="dark">
        <div className="hero-video" aria-hidden="true">
          {hero.video ? (
            <AmbientVideo src={hero.video} poster={hero.poster} />
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
          {(hero.notes ?? []).map((note, index) => (
            <li key={`${note}-${index}`}>{note}</li>
          ))}
        </ul>
      </section>

      <CatalogSection content={content} courses={courses} />
      <OffersSection content={content} courses={courses} />

      <div className="home-record">
        <section className="home-bridge snap-section" aria-labelledby="aprender-title">
          <div className="section-wrap bridge-layout">
            <div className="bridge-copy" data-reveal>
              <p className="section-kicker">{learning.kicker}</p>
              <h2 id="aprender-title">{learning.title}</h2>
              <p>{learning.text}</p>
              <div className="bridge-actions">
                <a href="#alumnos" className="btn btn-ink">
                  {learning.cta}
                </a>
              </div>
            </div>

            <section
              className="learning-gallery"
              data-reveal-stagger
              aria-label="Alumnos aprendiendo en clases prácticas"
            >
              {learning.photos.map((photo, index) => (
                <figure
                  key={`${photo.caption}-${index}`}
                  className={index === 0 ? "learning-gallery-main" : undefined}
                  data-reveal
                >
                  {photo.src ? (
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={index === 0 ? 1200 : 1000}
                      height={index === 0 ? 858 : 900}
                      loading="lazy"
                    />
                  ) : null}
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </section>
          </div>

          <StudentsSection reviews={content.reviews} />
        </section>

        <InstitutionSection content={content} />
      </div>

      <ContactSection content={content} />
    </main>
  );
}
