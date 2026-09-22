"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import Logo from "@/components/Logo";
import { categories, products, totalVariants } from "@/data/catalog";
import { useLanguage } from "@/lib/language";
import { DISCORD_INVITE, SHOP_NAME } from "@/lib/shop";

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 mt-24 border-t border-line bg-void-2">
      <div className="mx-auto max-w-[1180px] px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size={132} />
            <p className="mt-5 max-w-[42ch] text-[14px] leading-relaxed text-muted">
              {t.footerDesc} {products.length} {t.items}, {totalVariants()} {t.variantsInCatalog}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-display text-[13px] font-extrabold text-void transition-transform hover:-translate-y-px"
              >
                <MessageCircle size={15} strokeWidth={2.4} />
                {t.discordServer}
              </a>
              <Link
                href="/duk"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors hover:text-ink"
              >
                PayPal F&F · Bank · LTC
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div>
            <div className="micro text-muted/70">{t.categoriesLabel}</div>
            <ul className="mt-4 space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/produktai?kat=${c.id}`}
                    className="text-[14px] text-muted transition-colors hover:text-ink"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="micro text-muted/70">{t.footerInfo}</div>
            <ul className="mt-4 space-y-2.5 text-[14px] text-muted">
              <li>
                <Link href="/duk" className="transition-colors hover:text-ink">
                  {t.faq}
                </Link>
              </li>
              <li>
                <Link
                  href="/atsiliepimai"
                  className="transition-colors hover:text-ink"
                >
                  {t.reviews}
                </Link>
              </li>
              <li>
                <Link
                  href="/paskyra"
                  className="transition-colors hover:text-ink"
                >
                  {t.account}
                </Link>
              </li>
              <li>
                <Link
                  href="/uzsakymai"
                  className="transition-colors hover:text-ink"
                >
                  {t.myOrdersBtn}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition-colors hover:text-ink">
                  {t.adminDashboardBtn}
                </Link>
              </li>
              <li className="flex items-center gap-2 pt-2 text-[13px]">
                <ShieldCheck size={15} className="text-live" />
                {t.warrantyLabel}: {t.fullPeriod}
              </li>
              <li className="flex items-center gap-2 text-[13px]">
                <Zap size={15} className="text-warn" />
                {t.deliveryLabel}: 1–30 min.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[12.5px] text-muted/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SHOP_NAME} · {t.footerCopy}
          </p>
          <p className="num">
            {t.footerPaymentDisclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
