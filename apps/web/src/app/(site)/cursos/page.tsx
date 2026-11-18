import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  IconBuilding,
  IconClock,
  IconGmail,
  IconPhone,
  IconPin,
  IconWhatsApp,
} from "@/components/icons";
import { AmbientVideo } from "@/components/site/ambient-video";
import { CatalogBrowser } from "@/components/site/catalog-browser";
import { isFormat, weekSchedule } from "@/lib/institution";
import { getSite } from "@/lib/site";
import type { Format, SiteContent } from "@/lib/types";

const METADATA: Record<Format, Metadata> = {
  presencial: {
    title: "Cursos presenciales | Liceo Laprida",
    description: "Cursos presenciales en el Liceo Profesional Laprida, en San Juan Capital.",
  },
  hibrido: {
    title: "Cursos híbridos | Red Cima",
    description:
      "Cursos híbridos en los formatos digitales de Red Cima: material en el campus y clases en vivo.",
  },
  virtual: {
    title: "Cursos virtuales | Red Cima",
    description: "Cursos virtuales en los formatos digitales de Red Cima, a tu propio tiempo.",
  },
};

export async function generateMetadata({ searchParams }: PageProps<"/cursos">): Promise<Metadata> {
  const { modalidad } = await searchParams;
  const modality = typeof modalidad === "string" && isFormat(modalidad) ? modalidad : "presencial";
  return { ...METADATA[modality], alternates: { canonical: `/cursos?modalidad=${modality}` } };
}

function PresencialFacts({ content }: { content: SiteContent }) {
  const { contact } = content;
  const schedule = weekSchedule(contact.hours);
  const [mailbox, domain = ""] = contact.email.split("@");

  return (
    <div className="catalog-banner-facts">
      <article className="catalog-fact">
        <p className="catalog-fact-title">
          <span className="catalog-fact-icon" aria-hidden="true">
            <IconPin />
          </span>
          Ubicación
        </p>
        <p>
          {contact.address}
          <br />
          {contact.postal} {contact.locality}
        </p>
        <Link className="catalog-fact-map" href="/#contacto">
          Ver la sede
        </Link>
      </article>

      <article className="catalog-fact">
        <p className="catalog-fact-title">
          <span className="catalog-fact-icon" aria-hidden="true">
            <IconPhone />
          </span>
          Contacto
        </p>
        <ul className="catalog-fact-list">
          <li>
            <span className="catalog-fact-mark" aria-hidden="true">
              <IconPhone />
            </span>
            <a href={`tel:+${contact.phoneRaw}`}>{contact.phone}</a>
          </li>
          <li>
            <span className="catalog-fact-mark catalog-fact-mark-wa" aria-hidden="true">
              <IconWhatsApp />
            </span>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </li>
          <li>
            <span className="catalog-fact-mark" aria-hidden="true">
              <IconGmail />
            </span>
            <a href={`mailto:${contact.email}`}>
              {mailbox}
              <wbr />@{domain}
            </a>
          </li>
        </ul>
      </article>

      <article className="catalog-fact">
        <p className="catalog-fact-title">
          <span className="catalog-fact-icon" aria-hidden="true">
            <IconBuilding />
          </span>
          Datos generales
        </p>
        <p className="catalog-fact-name">{contact.legalName}</p>
        <div className="catalog-fact-hours-wrap">
          <span className="catalog-fact-mark" aria-hidden="true">
            <IconClock />
          </span>
          <ul className="catalog-fact-hours">
            {schedule.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span> {item.value}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
}

function CatalogBanner({ modality, content }: { modality: Format; content: SiteContent }) {
  const copy = content.catalogCopy?.[modality] ?? { title: "", lead: "", points: [] };
  const digital = modality !== "presencial";

  return (
    <section
      className={`catalog-banner${digital ? "" : " catalog-banner-media"}`}
      aria-labelledby="catalog-title"
    >
      {digital ? null : (
        <div className="catalog-banner-video" aria-hidden="true">
          <AmbientVideo src="/catalog-sede.mp4" poster="/catalog-sede-poster.jpg" />
        </div>
      )}
      <div className={`catalog-banner-inner${digital ? "" : " catalog-banner-inner-liceo"}`}>
        {digital ? (
          <span className="format-lockup catalog-lockup">
            <span className="format-sigil" aria-hidden="true">
              <img src="/red-cima-mark.svg" alt="" width={192} height={192} />
            </span>
            <span className="format-word">
              <span className="format-red">RED</span>
              <span className="format-name">CIMA</span>
            </span>
          </span>
        ) : (
          <span className="catalog-banner-logo">
            <img src="/logo.png" alt="Liceo Profesional Laprida" />
          </span>
        )}
        <div className="catalog-banner-copy">
          <Link className="catalog-back" href="/#catalogo">
            Elegir otro formato
          </Link>
          <h1 id="catalog-title">{copy.title}</h1>
          <p>{copy.lead}</p>
        </div>
        {digital ? (
          <section className="catalog-banner-aside" aria-label="Cómo se cursa">
            <ul className="catalog-banner-points">
              {(copy.points ?? []).filter(Boolean).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : (
          <PresencialFacts content={content} />
        )}
      </div>
    </section>
  );
}

export default async function CatalogPage({ searchParams }: PageProps<"/cursos">) {
  const { modalidad } = await searchParams;
  if (typeof modalidad !== "string" || !isFormat(modalidad)) redirect("/#catalogo");
  const { content, courses } = await getSite();

  return (
    <main id="main-content" className={`page-catalog catalog-theme-${modalidad}`}>
      <CatalogBanner modality={modalidad} content={content} />
      <CatalogBrowser modality={modalidad} courses={courses} categories={content.categories} />
    </main>
  );
}
