import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/checkout-form";
import { getSite } from "@/lib/site";

export const metadata: Metadata = {
  title: "Inscripción | Red Laprida",
  description: "Completá tu inscripción y coordiná cupo, turno y forma de pago.",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const { content, courses } = await getSite();

  return (
    <main id="main-content" className="page-checkout">
      <header className="checkout-head">
        <p className="section-kicker">Inscripción directa</p>
        <h1>Un paso para empezar.</h1>
        <p>
          Completá tus datos, revisá la inversión final y continuá de forma segura con Mercado Pago.
        </p>
      </header>
      <CheckoutForm courses={courses} content={content} />
    </main>
  );
}
