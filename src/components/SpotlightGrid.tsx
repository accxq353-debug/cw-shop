"use client";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";

export default function SpotlightGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: -1000, y: -1000, active: false });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setPos((prev) => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {/* Dynamic Cursor Spotlight Radial Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity: pos.active ? 1 : 0,
          background: `radial-gradient(650px circle at ${pos.x}px ${pos.y}px, rgba(192, 132, 252, 0.15), rgba(124, 58, 237, 0.05) 40%, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
