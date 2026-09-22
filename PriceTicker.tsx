import { eur, priceFrom, products } from "@/data/catalog";

export default function PriceTicker() {
  const chips = products.map((p) => ({
    name: p.brand,
    price: `${eur(priceFrom(p))}€`,
  }));
  const doubled = [...chips, ...chips];

  return (
    <div
      className="relative overflow-hidden border-y border-line bg-void-2/60 py-4"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />
      <div className="ticker flex w-max gap-3">
        {doubled.map((c, i) => (
          <span
            key={`${c.name}-${i}`}
            className="inline-flex items-center gap-2.5 rounded-full border border-line bg-panel px-4 py-1.5"
          >
            <span className="font-display text-[12.5px] font-extrabold uppercase tracking-[0.04em]">
              {c.name}
            </span>
            <span className="num text-[12.5px] text-signal">nuo {c.price}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
