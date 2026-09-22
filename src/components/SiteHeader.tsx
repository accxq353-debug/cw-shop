"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Clapperboard,
  Gamepad2,
  Home,
  MessageCircle,
  Package,
  Search,
  ShoppingCart,
  Star,
  User as UserIcon,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useCart } from "@/lib/cart";
import { eur, priceFrom, products, totalVariants } from "@/data/catalog";

const NAV = [
  { href: "/", label: "Pradžia", icon: Home },
  { href: "/produktai?kat=zaidimai", label: "Žaidimai", icon: Gamepad2 },
  {
    href: "/produktai?kat=prenumeratos",
    label: "Prenumeratos",
    icon: Clapperboard,
  },
  { href: "/produktai", label: "Kainoraštis", icon: Package },
  { href: "/atsiliepimai", label: "Atsiliepimai", icon: MessageCircle },
  { href: "/duk", label: "DUK", icon: Star },
];

const DISCORD = "https://discord.gg/asMCPaCKk";

export default function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [bump, setBump] = useState(0);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  useEffect(() => {
    setBump((n) => n + 1);
  }, [count]);

  const isActive = (href: string) => {
    const [path, qs] = href.split("?");
    if (path === "/produktai") {
      if (qs) return pathname === "/produktai" && search.includes(qs);
      return pathname === "/produktai" && !search.includes("kat=");
    }
    return pathname === path && path !== "/";
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products
      .filter((p) =>
        [p.name, p.brand, p.tagline, p.kind].join(" ").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query]);

  return (
    <>
      <div className="relative z-40 border-b border-line bg-void-2/90">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2.5 text-center text-[12.5px] text-muted">
          <span className="inline-flex items-center gap-2">
            <MessageCircle size={14} className="shrink-0 text-signal" />
            Šiuo metu yra begalė užsakymų — atsiprašome, jei jūsų užsakymas
            vėluoja. Daugiau informacijos Discord serveryje.
          </span>
          <Link
            href={DISCORD}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1 font-display text-[12px] font-extrabold text-void transition-transform hover:-translate-y-px"
          >
            Spausk čia <ArrowUpRight size={13} strokeWidth={2.8} />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-3.5">
          <Link href="/" className="flex shrink-0 items-center">
            <Logo size={66} />
          </Link>

          <nav className="ml-1 hidden items-center gap-1 rounded-full border border-line bg-white/[0.03] p-1 lg:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] transition-colors ${
                    active
                      ? "bg-white font-semibold text-void"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={DISCORD}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-[13px] text-muted transition-colors hover:text-ink xl:inline-flex"
            >
              Discord serveris
            </a>

            <Link
              href="/paskyra"
              aria-label="Mano paskyra"
              className="hidden h-10 items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 text-[13px] text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              <UserIcon size={16} strokeWidth={2.1} />
              Paskyra
            </Link>

            <Link
              href="/krepselis"
              aria-label="Krepšelis"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/[0.03] text-ink transition-colors hover:border-white/25"
            >
              <ShoppingCart size={17} strokeWidth={2.1} />
              {ready && count > 0 ? (
                <span
                  key={bump}
                  className="num rise absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-signal px-1 text-[11px] font-bold text-void"
                >
                  {count}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              aria-label="Paieška"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/[0.03] text-ink transition-colors hover:border-white/25"
            >
              <Search size={17} strokeWidth={2.1} />
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden">
          {NAV.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] ${
                  active ? "bg-white font-semibold text-void" : "text-muted"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-void/85 px-4 pt-[12vh] backdrop-blur-md">
          <button
            type="button"
            aria-label="Uždaryti paiešką"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />
          <div className="panel relative w-full max-w-[620px] rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-void px-4">
              <Search size={17} className="text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ieškok: Netflix, Robux, SMM, VPN…"
                className="w-full bg-transparent py-3.5 text-[15px] outline-none placeholder:text-muted/60"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink"
                aria-label="Uždaryti"
              >
                <X size={17} />
              </button>
            </div>

            <div className="micro mt-4 px-1 text-muted/70">
              {query.trim()
                ? `Rezultatai · ${results.length}`
                : `Populiaru · ${totalVariants()} variantai`}
            </div>

            <ul className="mt-2 max-h-[46vh] overflow-y-auto">
              {results.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/produktai/${p.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.05]"
                  >
                    <span
                      className="h-9 w-9 shrink-0 rounded-lg"
                      style={{
                        backgroundImage: `radial-gradient(90% 90% at 25% 15%, ${p.accent}66 0%, transparent 65%), linear-gradient(155deg, ${p.accent2}55, #070912)`,
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[15px] font-extrabold">
                        {p.name}
                      </span>
                      <span className="block truncate text-[12.5px] text-muted">
                        {p.tagline}
                      </span>
                    </span>
                    <span className="num shrink-0 text-[13px] text-signal">
                      {eur(priceFrom(p))}€
                    </span>
                  </Link>
                </li>
              ))}
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-[14px] text-muted">
                  Nieko neradome. Parašyk Discord — greičiausiai turime.
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
