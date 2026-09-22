export default function Monogram({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dtg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="55%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#dtg)" />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="13.25"
        stroke="#ffffff"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
      {/* D */}
      <path
        d="M11 13.5h7.4c5.5 0 9.6 4.1 9.6 9.5s-4.1 9.5-9.6 9.5H11V13.5Zm5 4.6v9.8h2.2c2.9 0 4.8-1.9 4.8-4.9s-1.9-4.9-4.8-4.9H16Z"
        fill="#05060B"
        fillRule="evenodd"
      />
      {/* T */}
      <path
        d="M29.4 13.5H40v4.4h-2.2c-.5 3.1-1.2 7-1.6 10.3-.2 1.6-.6 3.2-1.4 3.3-.9.1-1-1.4-1.2-2.8-.3-2.6-.6-6.3-.8-8.7h-3.4v-6.5Z"
        fill="#05060B"
      />
    </svg>
  );
}
