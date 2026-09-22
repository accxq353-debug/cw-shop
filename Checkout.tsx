"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bitcoin,
  Check,
  Landmark,
  MessageCircle,
  Package,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Trash2,
  Upload,
  Wallet,
  Zap,
} from "lucide-react";
import Logo from "@/components/Logo";
import { CopyField } from "@/components/CopyField";
import MagneticButton from "@/components/MagneticButton";
import { eur } from "@/data/catalog";
import { useCart, type ResolvedLine } from "@/lib/cart";
import { useUser } from "@/lib/useUser";
import { useLanguage } from "@/lib/language";
import { playSound } from "@/lib/audio";
import {
  NO_REFUND_WARNING,
  PAYMENT_METHODS,
  PROOF_NOTE,
  PROOF_REQUIRED,
  SHOP_NAME,
  type PaymentMethod,
} from "@/lib/shop";

const DISCORD = "https://discord.gg/asMCPaCKk";
const METHOD_ICONS = { paypal: Wallet, bank: Landmark, ltc: Bitcoin };

type OrderPayload = {
  code: string;
  email: string;
  totalCents: number;
  status: string;
  method?: string | null;
  createdAt: string;
  items: {
    productName: string;
    variantLabel: string;
    unitCents: number;
    qty: number;
  }[];
};

type ProofMeta = { id: number; filename: string; size: number };

