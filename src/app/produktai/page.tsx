import type { Metadata } from "next";
import CatalogBrowser from "@/components/CatalogBrowser";
import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

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
  const currentProducts = await getAllProducts();
  const totalVariantsCount = currentProducts.reduce((sum, p) => sum + p.variants.length, 0);

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-14">
      <header className="mb-12">
        <div className="micro text-signal">Kainoraštis</div>
        <h1 className="display mt-3 text-[clamp(2.4rem,6vw,4rem)]">
          Prekių katalogas
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted">
          {currentProducts.length} prekės ir {totalVariantsCount} variantai viename
          sąraše. Kainos nurodytos galutinės — be papildomų mokesčių. Rinkis
          kategoriją kairėje arba filtruok kainoraštį.
        </p>
      </header>

      <CatalogBrowser initialCat={kat} initialProducts={currentProducts} />
    </div>
  );
}
