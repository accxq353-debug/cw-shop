"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import { eur, priceFrom, type Product } from "@/data/catalog";
import { playSound } from "@/lib/audio";
import { useLanguage } from "@/lib/language";

export default function ProductTile({ product }: { product: Product }) {
  const { t } = useLanguage();

  return (
    <Link
      href={`/produktai/${product.slug}`}
      onClick={() => playSound("click")}
      onMouseEnter={() => playSound("hover")}
      className="group block overflow-hidden rounded-[18px] border border-line bg-panel transition-all duration-300 hover:-translate-y-1.5 hover:border-signal/50 hover:shadow-[0_10px_30px_rgba(183,139,255,0.12)]"
    >
      <ProductArt product={product} className="h-[240px] w-full" />
      <div className="border-t border-line p-5">
        <div className="micro text-signal">{product.kind}</div>
        <h3 className="mt-1.5 font-display text-[19px] font-extrabold tracking-[-0.02em] group-hover:text-signal transition-colors">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-[40px] text-[13.5px] leading-snug text-muted">
          {product.tagline}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="micro text-muted/70">{t.from}</div>
            <div className="num text-[19px] font-bold text-signal">
              {eur(priceFrom(product))}€
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 font-display text-[13px] font-extrabold text-void transition-transform group-hover:translate-x-0.5">
            {t.view}
            <ArrowUpRight size={15} strokeWidth={2.6} />
          </span>
        </div>
      </div>
    </Link>
  );
}
