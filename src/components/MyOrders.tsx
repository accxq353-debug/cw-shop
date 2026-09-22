"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, Package, ShieldCheck, Zap } from "lucide-react";
import { eur } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { apiFetch, useUser } from "@/lib/useUser";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";

type OrderRow = {
  code: string;
  email: string;
  method?: string | null;
  proofs?: { id: number; filename: string; size: number }[];
  totalCents: number;
  status: string;
  declineReason: string | null;
  adminNote: string | null;
  createdAt: string;
  ackedAt: string | null;
  items: {
    productName: string;
    variantLabel: string;
    qty: number;
    unitCents: number;
  }[];
};

export default function MyOrders() {
  const { sessionKey, ready: cartReady } = useCart();
  const { user, ready: userReady } = useUser();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    if (!userReady) return;
    if (!user && !sessionKey) return;
    const url = user
      ? "/api/orders"
      : `/api/orders?session=${encodeURIComponent(sessionKey)}`;
    apiFetch(url)
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d.orders) ? d.orders : []))
      .catch(() => setOrders([]));
  }, [userReady, user, sessionKey]);

  if (!cartReady || !userReady || orders === null) {
    return (
      <div className="space-y-4">
        <div className="panel h-[150px] animate-pulse rounded-2xl" />
        <div className="panel h-[150px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-panel">
          <Package size={22} strokeWidth={1.8} className="text-muted" />
        </div>
        <h2 className="mt-5 font-display text-[19px] font-extrabold">
          Užsakymų kol kas nėra
        </h2>
        <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-muted">
          {user
            ? "Kai atliksi pirmą pirkinį, jis atsiras čia kartu su būsena ir informacija."
            : "Prisijunk prie paskyros — joje saugoma visa tavo užsakymų istorija, net jei užsakyta iš kito įrenginio."}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/produktai"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-display text-[14px] font-extrabold text-void transition-transform hover:-translate-y-px"
          >
            Peržiūrėti kainoraštį
            <Zap size={15} strokeWidth={2.4} />
          </Link>
          {!user ? (
            <Link
              href="/prisijungimas"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-6 py-3 text-[14px] text-muted transition-colors hover:text-ink"
            >
              <LogIn size={15} />
              Prisijungti
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <article key={o.code} className="panel rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="micro text-muted/70">Užsakymo numeris</div>
              <div className="num mt-1 text-[19px] font-bold">#{o.code}</div>
            </div>
            <div>
              <div className="micro text-muted/70">Data</div>
              <div className="num mt-1 text-[14px]">
                {new Date(o.createdAt).toLocaleString("lt-LT", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            </div>
            <div>
              <div className="micro text-muted/70">Suma</div>
              <div className="num mt-1 text-[19px] font-bold">
                {eur(o.totalCents)}€
              </div>
            </div>
            <span
              className={`micro rounded-full border px-3 py-1.5 ${STATUS_TONE[o.status]}`}
            >
              {STATUS_LABEL[o.status] ?? o.status}
            </span>
          </div>

          <ul className="mt-5 space-y-2 border-t border-line pt-4">
            {o.items.map((i, idx) => (
              <li
                key={`${o.code}-${idx}`}
                className="flex items-center justify-between gap-4 text-[14px]"
              >
                <span className="min-w-0 truncate">
                  <span className="font-display font-extrabold">
                    {i.productName}
                  </span>
                  <span className="text-muted">
                    {" "}
                    · {i.variantLabel}
                    {i.qty > 1 ? ` ×${i.qty}` : ""}
                  </span>
                </span>
                    <span className="num shrink-0">{eur(i.unitCents * i.qty)}€</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
                <span className="micro text-muted/70">Mokėjimo būdas</span>
                <span className="num">
                  {o.method === "bank"
                    ? "Banko pavedimas"
                    : o.method === "ltc"
                      ? "Litecoin (LTC)"
                      : "PayPal Friends & Family"}
                </span>
                <span className="micro ml-auto rounded-full border border-line px-2.5 py-1">
                  {o.proofs && o.proofs.length > 0
                    ? `Įrodymas: ${o.proofs[0].filename}`
                    : "Įrodymas nepridėtas"}
                </span>
              </div>

          {o.status === "mokejimas_pateiktas" ? (
            <p className="mt-4 rounded-xl border border-warn/30 bg-warn/[0.08] px-4 py-3 text-[13.5px] leading-relaxed text-warn">
              Mokėjimas pažymėtas — administratorius jį patvirtins rankiniu
              būdu. Patvirtinę iš karto išsiųsime prekę į {o.email}.
            </p>
          ) : null}

          {o.declineReason ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-[13.5px] leading-relaxed text-red-300">
              Mokėjimas atmestas: {o.declineReason}. Jei manai, kad suklydome —
              parašyk Discord su užsakymo numeriu #{o.code}.
            </p>
          ) : null}

          {o.adminNote ? (
            <p className="mt-4 rounded-xl border border-line bg-void px-4 py-3 text-[13.5px] text-muted">
              <span className="micro text-muted/70">Administratoriaus pastaba: </span>
              {o.adminNote}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-[12.5px] text-muted">
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-live" />
              Garantija visam laikotarpiui
            </span>
            <span className="flex items-center gap-2">
              <Zap size={14} className="text-warn" />
              Pristatymas į {o.email}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
