import type { Product } from "@/data/catalog";

export default function ProductArt({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const brand = (product.brand || product.name || "CW").trim();
  const slug = product.slug || "item";

  // Deterministic icon/badge representation matching the dark metallic 3D squircle aesthetic from the reference
  return (
    <div
      className={`relative flex items-center justify-between overflow-hidden bg-gradient-to-r from-[#0c0d11] via-[#101217] to-[#0e1014] p-5 select-none ${className}`}
    >
      {/* Background radial gradient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: product.accent || "#b78bff" }}
      />

      {/* Left side: Hollow stylish brand outline wordmark */}
      <div className="relative z-10 max-w-[58%] flex flex-col justify-center">
        <span
          className="font-display text-[26px] sm:text-[30px] font-black tracking-tight uppercase leading-[0.9] text-transparent"
          style={{
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.45)",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))",
          }}
        >
          {brand}
        </span>
        <span className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted/60">
          {product.kind}
        </span>
      </div>

      {/* Right side: 3D Dark Metallic Squircle Pill matching the reference screenshot */}
      <div className="relative z-10 flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-[26px] bg-gradient-to-b from-[#3a3d45] via-[#1f2127] to-[#121317] p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.8)] border border-white/10 group-hover:scale-105 transition-transform duration-300">
        <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-gradient-to-b from-[#2a2c33] via-[#17181c] to-[#0f1013] border border-white/5 shadow-inner">
          {renderBrandGlyph(slug, brand)}
        </div>
      </div>
    </div>
  );
}

function renderBrandGlyph(slug: string, brand: string) {
  const s = slug.toLowerCase();
  const b = brand.toLowerCase();

  // Netflix N
  if (s.includes("netflix") || b.includes("netflix")) {
    return (
      <svg viewBox="0 0 48 64" className="h-14 w-11 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
        <defs>
          <linearGradient id="nf-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>
        </defs>
        <path d="M6 4h10v56H6z" fill="#9ca3af" />
        <path d="M32 4h10v56H32z" fill="#9ca3af" />
        <path d="M6 4h10l20 56H26z" fill="url(#nf-grad)" />
      </svg>
    );
  }

  // YouTube Play Button
  if (s.includes("youtube") || b.includes("youtube")) {
    return (
      <svg viewBox="0 0 64 48" className="h-10 w-14 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
        <rect x="2" y="2" width="60" height="44" rx="14" fill="#2d3038" stroke="#9ca3af" strokeWidth="2.5" />
        <path d="M25 15l18 9-18 9z" fill="#f3f4f6" />
      </svg>
    );
  }

  // Spotify Soundwaves / Circle
  if (s.includes("spotify") || b.includes("spotify")) {
    return (
      <svg viewBox="0 0 64 64" className="h-13 w-13 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
        <circle cx="32" cy="32" r="28" fill="#23252b" stroke="#9ca3af" strokeWidth="2.5" />
        <path d="M19 25c9-2.5 19-1.5 26 2.5" stroke="#f3f4f6" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M21 33c7-2 15-1.2 21 2" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M23 40c6-1.5 12-.8 17 1.8" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  // Crunchyroll
  if (s.includes("crunchyroll") || b.includes("crunchyroll")) {
    return (
      <svg viewBox="0 0 64 64" className="h-13 w-13 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
        <circle cx="32" cy="32" r="24" fill="#23252b" stroke="#9ca3af" strokeWidth="2" />
        <circle cx="28" cy="28" r="14" fill="#e5e7eb" />
        <circle cx="28" cy="28" r="8" fill="#17181c" />
      </svg>
    );
  }

  // CapCut / Scissor loop
  if (s.includes("capcut") || b.includes("capcut")) {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
        <path d="M16 16l32 32M48 16l-32 32" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />
        <rect x="20" y="24" width="24" height="16" rx="4" fill="#17181c" stroke="#9ca3af" strokeWidth="2" />
      </svg>
    );
  }

  // Disney+ / Plus
  if (s.includes("disney") || b.includes("disney") || s.includes("hbo")) {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
        <text x="24" y="44" fontFamily="serif" fontSize="36" fontStyle="italic" fontWeight="bold" fill="#f3f4f6">D</text>
        <path d="M42 24v16M34 32h16" stroke="#c084fc" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Default Bold 3D Monogram
  const letters = brand.slice(0, 2).toUpperCase();
  return (
    <span
      className="font-display text-[26px] font-black tracking-wider text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
    >
      {letters}
    </span>
  );
}
