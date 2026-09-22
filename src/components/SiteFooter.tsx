import Link from "next/link";
import { ArrowUpRight, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import Logo from "@/components/Logo";
import { categories, products, totalVariants } from "@/data/catalog";

const DISCORD = "https://discord.gg/asMCPaCKk";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-line bg-void-2">
      <div className="mx-auto max-w-[1180px] px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size={132} />
            <p className="mt-5 max-w-[42ch] text-[14px] leading-relaxed text-muted">
              Skaitmeninės prekės nuo 2026 metų: prenumeratos, žaidimai, SMM ir
              VPN. {products.length} prekės, {totalVariants()} variantai,
              pristatymas per kelias minutes į el. paštą arba Discord.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={DISCORD}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-display text-[13px] font-extrabold text-void transition-transform hover:-translate-y-px"
              >
                <MessageCircle size={15} strokeWidth={2.4} />
                Discord serveris
              </a>
              <Link
                href="/duk"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors hover:text-ink"
              >
                Mokėjimas: PayPal F&F · Bankas · LTC
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div>
            <div className="micro text-muted/70">Kategorijos</div>
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
            <div className="micro text-muted/70">Informacija</div>
            <ul className="mt-4 space-y-2.5 text-[14px] text-muted">
              <li>
                <Link href="/duk" className="transition-colors hover:text-ink">
                  DUK
                </Link>
              </li>
              <li>
                <Link
                  href="/atsiliepimai"
                  className="transition-colors hover:text-ink"
                >
                  Atsiliepimai
                </Link>
              </li>
              <li>
                <Link
                  href="/paskyra"
                  className="transition-colors hover:text-ink"
                >
                  Mano paskyra
                </Link>
              </li>
              <li>
                <Link
                  href="/uzsakymai"
                  className="transition-colors hover:text-ink"
                >
                  Mano užsakymai
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition-colors hover:text-ink">
                  Administravimas
                </Link>
              </li>
              <li className="flex items-center gap-2 pt-2 text-[13px]">
                <ShieldCheck size={15} className="text-live" />
                Garantija visam laikotarpiui
              </li>
              <li className="flex items-center gap-2 text-[13px]">
                <Zap size={15} className="text-warn" />
                Pristatymas 1–30 min.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[12.5px] text-muted/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Cw-Shop · cw-shop —
            skaitmeninės prekės. Nesusiję su Netflix, Spotify, Discord ar kitais
            prekės ženklais.
          </p>
          <p className="num">
            PayPal F&amp;F · Banko pavedimas · Litecoin · be PVM
          </p>
        </div>
      </div>
    </footer>
  );
}
