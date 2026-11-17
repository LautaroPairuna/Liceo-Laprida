import type { Metadata } from "next";
import { PaymentResult } from "@/components/site/payment-result";

export const metadata: Metadata = {
  title: "Estado de tu inscripción | Red Laprida",
  robots: { index: false },
};

export default async function PaymentResultPage({
  searchParams,
}: PageProps<"/inscripcion/resultado">) {
  const { id } = await searchParams;
  return (
    <main id="main-content" className="page-checkout checkout-success-page">
      <PaymentResult id={typeof id === "string" ? id : ""} />
    </main>
  );
}
