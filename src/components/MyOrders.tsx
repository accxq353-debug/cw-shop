"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  Gift,
  LogIn,
  Package,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { eur } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { apiFetch, useUser } from "@/lib/useUser";
import { useLanguage } from "@/lib/language";
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
  deliveredContent?: string | null;
  deliveredDescription?: string | null;
  deliveredAt?: string | null;
  reviewed?: boolean;
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
  const { t } = useLanguage();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  // Review modal state
  const [reviewOrderCode, setReviewOrderCode] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");

  const loadOrders = () => {
    if (!user && !sessionKey) return;
    const url = user
      ? "/api/orders"
      : `/api/orders?session=${encodeURIComponent(sessionKey)}`;
    apiFetch(url)
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d.orders) ? d.orders : []))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    if (!userReady) return;
    loadOrders();
    if (user?.name) {
      setReviewAuthor(user.name);
    }
  }, [userReady, user, sessionKey]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrderCode) return;
    setReviewBusy(true);
    setReviewError("");
    setReviewSuccess(null);
    try {
      const res = await apiFetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: reviewAuthor || user?.name || "Pirkėjas",
          body: reviewText,
          rating,
          orderCode: reviewOrderCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko išsaugoti atsiliepimo.");

      setReviewSuccess("Ačiū už jūsų atsiliepimą! Jis sėkmingai paskelbtas.");
      setReviewText("");
      setTimeout(() => {
        setReviewOrderCode(null);
        setReviewSuccess(null);
        loadOrders();
      }, 2000);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Klaida.");
    } finally {
      setReviewBusy(false);
    }
  };

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
          {t.noOrdersTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-muted">
          {user ? t.noOrdersDescUser : t.noOrdersDescGuest}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/produktai"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-display text-[14px] font-extrabold text-void transition-transform hover:-translate-y-px"
          >
            {t.browseCatalogBtn}
            <Zap size={15} strokeWidth={2.4} />
          </Link>
          {!user ? (
            <Link
              href="/prisijungimas"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-6 py-3 text-[14px] text-muted transition-colors hover:text-ink"
            >
              <LogIn size={15} />
              {t.signInTab}
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Review Modal */}
      {reviewOrderCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitReview}
            className="w-full max-w-lg rounded-2xl border border-signal/60 bg-panel p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-display text-[19px] font-extrabold text-ink">
                <Star size={20} className="fill-warn text-warn" />
                {t.leaveReview} · #{reviewOrderCode}
              </div>
              <button
                type="button"
                onClick={() => setReviewOrderCode(null)}
                className="text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="micro block text-muted/70">{t.nameLabel}</label>
                <input
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="Vardas / Name"
                  className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 text-[14px] outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="micro block text-muted/70">{t.rating}</label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="p-1 text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={n <= rating ? "fill-warn text-warn" : "text-line"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="micro block text-muted/70">{t.comment} *</label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Your review / Atsiliepimas..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-line bg-void px-3.5 py-2.5 text-[14px] outline-none focus:border-signal"
                />
              </div>
            </div>

            {reviewError ? (
              <p className="mt-3 text-[13.5px] text-red-400">{reviewError}</p>
            ) : null}

            {reviewSuccess ? (
              <p className="mt-3 text-[13.5px] text-live">{reviewSuccess}</p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setReviewOrderCode(null)}
                className="rounded-xl border border-line px-4 py-2.5 text-[13.5px] text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-signal px-6 py-2.5 font-display text-[14px] font-extrabold text-void hover:opacity-90 disabled:opacity-50"
              >
                <Check size={16} strokeWidth={3} />
                {reviewBusy ? "Sending..." : t.sendReview}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {orders.map((o) => (
        <article key={o.code} className="panel rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="micro text-muted/70">{t.orderNumLabel}</div>
              <div className="num mt-1 text-[19px] font-bold">#{o.code}</div>
            </div>
            <div>
              <div className="micro text-muted/70">{t.orderDate}</div>
              <div className="num mt-1 text-[14px]">
                {new Date(o.createdAt).toLocaleString(t.openCatalogBtn === "Browse Catalog" ? "en-US" : "lt-LT", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            </div>
            <div>
              <div className="micro text-muted/70">{t.orderTotal}</div>
              <div className="num mt-1 text-[19px] font-bold text-signal">
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
            <span className="micro text-muted/70">{t.paymentMethodLabel}:</span>
            <span className="num font-bold text-ink">
              {o.method === "bank"
                ? "Bank Transfer"
                : o.method === "ltc"
                  ? "Litecoin (LTC)"
                  : "PayPal Friends & Family"}
            </span>
            <span className="micro ml-auto rounded-full border border-line px-2.5 py-1">
              {o.proofs && o.proofs.length > 0
                ? `${t.proofLabel} ${o.proofs[0].filename}`
                : t.proofMissing}
            </span>
          </div>

          {/* DELIVERED PRODUCT BOX */}
          {o.status === "ivykdyta" && (o.deliveredContent || o.deliveredDescription) ? (
            <div className="mt-5 rounded-2xl border border-live/40 bg-live/[0.08] p-5 shadow-inner">
              <div className="flex items-center gap-2 font-display text-[16px] font-extrabold text-live">
                <Gift size={18} />
                {t.deliveredBoxHeading}
              </div>
              {o.deliveredDescription ? (
                <p className="mt-2 text-[14px] leading-relaxed text-ink">
                  {o.deliveredDescription}
                </p>
              ) : null}
              {o.deliveredContent ? (
                <div className="mt-3">
                  <div className="micro text-muted/70">{t.credentialsLabel}</div>
                  <pre className="mt-1 select-all overflow-x-auto rounded-xl border border-live/30 bg-black/60 p-3 font-mono text-[14px] font-bold text-live">
                    {o.deliveredContent}
                  </pre>
                </div>
              ) : null}

              {/* Leave review prompt */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-live/20 pt-4">
                <div className="text-[13px] text-muted">
                  {o.reviewed ? (
                    <span className="inline-flex items-center gap-1.5 text-live">
                      <Check size={14} /> {t.alreadyReviewed}
                    </span>
                  ) : (
                    <span>
                      {t.pleaseLeaveReviewPrompt}
                    </span>
                  )}
                </div>
                {!o.reviewed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setReviewOrderCode(o.code);
                      setReviewAuthor(user?.name || "");
                      setReviewText("");
                      setReviewError("");
                      setReviewSuccess(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-warn px-4 py-2 font-display text-[13px] font-extrabold text-black hover:opacity-90"
                  >
                    <Star size={14} className="fill-black" />
                    {t.leaveReview}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {o.status === "mokejimas_pateiktas" ? (
            <p className="mt-4 rounded-xl border border-warn/30 bg-warn/[0.08] px-4 py-3 text-[13.5px] leading-relaxed text-warn">
              {t.adminVerifyingNote}
            </p>
          ) : null}

          {o.declineReason ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-[13.5px] leading-relaxed text-red-300">
              Payment declined: {o.declineReason}. Open a ticket on Discord #{o.code}.
            </p>
          ) : null}

          {o.adminNote ? (
            <p className="mt-4 rounded-xl border border-line bg-void px-4 py-3 text-[13.5px] text-muted">
              <span className="micro text-muted/70">Staff Note: </span>
              {o.adminNote}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-[12.5px] text-muted">
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-live" />
              {t.warrantyLabel}: {t.fullPeriod}
            </span>
            <span className="flex items-center gap-2">
              <Zap size={14} className="text-warn" />
              {t.deliveryLabel}: {o.email}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
