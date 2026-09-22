"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { Star } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import { eur, priceFrom, type Product } from "@/data/catalog";
import { playSound } from "@/lib/audio";
import { useLanguage } from "@/lib/language";

export default function ProductTile({ product }: { product: Product }) {
  const { lang } = useLanguage();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const fromPrice = priceFrom(product);

  const discountPct =
    product.slug.includes("netflix") || product.slug.includes("spotify")
      ? "-90%"
      : product.slug.includes("youtube") || product.slug.includes("codex")
      ? "-77%"
      : product.slug.includes("disney") || product.slug.includes("crunchy")
      ? "-85%"
      : "-75%";

  const inStock = product.isActive !== false;

  // 3D Tilt on Hover calculations
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle tilt angle: max 7 degrees
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
      }}
      className="relative group h-full"
    >
      {/* GLOWING BORDER TRAIL (Animated neon conic gradient border on hover) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[1.5px] rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 overflow-hidden"
        style={{
          background: "conic-gradient(from var(--border-angle, 0deg), #7c3aed, #c084fc 30%, #4ade80 50%, #b78bff 75%, #7c3aed 100%)",
          animation: "spin-border 4s linear infinite",
        }}
      />

      <Link
        href={`/produktai/${product.slug}`}
        onClick={() => playSound("click")}
        onMouseEnter={() => playSound("hover")}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(0)`,
          transition: rotate.x === 0 && rotate.y === 0 ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease" : "transform 0.08s ease-out",
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-[#1f222a] bg-[#0c0d12] shadow-xl"
      >
        {/* Dynamic Light Glare Reflection */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.22) 0%, transparent 65%)`,
          }}
        />

        {/* Top Badges overlay */}
        <div className="absolute left-3.5 top-3.5 z-20 flex items-center gap-2">
          {product.featured || product.badge ? (
            <span className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-[#1e170c]/90 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-400 backdrop-blur-md shadow-sm">
              <Star size={11} className="fill-amber-400" />
              <span>{product.badge || (lang === "en" ? "Best Seller" : "Populiaru")}</span>
            </span>
          ) : null}
        </div>

        <div className="absolute right-3.5 top-3.5 z-20">
          <span className="rounded-lg border border-emerald-500/30 bg-[#091b12]/90 px-2.5 py-0.5 text-[11px] font-black text-emerald-400 backdrop-blur-md">
            {discountPct}
          </span>
        </div>

        {/* 3D Dark Metallic Brand Banner */}
        <div className="relative w-full border-b border-[#1b1d24]">
          <ProductArt product={product} className="h-[155px] w-full" />
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col justify-between flex-1">
          <div>
            {/* Stock & Rating line */}
            <div className="flex items-center gap-2.5 text-[12px]">
              <span
                className={`inline-flex items-center gap-1.5 font-bold ${
                  inStock ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-emerald-400" : "bg-rose-400"}`} />
                {inStock ? (lang === "en" ? "In stock" : "Turime") : (lang === "en" ? "Out of stock" : "Išparduota")}
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star size={11} className="fill-amber-400" />
                <span>5.0</span>
                <span className="text-muted/60 font-normal">
                  ({product.variants.length * 12 + 8})
                </span>
              </span>
            </div>

            {/* Product Title */}
            <h3 className="mt-2 font-display text-[16px] font-extrabold text-[#f1f3f8] group-hover:text-signal transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>

          {/* Price & Buy Now row */}
          <div className="mt-5 flex items-baseline justify-between pt-3 border-t border-[#181a22]">
            <div className="flex items-baseline gap-2">
              <span className="num text-[21px] font-black tracking-tight text-white group-hover:text-signal transition-colors">
                {eur(fromPrice)}€
              </span>
              <span className="num text-[12px] font-medium text-muted/50 line-through">
                {eur(Math.round(fromPrice * 2.8))}€
              </span>
            </div>

            <span className="text-[12px] font-black tracking-wider text-muted group-hover:text-signal transition-colors uppercase">
              {lang === "en" ? "Buy Now →" : "Pirkti →"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
