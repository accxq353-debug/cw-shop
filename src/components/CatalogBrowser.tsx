"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import PriceRow from "@/components/PriceRow";
import {
  categories,
  products,
  type CategoryId,
  totalVariants,
} from "@/data/catalog";

type Filter = CategoryId | "visi";

export default function CatalogBrowser({ initialCat }: { initialCat?: string }) {
  const valid = categories.some((c) => c.id === initialCat);
  const [filter, setFilter] = useState<Filter>(
    valid ? (initialCat as CategoryId) : "visi",
  );
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { visi: products.length };
    for (const c of categories) {
      map[c.id] = products.filter((p) => p.category === c.id).length;
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = filter === "visi" || p.category === filter;
      const qOk =
        !q ||
        [p.name, p.brand, p.tagline, p.description, p.kind]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return catOk && qOk;
    });
  }, [filter, query]);

  const groups = categories
    .map((c) => ({
      category: c,
      items: filtered.filter((p) => p.category === c.id),
    }))
    .filter((g) => g.items.length > 0);

  const activeCategory =
    filter === "visi" ? null : categories.find((c) => c.id === filter) ?? null;

  return (
    <div className="grid gap-10 lg:grid-cols-[228px_minmax(0,1fr)]">
      {/* sticky ledger rail */}
      <aside className="lg:sticky lg:top-28 lg:h-fit">
        <div className="micro text-muted/70">Kategorijos</div>
        <ul className="mt-4 space-y-1">
          {(["visi", ...categories.map((c) => c.id)] as Filter[]).map((id) => {
            const label =
              id === "visi"
                ? "Visos prekės"
                : categories.find((c) => c.id === id)?.title ?? id;
            const active = filter === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border-l-2 px-3 py-2.5 text-left text-[14px] transition-colors ${
                    active
                      ? "border-signal bg-white/[0.05] text-ink"
                      : "border-transparent text-muted hover:bg-white/[0.02] hover:text-ink"
                  }`}
                >
                  <span
                    className={
                      active ? "font-display font-extrabold" : undefined
                    }
                  >
                    {label}
                  </span>
                  <span className="num text-[11.5px] text-muted/60">
                    {counts[id] ?? 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 rounded-xl border border-line bg-panel p-4">
          <div className="micro text-muted/70">Iš viso</div>
          <div className="num mt-2 text-[22px] font-bold text-signal">
            {totalVariants()}
          </div>
          <div className="mt-1 text-[12.5px] text-muted">variantų kainoraštyje</div>
        </div>
      </aside>

      <div>
        {activeCategory ? (
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-line">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `url(${activeCategory.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, #05060b 22%, rgba(5,6,11,0.7) 60%, rgba(5,6,11,0.35) 100%)",
              }}
            />
            <div className="relative px-7 py-9">
              <div className="micro text-signal">{activeCategory.kicker}</div>
              <h2 className="display mt-2 text-[clamp(1.8rem,4vw,2.6rem)]">
                {activeCategory.title}
              </h2>
              <p className="mt-3 max-w-[56ch] text-[14px] leading-relaxed text-muted">
                {activeCategory.blurb}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4">
          <Search size={17} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtruoti kainoraštį: Netflix, Codex, boosts, VPN…"
            className="w-full bg-transparent py-3.5 text-[14.5px] outline-none placeholder:text-muted/60"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Išvalyti"
              className="text-muted hover:text-ink"
            >
              <X size={16} />
            </button>
          ) : (
            <span className="num shrink-0 text-[12px] text-muted/60">
              {filtered.length} / {products.length}
            </span>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
            <div className="font-display text-[18px] font-extrabold">
              Nieko neradome
            </div>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-muted">
              Pabandyk kitą žodį arba parašyk Discord — greičiausiai turime ir
              tai, ko nėra kainoraštyje.
            </p>
          </div>
        ) : null}

        {groups.map((group) => (
          <section key={group.category.id} className="mt-12">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
              <div>
                <div className="micro text-signal">{group.category.kicker}</div>
                <h2 className="mt-1.5 font-display text-[26px] font-extrabold tracking-[-0.02em]">
                  {group.category.title}
                </h2>
              </div>
              <span className="num text-[12px] text-muted/70">
                {group.items.length} prekės
              </span>
            </div>
            <div className="mt-1">
              {group.items.map((p) => (
                <PriceRow key={p.slug} product={p} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
