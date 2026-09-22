import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { eur, priceLabel, type Product } from "@/data/catalog";

export default function PriceRow({ product }: { product: Product }) {
  const unitKinds = product.variants
    .map((v) => v.unit)
    .filter((u): u is string => Boolean(u));
  const units = Array.from(new Set(unitKinds));

  return (
    <Link
      href={`/produktai/${product.slug}`}
      className="group relative grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 border-b border-line px-3 py-4 transition-colors hover:bg-white/[0.035] sm:grid-cols-[52px_minmax(0,1fr)_140px_150px] sm:gap-5 sm:px-5"
    >
      <span
        className="absolute left-0 top-0 h-full w-[2px] scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
        style={{ background: product.accent }}
      />
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[10px] sm:h-[52px] sm:w-[52px]"
        style={{
          backgroundImage: `radial-gradient(90% 90% at 25% 15%, ${product.accent}55 0%, transparent 65%), linear-gradient(155deg, ${product.accent2}44, #070912)`,
        }}
      >
        <span
          className="font-display text-[15px] font-extrabold uppercase sm:text-[17px]"
          style={{ color: "#f2f5ff" }}
        >
          {product.brand.slice(0, 2)}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate font-display text-[16px] font-extrabold tracking-[-0.02em] sm:text-[18px]">
            {product.name}
          </h3>
          {product.badge ? (
            <span className="micro rounded-full border border-live/30 bg-live/10 px-2 py-[3px] text-[9px] text-live">
              {product.badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-[13px] text-muted">{product.tagline}</p>
      </div>

      <div className="hidden sm:block">
        <div className="micro text-muted/60">Vienetai</div>
        <div className="num mt-1 text-[12px] text-muted">
          {units.length ? units.join(" · ") : `${product.variants.length} variantai`}
        </div>
      </div>

      <div className="text-right">
        <div className="num text-[15px] font-bold text-ink sm:text-[17px]">
          {priceLabel(product)}
        </div>
        <div className="micro mt-1 inline-flex items-center gap-1 text-muted transition-colors group-hover:text-signal">
          Rinktis <ArrowRight size={12} strokeWidth={2.6} />
        </div>
      </div>
    </Link>
  );
}
