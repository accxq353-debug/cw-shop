/**
 * Cw-Shop logo — crown over "CW", chrome "SHOP", "By Westukass" signature.
 * Hand-built vector so it stays crisp at 30px and at 400px.
 */
export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.73}
      viewBox="0 0 260 190"
      fill="none"
      role="img"
      aria-label="Cw-Shop"
    >
      <defs>
        <linearGradient id="cw-purple" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="35%" stopColor="#C084FC" />
          <stop offset="70%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="cw-crown" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#F3E8FF" />
          <stop offset="55%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient id="cw-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="42%" stopColor="#F4F0FF" />
          <stop offset="52%" stopColor="#B9AED6" />
          <stop offset="62%" stopColor="#F7F4FF" />
          <stop offset="100%" stopColor="#CFC6E8" />
        </linearGradient>
      </defs>

      {/* crown */}
      <g transform="translate(30 2)">
        <path
          d="M8 44 L0 12 L18 26 L32 2 L46 26 L64 12 L56 44 Z"
          fill="url(#cw-crown)"
          stroke="#2E1065"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="10" r="4.5" fill="#E9D5FF" stroke="#2E1065" strokeWidth="2" />
        <circle cx="32" cy="0" r="4.5" fill="#E9D5FF" stroke="#2E1065" strokeWidth="2" />
        <circle cx="64" cy="10" r="4.5" fill="#E9D5FF" stroke="#2E1065" strokeWidth="2" />
      </g>

      {/* CW */}
      <text
        x="18"
        y="104"
        fontFamily="var(--font-display)"
        fontSize="82"
        fontWeight="900"
        letterSpacing="-2"
        fill="url(#cw-purple)"
        stroke="#2E1065"
        strokeWidth="3"
        paintOrder="stroke"
      >
        CW
      </text>

      {/* SHOP */}
      <text
        x="14"
        y="162"
        fontFamily="var(--font-display)"
        fontSize="70"
        fontWeight="900"
        letterSpacing="2"
        fill="url(#cw-chrome)"
        stroke="#2E1065"
        strokeWidth="3"
        paintOrder="stroke"
      >
        SHOP
      </text>

      {/* By Westukass */}
      <text
        x="248"
        y="187"
        textAnchor="end"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="26"
        fill="#C084FC"
      >
        By Westukass
      </text>
    </svg>
  );
}

export default function Logo({ size = 44 }: { size?: number }) {
  return <LogoMark size={size} />;
}
