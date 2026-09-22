import type { Metadata } from "next";
import CatalogBrowser from "@/components/CatalogBrowser";
import { products, totalVariants } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Kainoraštis — Cw-Shop",
  description:
    "Visas skaitmeninių prekių kainoraštis: prenumeratos, žaidimai, AI įrankiai, Discord, SMM ir VPN. Kainos aiškios, pristatymas greitas.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string }>;
}) {
  const { kat } = await searchParams;

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-14">
      <header className="mb-12">
        <div className="micro text-signal">Kainoraštis</div>
        <h1 className="display mt-3 text-[clamp(2.4rem,6vw,4rem)]">
          Prekių katalogas
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted">
          {products.length} prekės ir {totalVariants()} variantai viename
          sąraše. Kainos nurodytos galutinės — be papildomų mokesčių. Rinkis
          kategoriją kairėje arba filtruok kainoraštį.
        </p>
      </header>

      <CatalogBrowser initialCat={kat} />
    </div>
  );
}