function Countdown({ from }: { from: string }) {
  const [left, setLeft] = useState(20 * 60);

  useEffect(() => {
    const end = new Date(from).getTime() + 20 * 60 * 1000;
    const tick = () =>
      setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [from]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <span className="num inline-flex items-center gap-2 rounded-full border border-signal/40 bg-signal/10 px-4 py-1.5 text-[13px] text-signal font-bold shadow-sm">
      <Timer size={14} className="text-signal animate-pulse" />
      <span>Galioja dar: {mm}:{ss}</span>
    </span>
  );
}

export default function Checkout() {
  const { resolved, totalCents, sessionKey, ready, clear, allowedMethods } = useCart();
  const { user } = useUser();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [note, setNote] = useState("");
  const [methodId, setMethodId] = useState<PaymentMethod["id"]>("paypal");

  // Crypto Auto-detector state
  const [cryptoRate, setCryptoRate] = useState<{ ltcEur: number; usdtEur: number } | null>(null);
  const [cryptoCurrency, setCryptoCurrency] = useState<"LTC" | "USDT">("LTC");

  // 2FA Verification state for High-Value orders (>= 20.00€)
  const isHighValue = totalCents >= 2000;
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);
  const [twoFactorRequested, setTwoFactorRequested] = useState(false);
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState("");
  const [twoFactorDevHint, setTwoFactorDevHint] = useState<string | null>(null);
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");

  useEffect(() => {
    fetch("/api/crypto/rates")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ltcEur) {
          setCryptoRate({ ltcEur: data.ltcEur, usdtEur: data.usdtEur || 0.95 });
        }
      })
      .catch(() => {});
  }, []);

  // Automatically switch methodId if current is not in allowedMethods
  useEffect(() => {
    if (allowedMethods && allowedMethods.length > 0 && !allowedMethods.includes(methodId)) {
      setMethodId(allowedMethods[0] as PaymentMethod["id"]);
    }
  }, [allowedMethods, methodId]);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [acked, setAcked] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [proof, setProof] = useState<ProofMeta | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.discord) setDiscord(user.discord);
  }, [user]);

  const method =
    PAYMENT_METHODS.find((m) => m.id === methodId) ?? PAYMENT_METHODS[0];

  const lines: ResolvedLine[] = order
    ? order.items.map((i, idx) => ({
        productSlug: `item-${idx}`,
        variantId: `v${idx}`,
        qty: i.qty,
        slug: `item-${idx}`,
        name: i.productName,
        brand: i.productName.slice(0, 2),
        accent: "#B78BFF",
        accent2: "#6D28D9",
        variantLabel: i.variantLabel,
        unitCents: i.unitCents,
        lineCents: i.unitCents * i.qty,
      }))
    : resolved;

  const total = order ? order.totalCents : totalCents;

  const deadline = useMemo(
    () => (order ? new Date(order.createdAt) : null),
    [order],
  );

  // Exact crypto calculation
  const calculatedCrypto = useMemo(() => {
    if (!cryptoRate) return null;
    const totalEur = total / 100;
    if (cryptoCurrency === "LTC") {
      const ltcAmount = totalEur / cryptoRate.ltcEur;
      return {
        currency: "LTC",
        amount: ltcAmount.toFixed(4),
        rateEur: cryptoRate.ltcEur.toFixed(2),
      };
    } else {
      const usdtAmount = totalEur / cryptoRate.usdtEur;
      return {
        currency: "USDT",
        amount: usdtAmount.toFixed(2),
        rateEur: cryptoRate.usdtEur.toFixed(2),
      };
    }
  }, [total, cryptoRate, cryptoCurrency]);

  const handleRequest2FA = async () => {
    setTwoFactorBusy(true);
    setTwoFactorError("");
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          email,
          orderTotalCents: totalCents,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko išsiųsti 2FA kodo.");
      setTwoFactorRequested(true);
      if (data.devCode) {
        setTwoFactorDevHint(data.devCode);
      }
      playSound("pop");
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "Klaida siunčiant 2FA.");
      playSound("error");
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const handleVerify2FA = async () => {
    setTwoFactorBusy(true);
    setTwoFactorError("");
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          email,
          code: twoFactorCodeInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Neteisingas 2FA kodas.");
      setTwoFactorVerified(true);
      playSound("success");
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : "2FA klaida.");
      playSound("error");
    } finally {
      setTwoFactorBusy(false);
    }
  };

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    // If high value and not yet verified, prompt for 2FA
    if (isHighValue && !twoFactorVerified) {
      if (!twoFactorRequested) {
        await handleRequest2FA();
        return;
      }
      setError("Pirmiausia suveskite ir patvirtinkite 2FA saugumo kodą.");
      playSound("error");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKey,
          email,
          discord,
          note,
          method: methodId,
          twoFactorVerified: isHighValue ? true : false,
          items: resolved.map((l) => ({
            productSlug: l.slug,
            variantId: l.variantId,
            qty: l.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko sukurti užsakymo.");
      setOrder(data as OrderPayload);
      clear();
      setStep(1);
      playSound("click");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepavyko sukurti užsakymo.",
      );
      playSound("error");
    } finally {
      setBusy(false);
    }
  };

  const uploadProof = async () => {
    if (!order || !file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/orders/${order.code}/proof`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko įkelti įrodymo.");
      setProof(data.proof as ProofMeta);
      setFile(null);
      playSound("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko įkelti įrodymo.");
      playSound("error");
    } finally {
      setUploading(false);
    }
  };

  const ackPayment = async () => {
    if (!order) return;
    if (!proof) {
      setError(PROOF_REQUIRED);
      playSound("error");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.code}/ack`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nepavyko pažymėti mokėjimo.");
      setAcked(true);
      setStep(2);
      playSound("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko pažymėti.");
      playSound("error");
    } finally {
      setBusy(false);
    }
  };

  if (ready && resolved.length === 0 && !order) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-panel">
          <Package size={22} strokeWidth={1.8} className="text-muted" />
        </div>
        <h2 className="mt-5 font-display text-[19px] font-extrabold">
          Nėra ką apmokėti
        </h2>
        <p className="mx-auto mt-2 max-w-[44ch] text-[14px] text-muted">
          Krepšelis tuščias. Įsidėk prekę iš kainoraščio ir grįžk čia.
        </p>
        <Link
          href="/produktai"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-display text-[14px] font-extrabold text-void"
        >
          Kainoraštis
          <ArrowRight size={15} strokeWidth={2.6} />
        </Link>
      </div>
    );
  }

  const stepsList = [t.step1, t.step2, t.step3];

  return (
    <>
      {order ? (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <span className="num inline-flex items-center gap-2 rounded-full border border-live/30 bg-live/10 px-3.5 py-1.5 text-[13px] text-live">
            <Package size={14} />
            Užsakymas #{order.code}
          </span>
          {step === 1 && deadline ? (
            <Countdown from={deadline.toISOString()} />
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,580px)]">
        {/* ── kairė: suvestinė ── */}
        <aside className="panel h-fit rounded-2xl p-7 lg:sticky lg:top-28">
          <div className="flex items-center gap-4 border-b border-line pb-5">
            <Logo size={90} />
            <div>
              <div className="micro text-muted/70">Parduotuvė</div>
              <div className="mt-1 font-display text-[18px] font-extrabold tracking-[-0.02em]">
                {SHOP_NAME}
              </div>
              <div className="text-[13px] text-muted">
                Rankinis patvirtinimas & garantija
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-[19px] font-extrabold">
              Jūsų užsakymas
            </h2>
            <span className="micro rounded-full border border-line px-3 py-1 text-muted">
              {lines.length} {lines.length === 1 ? "prekė" : "prekės"}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {lines.map((l) => (
              <div
                key={`${l.slug}-${l.variantId}`}
                className="rounded-xl border border-line bg-void px-4 py-3.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-display text-[15px] font-extrabold">
                      {l.name}
                      {l.qty > 1 ? (
                        <span className="num ml-2 text-[12px] text-muted">
                          ×{l.qty}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-[13px] text-muted">
                      {l.variantLabel}
                      {l.unit ? ` · ${l.unit}` : ""}
                    </div>
                  </div>
                  <div className="num shrink-0 text-[16px] font-bold">
                    {eur(l.lineCents)}€
                  </div>
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-6 space-y-3 text-[14px]">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Tarpinė suma</dt>
              <dd className="num">{eur(total)}€</dd>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <dt className="font-display text-[18px] font-extrabold">
                Bendra suma
              </dt>
              <dd className="num text-[34px] font-bold leading-none text-signal">
                {eur(total)}€
              </dd>
            </div>
          </dl>

          <ul className="mt-8 space-y-4 border-t border-line pt-6 text-[13.5px]">
            <li className="flex items-start gap-3">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-live" />
              <span>
                <span className="block font-display text-[14px] font-extrabold">
                  Mokėjimą tvirtiname rankiniu būdu
                </span>
                <span className="text-muted">
                  Kiekvieną pavedimą peržiūri žmogus, ne robotas
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Zap size={17} className="mt-0.5 shrink-0 text-live" />
              <span>
                <span className="block font-display text-[14px] font-extrabold">
                  Pristatymas svetainėje ir el. paštu
                </span>
                <span className="text-muted">
                  Prekė ir oficiali sąskaita-faktūra atkeliauja iškart patvirtinus
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Paperclip size={17} className="mt-0.5 shrink-0 text-signal" />
              <span>
                <span className="block font-display text-[14px] font-extrabold">
                  Įrodymas su nuotrauka
                </span>
                <span className="text-muted">
                  Screenshot keliauja tiesiai į mūsų Discord auditą
                </span>
              </span>
            </li>
          </ul>
        </aside>

        {/* ── dešinė: žingsniai ── */}
        <section className="panel rounded-2xl p-7">
          <ol className="flex items-center gap-2 rounded-xl border border-line bg-void p-1.5">
            {stepsList.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li
                  key={label}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13.5px] ${
                    active
                      ? "bg-white/[0.07] font-semibold text-ink"
                      : done
                        ? "text-live"
                        : "text-muted/60"
                  }`}
                >
                  {done ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <span className="num text-[12px]">{i + 1}</span>
                  )}
                  {label}
                </li>
              );
            })}
          </ol>

          {/* 1 — DUOMENYS */}
          {step === 0 ? (
            <form onSubmit={submitDetails} className="mt-8">
              <div className="micro text-signal">{t.step1}</div>
              <h2 className="mt-2 display text-[clamp(1.8rem,4vw,2.4rem)]">
                Kur atsiųsti prekę ir sąskaitą?
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                Užsakymo patvirtinimą, prekę ir PDF sąskaitą-faktūrą siunčiame el. paštu bei pateikiame jūsų paskyroje.
              </p>

              {/* Discord Login Prompt for direct DM Delivery */}
              {!user || !user.discord ? (
                <div className="mt-5 rounded-2xl border border-[#5865f2]/40 bg-[#5865f2]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left text-[13px]">
                    <div className="font-extrabold text-white flex items-center gap-2">
                      <span>👾</span>
                      <span>Gaukite prekę tiesiai į asmenines Discord žinutes (DM)!</span>
                    </div>
                    <p className="text-muted text-[12px] mt-0.5">
                      Prisijunkite per Discord ir mūsų Cw-Shop Bot pristatys prekę tiesiai jums.
                    </p>
                  </div>
                  <a
                    href="/api/auth/discord?redirect=/atsiskaitymas"
                    className="shrink-0 rounded-xl bg-[#5865f2] px-4 py-2 text-[12.5px] font-extrabold text-white hover:bg-[#4752c4] transition-all flex items-center gap-2"
                  >
                    <span>Prisijungti su Discord</span>
                  </a>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-live/30 bg-live/10 p-3 flex items-center gap-2 text-[13px] text-live">
                  <span>✓</span>
                  <span>Prisijungta per Discord: <strong>{user.discord}</strong>. Prekė bus išsiųsta į jūsų Discord DM!</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <label className="micro text-muted/70">El. paštas *</label>
                {user ? (
                  <span className="micro text-live">
                    Prisijungta · {user.name}
                  </span>
                ) : (
                  <Link
                    href="/prisijungimas"
                    className="micro text-signal hover:underline"
                  >
                    Prisijungti prie paskyros
                  </Link>
                )}
              </div>
              <input
                type="email"
                required
                value={user ? user.email : email}
                readOnly={Boolean(user)}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vardas@pastas.lt"
                className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60 read-only:text-muted"
              />

              <label className="micro mt-5 block text-muted/70">
                Discord vardas{" "}
                <span className="text-muted/40">(nebūtina)</span>
              </label>
              <input
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="vardas"
                className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
              />

              <label className="micro mt-5 block text-muted/70">
                Pastaba prie užsakymo
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Pvz.: Netflix variantas su reklamomis, turiu VPN."
                className="mt-2 w-full resize-none rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
              />

              <fieldset className="mt-8">
                <div className="flex items-center justify-between">
                  <legend className="micro text-muted/70">
                    Mokėjimo būdas *
                  </legend>
                  {allowedMethods && allowedMethods.length === 1 ? (
                    <span className="micro rounded-full bg-signal/15 px-2.5 py-0.5 text-signal">
                      Šiam produktui taikomas tik vienas būdas
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 grid gap-2">
                  {PAYMENT_METHODS.filter((m) => !allowedMethods || allowedMethods.includes(m.id)).map((m) => {
                    const Icon = METHOD_ICONS[m.id];
                    const active = m.id === methodId;
                    return (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors ${
                          active
                            ? "border-signal/70 bg-signal/[0.08]"
                            : "border-line bg-void hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          className="sr-only"
                          checked={active}
                          onChange={() => {
                            setMethodId(m.id);
                            playSound("click");
                          }}
                        />
                        <Icon size={19} className="shrink-0 text-signal" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[15px] font-extrabold">
                            {m.label}
                          </span>
                          <span className="block text-[12.5px] text-muted">
                            {m.kicker}
                          </span>
                        </span>
                        <span
                          className={`h-4 w-4 shrink-0 rounded-full border ${
                            active
                              ? "border-signal bg-signal"
                              : "border-muted/50"
                          }`}
                        />
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* TWO FACTOR AUTHENTICATION FOR HIGH VALUE PURCHASES */}
              {isHighValue ? (
                <div className="mt-8 rounded-2xl border border-warn/40 bg-gradient-to-b from-warn/[0.08] to-transparent p-5">
                  <div className="flex items-center gap-2 font-display text-[15px] font-extrabold text-warn">
                    <ShieldAlert size={18} />
                    2FA Saugumo Patikra (Didelės vertės užsakymas &gt; 20€)
                  </div>
                  <p className="mt-1 text-[13px] text-muted">
                    Siekiant apsaugoti nuo sukčiavimo ir neteisėtų lėšų, didelės vertės užsakymams būtinas 6 skaitmenų 2FA kodas.
                  </p>

                  {twoFactorVerified ? (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-live/15 p-3 text-[13.5px] font-bold text-live">
                      <Check size={16} strokeWidth={3} />
                      2FA sėkmingai patvirtinta! Galite tęsti užsakymą.
                    </div>
                  ) : !twoFactorRequested ? (
                    <button
                      type="button"
                      disabled={twoFactorBusy || !email}
                      onClick={handleRequest2FA}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-warn/60 bg-warn/20 px-4 py-2.5 font-display text-[13px] font-extrabold text-warn hover:bg-warn/30"
                    >
                      {twoFactorBusy ? "Siunčiama..." : "Gauti 2FA kodą į nurodytą el. paštą"}
                    </button>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={twoFactorCodeInput}
                          onChange={(e) => setTwoFactorCodeInput(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="6 skaitmenų kodas"
                          className="w-44 rounded-xl border border-warn/40 bg-void px-3.5 py-2 font-mono text-[16px] text-center font-bold tracking-widest outline-none focus:border-warn"
                        />
                        <button
                          type="button"
                          disabled={twoFactorBusy || twoFactorCodeInput.length !== 6}
                          onClick={handleVerify2FA}
                          className="rounded-xl bg-warn px-5 py-2 font-display text-[13.5px] font-extrabold text-black hover:opacity-90 disabled:opacity-40"
                        >
                          {twoFactorBusy ? "Tikrinama..." : "Patvirtinti 2FA"}
                        </button>
                      </div>

                      {twoFactorDevHint ? (
                        <div className="text-[12px] text-muted">
                          (Demo kodas: <strong className="font-mono text-live">{twoFactorDevHint}</strong>)
                        </div>
                      ) : null}

                      {twoFactorError ? (
                        <p className="text-[12.5px] text-red-400">{twoFactorError}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}

              {error ? (
                <p className="mt-4 text-[13.5px] text-warn">{error}</p>
              ) : null}

              <MagneticButton className="w-full mt-7" strength={0.25}>
                <button
                  type="submit"
                  disabled={busy || !sessionKey || (isHighValue && !twoFactorVerified)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-display text-[15px] font-extrabold transition-all shadow-lg ${
                    isHighValue && !twoFactorVerified
                      ? "bg-white/20 text-muted cursor-not-allowed"
                      : "bg-white text-void hover:scale-[1.015] hover:shadow-signal/25"
                  } disabled:opacity-60`}
                >
                  {busy ? "Kuriama…" : isHighValue && !twoFactorVerified ? "Pirmiausia patvirtinkite 2FA" : "Tęsti į apmokėjimą"}
                  <ArrowRight size={16} strokeWidth={2.6} />
                </button>
              </MagneticButton>
            </form>
          ) : null}

          {/* 2 — APMOKĖJIMAS */}
          {step === 1 && order ? (
            <div className="mt-8">
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white/[0.04]">
                  {(() => {
                    const Icon = METHOD_ICONS[method.id];
                    return <Icon size={30} className="text-signal" />;
                  })()}
                </span>
                <div className="micro mt-5 text-signal">
                  Laukiama apmokėjimo
                </div>
                <h2 className="mt-2 display text-[clamp(1.7rem,4.2vw,2.4rem)]">
                  Apmokėk: {method.label}
                </h2>
                <p className="mt-3 max-w-[48ch] text-[14px] leading-relaxed text-muted">
                  Siųsk tiksliai{" "}
                  <span className="num text-ink">{eur(total)}€</span> nurodytais
                  duomenimis. Patvirtinęs mokėjimą, prekę ir sąskaitą atsiųsime į{" "}
                  <span className="text-ink">{order.email}</span>.
                </p>
              </div>

              <div className="mt-7 flex items-center justify-between rounded-xl border border-line bg-void px-4 py-3.5">
                <span className="micro text-muted/70">Užsakymo numeris</span>
                <span className="num text-[16px] font-bold text-warn">
                  #{order.code}
                </span>
              </div>

              {/* CRYPTO AUTO-DETECTOR TOGGLE (if method is LTC or user wants crypto rate) */}
              {method.id === "ltc" ? (
                <div className="mt-4 rounded-xl border border-signal/40 bg-gradient-to-r from-signal/[0.08] to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <span className="micro flex items-center gap-1.5 text-signal font-bold">
                      <Bitcoin size={15} />
                      {t.cryptoAutoDetect}
                    </span>
                    <div className="flex gap-1 rounded-lg border border-line bg-void p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setCryptoCurrency("LTC")}
                        className={`px-2 py-0.5 rounded font-bold ${cryptoCurrency === "LTC" ? "bg-signal text-void" : "text-muted"}`}
                      >
                        LTC
                      </button>
                      <button
                        type="button"
                        onClick={() => setCryptoCurrency("USDT")}
                        className={`px-2 py-0.5 rounded font-bold ${cryptoCurrency === "USDT" ? "bg-signal text-void" : "text-muted"}`}
                      >
                        USDT
                      </button>
                    </div>
                  </div>

                  {calculatedCrypto ? (
                    <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5">
                      <div>
                        <div className="text-[12px] text-muted">Realaus laiko suma tinkle:</div>
                        <div className="num text-[18px] font-extrabold text-live">
                          {calculatedCrypto.amount} {calculatedCrypto.currency}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-muted/70">
                        1 {calculatedCrypto.currency} ≈ {calculatedCrypto.rateEur}€
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[12px] text-muted">Skaičiuojamas realaus laiko kursas...</div>
                  )}
                </div>
              ) : null}

              <div className="mt-3 space-y-3">
                {method.rows.map((row) => (
                  <CopyField
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    display={row.value}
                  />
                ))}
                <CopyField
                  label={t.exactAmount}
                  value={(total / 100).toFixed(2)}
                  display={`${eur(total)}€`}
                />
              </div>

              <p className="mt-4 flex items-start gap-3 rounded-xl border border-signal/30 bg-signal/[0.07] px-4 py-3.5 text-[13.5px] leading-relaxed text-ink/90">
                <BadgeCheck size={17} className="mt-0.5 shrink-0 text-signal" />
                <span>{method.note}</span>
              </p>

              <p className="mt-3 flex items-start gap-3 rounded-xl border border-red-400/35 bg-red-400/[0.08] px-4 py-3.5 text-[13.5px] leading-relaxed text-red-300">
                <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                <span>
                  <strong>Be grąžinimo.</strong> {NO_REFUND_WARNING}
                </span>
              </p>

              {/* ── ĮRODYMAS ── */}
              <div className="mt-6 rounded-xl border border-line bg-void p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="micro text-signal">
                    3 · {t.uploadProofTitle}
                  </div>
                  {proof ? (
                    <span className="micro rounded-full bg-live/15 px-2.5 py-1 text-live font-bold">
                      Pridėta
                    </span>
                  ) : (
                    <span className="micro rounded-full bg-warn/15 px-2.5 py-1 text-warn font-bold">
                      Privaloma
                    </span>
                  )}
                </div>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
                  {PROOF_NOTE}
                </p>

                {proof ? (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-live/30 bg-live/[0.08] px-4 py-3">
                    <Check size={17} className="shrink-0 text-live" />
                    <span className="num min-w-0 flex-1 truncate text-[13.5px]">
                      {proof.filename}
                    </span>
                    <span className="num text-[12px] text-muted">
                      {(proof.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => setProof(null)}
                      aria-label="Pašalinti įrodymą"
                      className="text-muted transition-colors hover:text-warn"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line px-4 py-4 transition-colors hover:border-signal/50">
                      <Upload size={18} className="shrink-0 text-signal" />
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-muted">
                        {file
                          ? file.name
                          : "Pasirink ekrano nuotrauką (PNG, JPG, WEBP, PDF · maks. 8 MB)"}
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] ?? null);
                          setError("");
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={!file || uploading}
                      onClick={uploadProof}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-signal/40 bg-signal/10 py-3 font-display text-[14px] font-extrabold text-signal transition-transform hover:-translate-y-px disabled:opacity-50"
                    >
                      <Paperclip size={15} strokeWidth={2.4} />
                      {uploading ? "Siunčiama…" : "Pridėti įrodymą"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-xl border border-signal/30 bg-signal/[0.07] px-4 py-3.5">
                <span className="live-dot h-2.5 w-2.5 shrink-0 rounded-full bg-signal" />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[14.5px] font-extrabold">
                    {acked ? "Mokėjimas pateiktas" : "Laukiama apmokėjimo"}
                  </div>
                  <div className="text-[12.5px] text-muted">
                    {acked
                      ? "Administratorius patvirtins mokėjimą rankiniu būdu"
                      : "Įkelk įrodymą ir patvirtink apačioje"}
                  </div>
                </div>
                <span
                  className={`micro rounded-full px-2.5 py-1 ${
                    acked ? "bg-warn/15 text-warn" : "bg-live/15 text-live"
                  }`}
                >
                  {acked ? "Tikrinama" : "Live"}
                </span>
              </div>

              {error ? (
                <p className="mt-4 text-[13.5px] text-warn">{error}</p>
              ) : null}

              <MagneticButton className="w-full mt-6" strength={0.25}>
                <button
                  type="button"
                  onClick={ackPayment}
                  disabled={busy || !proof}
                  title={proof ? undefined : PROOF_REQUIRED}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-display text-[15px] font-extrabold transition-all ${
                    proof
                      ? "bg-white text-void hover:scale-[1.015] shadow-lg hover:shadow-signal/25"
                      : "cursor-not-allowed bg-white/20 text-void/60"
                  } disabled:opacity-60`}
                >
                  <Check size={17} strokeWidth={3} />
                  {busy
                    ? "Tikrinama…"
                    : proof
                      ? t.confirmSentBtn
                      : "Pirmiausia pridėk įrodymą"}
                </button>
              </MagneticButton>

              <button
                type="button"
                onClick={() => setStep(0)}
                className="mx-auto mt-5 flex items-center gap-2 text-[13.5px] text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft size={14} />
                Keisti mokėjimo būdą
              </button>
            </div>
          ) : null}

          {/* 3 — PRISTATYMAS */}
          {step === 2 && order ? (
            <div className="mt-8">
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-live/15">
                  <Check size={30} strokeWidth={3} className="text-live" />
                </span>
                <div className="micro mt-5 text-live">Įrodymas gautas</div>
                <h2 className="mt-2 display text-[clamp(1.8rem,4.4vw,2.6rem)]">
                  Ačiū! Tikriname mokėjimą
                </h2>
                <p className="mt-3 max-w-[50ch] text-[14px] leading-relaxed text-muted">
                  Užsakymas <span className="num text-ink">#{order.code}</span>{" "}
                  ir tavo įrodymas jau pas mus. Mokėjimą patvirtiname rankiniu
                  būdu — atsiųsime prekę ir PDF sąskaitą į{" "}
                  <span className="text-ink">{order.email}</span> bei pateiksime tiesiai svetainėje.
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <CopyField
                  label="Užsakymo numeris"
                  value={order.code}
                  display={`#${order.code}`}
                />
                <CopyField
                  label="Bendra suma"
                  value={(total / 100).toFixed(2)}
                  display={`${eur(total)}€`}
                />
              </div>

              <div className="mt-3 flex items-start gap-3 rounded-xl border border-line bg-void px-4 py-4 text-[13.5px] leading-relaxed text-muted">
                <Timer size={17} className="mt-0.5 shrink-0 text-signal" />
                <span>
                  Patvirtinimas dažniausiai užtrunka iki 30 minučių. Jei per
                  tiek laiko negausi prekės — parašyk Discord ir nurodyk
                  užsakymo numerį.
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/paskyra"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-display text-[14.5px] font-extrabold text-void transition-transform hover:-translate-y-px"
                >
                  <Package size={16} strokeWidth={2.4} />
                  Mano užsakymai
                </Link>
                <a
                  href={DISCORD}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] py-3.5 text-[14.5px] transition-colors hover:border-white/25"
                >
                  <MessageCircle size={16} strokeWidth={2.2} />
                  Discord kanalas
                </a>
              </div>

              <Link
                href="/produktai"
                className="mx-auto mt-6 flex w-fit items-center gap-2 text-[13.5px] text-muted transition-colors hover:text-ink"
              >
                Grįžti į kainoraštį
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
