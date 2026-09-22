import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductPurchase from "@/components/ProductPurchase";
import ProductTile from "@/components/ProductTile";
import Reveal from "@/components/Reveal";
import { productBySlug, products } from "@/data/catalog";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Prekė nerasta" };
  return {
    title: `${product.name} — Cw-Shop`,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-10">
      <nav className="mb-8 flex items-center gap-2 text-[13px] text-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Pradžia
        </Link>
        <ChevronRight size={14} />
        <Link href="/produktai" className="transition-colors hover:text-ink">
          Kainoraštis
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink">{product.name}</span>
      </nav>

      <ProductPurchase product={product} />

      {related.length > 0 ? (
        <section className="mt-24">
          <div className="flex items-end justify-between gap-4">
            <h2 className="display text-[clamp(1.6rem,3.6vw,2.2rem)]">
              Taip pat perka
            </h2>
            <Link
              href="/produktai"
              className="text-[14px] text-muted transition-colors hover:text-ink"
            >
              Visas kainoraštis →
            </Link>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <ProductTile product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
