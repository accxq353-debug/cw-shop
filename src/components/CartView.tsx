"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Copy, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { eur } from "@/data/catalog";
import { useCart } from "@/lib/cart";

export function CopyField({
  label,
  value,
  display,
  href,
}: {
  label: string;
  value: string;
  display: string;
  href?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-void px-4 py-3.5">
      <div className="micro text-muted/70">{label}</div>
      <div className="mt-2 flex items-center gap-3">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="num min-w-0 flex-1 truncate text-[13.5px] text-signal underline-offset-4 hover:underline"
          >
            {display}
          </a>
        ) : (
          <span className="num min-w-0 flex-1 truncate text-[15px] font-bold text-ink">
            {display}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label={`Kopijuoti ${label}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-white/25 hover:text-ink"
        >
          {copied ? (
            <Check size={15} strokeWidth={3} className="text-live" />
          ) : (
            <Copy size={15} strokeWidth={2.1} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function CartView() {
  const { resolved, totalCents, setQty, remove, ready } = useCart();

  if (!ready) {
    return <div className="panel h-[320px] animate-pulse rounded-2xl" />;
  }

  if (resolved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-panel">
          <ShoppingCart size={22} strokeWidth={1.8} className="text-muted" />
        </div>
        <h2 className="mt-5 font-display text-[19px] font-extrabold">
          Krepšelis kol kas tuščias
        </h2>
        <p className="mx-auto mt-2 max-w-[44ch] text-[14px] leading-relaxed text-muted">
          Įsidėk prekę iš kainoraščio — čia ji atsiras kartu su kiekiu, suma ir
          galimybe pereiti prie apmokėjimo.
        </p>
        <Link
          href="/produktai"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-display text-[14px] font-extrabold text-void transition-transform hover:-translate-y-px"
        >
          Atidaryti kainoraštį
          <ArrowRight size={15} strokeWidth={2.6} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        {resolved.map((line) => (
          <div
            key={`${line.slug}-${line.variantId}`}
            className="flex flex-wrap items-center gap-4 border-b border-line p-4 last:border-b-0 sm:flex-nowrap"
          >
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundImage: `radial-gradient(90% 90% at 25% 15%, ${line.accent}55 0%, transparent 65%), linear-gradient(155deg, ${line.accent2}44, #070912)`,
              }}
            >
              <span className="font-display text-[16px] font-extrabold uppercase text-white">
                {line.brand.slice(0, 2)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/produktai/${line.slug}`}
                className="font-display text-[16px] font-extrabold tracking-[-0.01em] transition-colors hover:text-signal"
              >
                {line.name}
              </Link>
              <div className="num mt-1 text-[12.5px] text-muted">
                {line.variantLabel}
                {line.unit ? ` · ${line.unit}` : ""} · {eur(line.unitCents)}€
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-line bg-void p-1">
              <button
                type="button"
                aria-label="Mažinti"
                onClick={() => setQty(line.slug, line.variantId, line.qty - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-ink"
              >
                <Minus size={14} strokeWidth={2.6} />
              </button>
              <span className="num w-9 text-center text-[14px] font-bold">
                {line.qty}
              </span>
              <button
                type="button"
                aria-label="Didinti"
                onClick={() => setQty(line.slug, line.variantId, line.qty + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white/5 hover:text-ink"
              >
                <Plus size={14} strokeWidth={2.6} />
              </button>
            </div>

            <div className="num w-[86px] text-right text-[16px] font-bold">
              {eur(line.lineCents)}€
            </div>

            <button
              type="button"
              aria-label="Pašalinti"
              onClick={() => remove(line.slug, line.variantId)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:text-warn"
            >
              <Trash2 size={15} strokeWidth={2.1} />
            </button>
          </div>
        ))}
      </div>

      <aside className="panel h-fit rounded-2xl p-6 lg:sticky lg:top-28">
        <div className="micro text-signal">Suvestinė</div>
        <h2 className="mt-2 font-display text-[22px] font-extrabold tracking-[-0.02em]">
          Jūsų užsakymas
        </h2>

        <dl className="mt-6 space-y-3 text-[14px]">
          <div className="flex items-center justify-between">
            <dt className="text-muted">Prekių</dt>
            <dd className="num">
              {resolved.reduce((n, l) => n + l.qty, 0)} vnt.
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <dt className="text-muted">Tarpinė suma</dt>
            <dd className="num">{eur(totalCents)}€</dd>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <dt className="font-display text-[16px] font-extrabold">
              Bendra suma
            </dt>
            <dd className="num text-[26px] font-bold">{eur(totalCents)}€</dd>
          </div>
        </dl>

        <Link
          href="/atsiskaitymas"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-display text-[15px] font-extrabold text-void transition-transform hover:-translate-y-px"
        >
          Tęsti atsiskaitymą
          <ArrowRight size={16} strokeWidth={2.6} />
        </Link>

        <ul className="mt-6 space-y-3 border-t border-line pt-5 text-[13px] text-muted">
          <li className="flex items-start gap-2.5">
            <Check size={15} className="mt-0.5 shrink-0 text-live" />
            Saugus atsiskaitymas — užsakymo duomenys lieka pas mus
          </li>
          <li className="flex items-start gap-2.5">
            <Check size={15} className="mt-0.5 shrink-0 text-live" />
            Greitas pristatymas — prekę išsiunčiame patvirtinę mokėjimą
          </li>
          <li className="flex items-start gap-2.5">
            <Check size={15} className="mt-0.5 shrink-0 text-live" />
            Tavo duomenys privatūs — piniginių rekvizitų nesaugome
          </li>
        </ul>
      </aside>
    </div>
  );
}
