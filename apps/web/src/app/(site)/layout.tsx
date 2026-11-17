import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { content } = await getSite();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <Header whatsapp={content.contact.whatsapp} />
      {children}
      <Footer content={content} />
    </>
  );
}
