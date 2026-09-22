"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, X, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PriceRow from "@/components/PriceRow";
import ProductTile from "@/components/ProductTile";
import SpotlightGrid from "@/components/SpotlightGrid";
import SkeletonGrid from "@/components/SkeletonGrid";
import {
  categories,
  products as defaultStaticProducts,
  type CategoryId,
  type Product,
} from "@/data/catalog";
import { playSound } from "@/lib/audio";
import { useLanguage } from "@/lib/language";

type Filter = CategoryId | "visi";

export default function CatalogBrowser({
  initialCat,
  initialProducts,
}: {
  initialCat?: string;
  initialProducts?: Product[];
}) {
  const allList = initialProducts && initialProducts.length > 0 ? initialProducts : defaultStaticProducts;
  const valid = categories.some((c) => c.id === initialCat);
  const [filter, setFilter] = useState<Filter>(
    valid ? (initialCat as CategoryId) : "visi",
  );
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isLoading, setIsLoading] = useState(false);
  const { t, lang } = useLanguage();

  const counts = useMemo(() => {
    const map: Record<string, number> = { visi: allList.length };
    for (const c of categories) {
      map[c.id] = allList.filter((p) => p.category === c.id).length;
    }
    return map;
  }, [allList]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allList.filter((p) => {
      const catOk = filter === "visi" || p.category === filter;
      const qOk =
        !q ||
        [p.name, p.brand, p.tagline, p.description, p.kind]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return catOk && qOk;
    });
  }, [allList, filter, query]);

  const activeCategory =
    filter === "visi" ? null : categories.find((c) => c.id === filter) ?? null;

  const handleFilterChange = (newFilter: Filter) => {
    setFilter(newFilter);
    playSound("switch");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Sleek Vertical Category Navigation Bar */}
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-2xl border border-[#1b1d24] bg-[#0c0d12]/90 p-3.5 shadow-xl">
          <div className="micro px-2.5 py-1 text-muted/60">{t.categoriesLabel}</div>
          <ul className="mt-2 space-y-1">
            {(["visi", ...categories.map((c) => c.id)] as Filter[]).map((id) => {
              const label =
                id === "visi"
                  ? t.allCategories
                  : categories.find((c) => c.id === id)?.title ?? id;
              const active = filter === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => handleFilterChange(id)}
                    onMouseEnter={() => playSound("hover")}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-all ${
                      active
                        ? "bg-white/[0.08] text-white font-extrabold border-l-2 border-signal shadow-sm"
                        : "text-muted hover:bg-white/[0.03] hover:text-ink"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    <span className="num text-[11px] text-muted/50 rounded bg-white/[0.04] px-1.5 py-0.5">
                      {counts[id] ?? 0}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Main Products Grid & Search Bar */}
      <div>
        {/* Top Search & Layout Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 min-w-[260px] items-center gap-3 rounded-2xl border border-[#1f222a] bg-[#0c0d12] px-4 py-1 shadow-inner focus-within:border-signal/50">
            <Search size={16} className="text-muted/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent py-3 text-[14px] text-white outline-none placeholder:text-muted/50"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  playSound("pop");
                }}
                aria-label="Išvalyti"
                className="text-muted hover:text-white"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="num text-[11px] text-muted/50 whitespace-nowrap">
                ⌘K
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="num text-[12px] text-muted/60 mr-2">
              {filtered.length} {t.items}
            </span>

            <div className="flex rounded-xl border border-[#1f222a] bg-[#0c0d12] p-1">
              <button
                type="button"
                onClick={() => {
                  setViewMode("grid");
                  playSound("switch");
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white/[0.1] text-white" : "text-muted hover:text-white"
                }`}
                title="Tinklelis"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("table");
                  playSound("switch");
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-white/[0.1] text-white" : "text-muted hover:text-white"
                }`}
                title="Sąrašas"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 flex items-baseline justify-between border-b border-[#1b1d24] pb-3">
          <h2 className="font-display text-[24px] font-black tracking-tight text-white">
            {activeCategory ? activeCategory.title : (lang === "en" ? "All Products" : "Visos Prekės")}
          </h2>
          <span className="num text-[12.5px] text-muted/60">
            {filtered.length} {lang === "en" ? "products in stock" : "prekės sandėlyje"}
          </span>
        </div>

        {/* Zero State or Product Grid/Table with Smooth FLIP filtering & Cursor Spotlight */}
        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-[#222530] px-6 py-20 text-center">
            <div className="font-display text-[20px] font-extrabold text-white">
              Nieko neradome
            </div>
            <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-muted">
              Pabandykite ieškoti kito pavadinimo arba peržiūrėkite kitas kategorijas.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <SpotlightGrid className="rounded-3xl p-1">
            {/* Smooth FLIP Layout Transition Container */}
            <motion.div
              layout
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((p) => (
                  <motion.div
                    key={p.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full"
                  >
                    <ProductTile product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </SpotlightGrid>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-panel/70">
            <motion.div layout>
              {filtered.map((p) => (
                <PriceRow key={p.slug} product={p} />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
