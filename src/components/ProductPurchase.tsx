"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Minus, Plus, ShieldCheck, ShoppingCart, Timer } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import MagneticButton from "@/components/MagneticButton";
import { eur, type Product } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { playSound } from "@/lib/audio";

export default function ProductPurchase({ product }: { product: Product }) {
  const { add, count } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const total = variant.priceCents * qty;

  const onAdd = () => {
    add(product.slug, variant.id, qty);
    playSound("chime");
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,470px)_minmax(0,1fr)]">
      <div>
        <ProductArt
          product={product}
          size="lg"
          className="h-[380px] rounded-[20px] border border-line sm:h-[440px]"
        />
        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
          <div className="bg-panel px-4 py-4">
            <div className="micro text-muted/70">Pristatymas</div>
            <div className="num mt-1.5 text-[14px]">{product.delivery}</div>
          </div>
          <div className="bg-panel px-4 py-4">
            <div className="micro text-muted/70">Tipas</div>
            <div className="num mt-1.5 text-[14px]">{product.kind}</div>
          </div>
          <div className="bg-panel px-4 py-4">
            <div className="micro text-muted/70">Garantija</div>
            <div className="num mt-1.5 text-[14px]">Visas laikotarpis</div>
          </div>
        </div>
      </div>

      <div>
        <div className="micro text-signal">
          {product.kind} · {product.delivery}
        </div>
        <h1 className="display mt-3 text-[clamp(2.1rem,5vw,3.2rem)]">
          {product.name}
        </h1>
        {product.tagline ? (
          <p className="mt-4 max-w-[58ch] text-[15.5px] font-medium leading-relaxed text-signal">
            {product.tagline}
          </p>
        ) : null}

        {product.description ? (
          <div className="mt-4 max-w-[62ch] whitespace-pre-line rounded-xl border border-line bg-panel/40 p-4 text-[14.5px] leading-relaxed text-muted/95 shadow-inner">
            {product.description}
          </div>
        ) : null}

        <div className="mt-9">
          <div className="micro text-muted/70">Pasirink variantą</div>
          <div className="mt-3 space-y-2">
            {product.variants.map((v) => {
              const active = v.id === variant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-colors ${
                    active
                      ? "border-signal/70 bg-signal/[0.08]"
                      : "border-line bg-panel hover:border-white/20"
                  }`}
                >
                  <span
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-signal" : "border-muted/50"
                    }`}
                    style={{
                      width: 18,
                      height: 18,
                      background: active ? "var(--color-signal)" : "transparent",
                    }}
                  >
                    {active ? (
                      <Check size={12} strokeWidth={3.5} className="text-void" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15.5px] font-extrabold tracking-[-0.01em]">
                      {v.label}
                    </span>
                    {v.strikeLabel ? (
                      <span className="num mt-0.5 block text-[12px] text-muted/70">
                        Įprasta kaina{" "}
                        <span className="line-through">{v.strikeLabel}</span>
                      </span>
                    ) : v.unit ? (
                      <span className="num mt-0.5 block text-[12px] text-muted/70">
                        Už {v.unit}
                      </span>
                    ) : null}
                  </span>
                  <span className="num shrink-0 text-[17px] font-bold">
                    {eur(v.priceCents)}€
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <div>
            <div className="micro text-muted/70">Kiekis</div>
            <div className="mt-2 flex items-center gap-1 rounded-xl border border-line bg-panel p-1">
              <button
                type="button"
                aria-label="Mažinti"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                <Minus size={15} strokeWidth={2.6} />
              </button>
              <span className="num w-10 text-center text-[15px] font-bold">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Didinti"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                <Plus size={15} strokeWidth={2.6} />
              </button>
            </div>
          </div>

          <div>
            <div className="micro text-muted/70">Suma</div>
            <div className="num mt-2 text-[26px] font-bold text-signal">
              {eur(total)}€
            </div>
          </div>

          <MagneticButton className="ml-auto" strength={0.28}>
            <button
              type="button"
              onClick={onAdd}
              className={`inline-flex items-center gap-2.5 rounded-xl px-7 py-4 font-display text-[15px] font-extrabold transition-all hover:scale-[1.03] shadow-lg ${
                added ? "bg-live text-void shadow-live/25" : "bg-white text-void shadow-white/20 hover:shadow-signal/30"
              }`}
            >
              {added ? (
                <>
                  <Check size={17} strokeWidth={3} />
                  Įdėta į krepšelį
                </>
              ) : (
                <>
                  <ShoppingCart size={17} strokeWidth={2.4} />
                  Į krepšelį
                </>
              )}
            </button>
          </MagneticButton>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/krepselis"
            className="text-[13.5px] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Krepšelyje: {count} vnt. →
          </Link>
          <Link
            href="/atsiskaitymas"
            className="text-[13.5px] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Pereiti prie apmokėjimo →
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-void/60 p-4">
          <div className="micro text-muted/70">Galimi atsiskaitymo būdai šiai prekei:</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(product.allowedMethods || ["paypal", "bank", "ltc"]).map((m) => (
              <span
                key={m}
                className="micro rounded-lg border border-line bg-panel px-3 py-1 font-mono text-[11px] text-signal"
              >
                {m === "paypal" ? "PayPal (F&F)" : m === "bank" ? "Banko pavedimas" : "Litecoin (LTC)"}
              </span>
            ))}
          </div>
        </div>

        <ul className="mt-9 space-y-3 border-t border-line pt-6 text-[14px] text-muted">
          <li className="flex items-start gap-3">
            <Timer size={17} className="mt-0.5 shrink-0 text-signal" />
            Pateikus užsakymą ir patvirtinus mokėjimą, prekę pristatome tiesiai į svetainę bei atsiunčiame sąskaitą el. paštu per {product.delivery}.
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-live" />
            Garantija visam laikotarpiui — dingus prieigai, keičiame prekę arba
            grąžiname pinigus.
          </li>
          <li className="flex items-start gap-3">
            <Check size={17} className="mt-0.5 shrink-0 text-warn" />
            Mokėjimas tikrinamas rankiniu būdu, po pavedimo būtina prisegti ekrano nuotrauką (screenshot).
          </li>
        </ul>
      </div>
    </div>
  );
}
