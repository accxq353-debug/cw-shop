"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, MessageCircle } from "lucide-react";
import ProductTile from "@/components/ProductTile";
import PriceRow from "@/components/PriceRow";
import PriceTicker from "@/components/PriceTicker";
import ReviewWall from "@/components/ReviewWall";
import Faq from "@/components/Faq";
import Reveal from "@/components/Reveal";
import SecurityPipeline from "@/components/SecurityPipeline";
import DiscordVouchFeed from "@/components/DiscordVouchFeed";
import { useLanguage } from "@/lib/language";
import {
  categories,
  featuredProducts,
  products,
  totalVariants,
} from "@/data/catalog";
import { DISCORD_INVITE } from "@/lib/shop";

export default function HomePage() {
  const { t } = useLanguage();
  const featured = featuredProducts();
  const cheapest = [...products]
    .sort((a, b) => a.variants[0].priceCents - b.variants[0].priceCents)
    .slice(0, 6);

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden pb-24 pt-16 sm:pt-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.55]"
          style={{
            backgroundImage: "url(/images/hero-nebula.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            maskImage:
              "radial-gradient(80% 70% at 50% 30%, #000 20%, transparent 82%)",
            WebkitMaskImage:
              "radial-gradient(80% 70% at 50% 30%, #000 20%, transparent 82%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[-10%] -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, #A855F7 0%, #6D28D9 45%, transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-[1180px] px-4 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white/[0.04] px-4 py-2 text-[12.5px] text-muted backdrop-blur">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" />
              {t.estBadge} · {products.length} {t.items}
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="display mx-auto mt-7 max-w-[16ch] text-[clamp(2.9rem,8.6vw,5.4rem)]">
              <span className="block">{t.heroTitle1}</span>
              <span className="block bg-gradient-to-b from-white via-white/85 to-white/35 bg-clip-text text-transparent">
                {t.heroTitle2}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-[62ch] text-[15.5px] leading-relaxed text-muted">
              {t.heroDesc}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/produktai"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-display text-[15px] font-extrabold text-void transition-transform hover:-translate-y-0.5"
              >
                {t.viewProducts}
                <ArrowDown size={16} strokeWidth={2.8} />
              </Link>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-6 py-3.5 text-[15px] text-ink transition-colors hover:border-white/25"
              >
                <MessageCircle size={16} strokeWidth={2.2} />
                {t.discordServer}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="mx-auto mt-14 grid max-w-[820px] grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {[
                [t.statProducts, `${products.length}`],
                [t.statVariants, `${totalVariants()}`],
                [t.statDelivery, t.statDeliveryVal],
                [t.statPayment, t.statPaymentVal],
              ].map(([label, value]) => (
                <div key={label} className="bg-panel px-4 py-5">
                  <dt className="micro text-muted/70">{label}</dt>
                  <dd className="num mt-2 text-[17px] font-bold text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ───────────── SECURITY PIPELINE ───────────── */}
      <section className="mx-auto max-w-[1180px] px-4 pt-4">
        <Reveal>
          <SecurityPipeline />
        </Reveal>
      </section>

      {/* ───────────── PERKAMIAUSI ───────────── */}
      <section className="mx-auto max-w-[1180px] px-4 mt-24">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="micro text-signal">{t.bestsellersTitle}</div>
              <h2 className="display mt-2 text-[clamp(1.9rem,4.2vw,2.7rem)]">
                {t.bestsellersHeading}
              </h2>
            </div>
            <Link
              href="/produktai"
              className="hidden items-center gap-2 text-[14px] text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              {t.allCatalogLink}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <ProductTile product={p} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 flex justify-center">
            <Link
              href="/produktai"
              className="inline-flex items-center gap-2 rounded-xl bg-signal px-7 py-3.5 font-display text-[14px] font-extrabold uppercase tracking-[0.12em] text-void transition-transform hover:-translate-y-0.5"
            >
              {t.allProductsBtn}
              <ArrowDown size={16} strokeWidth={2.8} />
            </Link>
          </div>
        </Reveal>
      </section>

      <div className="mt-20">
        <PriceTicker />
      </div>

      {/* ───────────── KATALOGAS / KATEGORIJOS ───────────── */}
      <section className="mx-auto mt-20 max-w-[1180px] px-4">
        <Reveal>
          <div className="text-center">
            <h2 className="display text-[clamp(1.9rem,4.6vw,3rem)] uppercase tracking-[0.02em]">
              {t.catalogHeading}
            </h2>
            <p className="mt-3 text-[15px] text-muted">
              {t.catalogSubheading}
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((c, i) => {
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <Reveal key={c.id} delay={i * 0.06}>
                <Link
                  href={`/produktai?kat=${c.id}`}
                  className="group relative block h-[280px] overflow-hidden rounded-[18px] border border-line"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-45 transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${c.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(5,6,11,0.35) 0%, rgba(5,6,11,0.82) 55%, #05060b 100%)",
                    }}
                  />
                  <div className="relative flex h-full flex-col justify-end p-5">
                    <div className="micro text-signal">{c.kicker}</div>
                    <h3 className="mt-2 font-display text-[24px] font-extrabold tracking-[-0.02em]">
                      {c.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-muted">
                      {c.blurb}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="num text-[12px] text-muted/70">
                        {count} {t.items}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-display text-[13px] font-extrabold text-ink transition-transform group-hover:translate-x-0.5">
                        {t.view}
                        <ArrowUpRight size={15} strokeWidth={2.6} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ───────────── PIGIAUSIA KAINORAŠTIO JUOSTA ───────────── */}
      <section className="mx-auto mt-24 max-w-[1180px] px-4">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="micro text-signal">{t.cheapestTitle}</div>
              <h2 className="display mt-2 text-[clamp(1.9rem,4.2vw,2.7rem)]">
                {t.cheapestHeading}
              </h2>
            </div>
            <p className="hidden max-w-[34ch] text-[13.5px] text-muted sm:block">
              {t.cheapestSub}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-7 overflow-hidden rounded-2xl border border-line bg-panel/70">
            {cheapest.map((p) => (
              <PriceRow key={p.slug} product={p} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ───────────── KUO MES SKIRIAMĖS ───────────── */}
      <section className="mx-auto mt-24 max-w-[1180px] px-4">
        <Reveal>
          <div className="text-center">
            <h2 className="display text-[clamp(1.9rem,4.6vw,3rem)] uppercase tracking-[0.02em]">
              {t.whyUsHeading}
            </h2>
            <p className="mt-3 text-[15px] text-muted">
              {t.whyUsSub}
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {t.benefits.map((b, i) => (
            <Reveal key={b.n} delay={i * 0.06}>
              <article className="panel relative h-full overflow-hidden rounded-2xl p-7">
                <span
                  aria-hidden="true"
                  className="num absolute right-5 top-4 text-[54px] font-bold leading-none text-white/[0.05]"
                >
                  {b.n}
                </span>
                <div className="font-display text-signal text-[18px] font-black">
                  #{b.n}
                </div>
                <h3 className="mt-3 font-display text-[21px] font-extrabold tracking-[-0.02em]">
                  {b.title}
                </h3>
                <p className="mt-2.5 max-w-[46ch] text-[14px] leading-relaxed text-muted">
                  {b.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────── VERIFIED DISCORD VOUCHES FEED ───────────── */}
      <div className="mx-auto max-w-[1180px] px-4">
        <Reveal>
          <DiscordVouchFeed />
        </Reveal>
      </div>

      {/* ───────────── ATSILIEPIMAI ───────────── */}
      <section className="mx-auto mt-24 max-w-[1180px] px-4">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="micro text-signal">{t.reviews}</div>
              <h2 className="display mt-2 text-[clamp(1.9rem,4.2vw,2.7rem)]">
                {t.reviewsHeading}
              </h2>
            </div>
            <Link
              href="/atsiliepimai"
              className="hidden items-center gap-2 text-[14px] text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              {t.allReviewsLink}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>
        <div className="mt-8">
          <ReviewWall limit={3} />
        </div>
      </section>

      {/* ───────────── DUK + CTA ───────────── */}
      <section className="mx-auto mt-24 max-w-[1180px] px-4">
        <Reveal>
          <div className="text-center">
            <h2 className="display text-[clamp(1.9rem,4.6vw,3rem)] uppercase tracking-[0.02em]">
              {t.faqHeading}
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto mt-8 max-w-[880px]">
          <Faq limit={4} />
          <div className="mt-6 text-center">
            <Link
              href="/duk"
              className="inline-flex items-center gap-2 text-[14px] text-muted transition-colors hover:text-ink"
            >
              {t.allFaqLink}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <Reveal>
          <div className="relative mt-20 overflow-hidden rounded-[22px] border border-line bg-panel px-8 py-14 text-center">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[-60%] h-[380px] w-[620px] -translate-x-1/2 rounded-full opacity-45 blur-[110px]"
              style={{
                background:
                  "radial-gradient(circle, #C084FC 0%, #7C3AED 55%, transparent 72%)",
              }}
            />
            <div className="relative">
              <h2 className="display mx-auto max-w-[18ch] text-[clamp(1.8rem,4.4vw,2.8rem)]">
                {t.ctaHeading}
              </h2>
              <p className="mx-auto mt-4 max-w-[54ch] text-[15px] text-muted">
                {t.ctaSub}
              </p>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-display text-[15px] font-extrabold text-void transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle size={17} strokeWidth={2.4} />
                {t.discordServer}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
