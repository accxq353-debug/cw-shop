import type { Product } from "@/data/catalog";

/**
 * Brand poster used on tiles and product pages: a lit sign in the dark —
 * brand-tinted gradient, oversized wordmark, corner ribbon, faint watermark.
 */
export default function ProductArt({
  product,
  className = "",
  size = "md",
}: {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const typeSize =
    size === "lg"
      ? "text-[clamp(2.4rem,6vw,4.6rem)]"
      : size === "sm"
        ? "text-[1.35rem]"
        : "text-[clamp(1.9rem,3.4vw,2.9rem)]";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: "#05060b",
        backgroundImage: `radial-gradient(75% 65% at 26% 18%, ${product.accent}59 0%, transparent 62%), radial-gradient(85% 80% at 88% 108%, ${product.accent2}66 0%, transparent 60%), linear-gradient(155deg, ${product.accent2}33 0%, #070912 58%, #05060b 100%)`,
      }}
    >
      <span className="ribbon">CW-SHOP</span>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-80"
      >
        <defs>
          <linearGradient id={`sw-${product.slug}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={product.accent} stopOpacity="0" />
            <stop offset="45%" stopColor={product.accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={product.accent2} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M-20 200 C 90 130, 240 150, 420 60"
          fill="none"
          stroke={`url(#sw-${product.slug})`}
          strokeWidth="2.5"
        />
        <path
          d="M-20 232 C 110 168, 260 186, 420 108"
          fill="none"
          stroke={`url(#sw-${product.slug})`}
          strokeWidth="1"
        />
      </svg>

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="max-w-[72%]">
          <div
            className="micro"
            style={{ color: product.accent, mixBlendMode: "screen" }}
          >
            {product.kind}
          </div>
          <div
            className={`display mt-2 uppercase leading-[0.88] ${typeSize}`}
            style={{
              color: "#f4f7ff",
              textShadow: `0 0 44px ${product.accent}77`,
            }}
          >
            {product.brand}
          </div>
        </div>
        <div className="num text-[10px] tracking-[0.24em] text-white/25">
          cw-shop
        </div>
      </div>
    </div>
  );
}
