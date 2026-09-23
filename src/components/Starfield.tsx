"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; a: number; d: number };

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let stars: Star[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(260, Math.floor((width * height) / 7000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.25,
        a: Math.random() * 0.6 + 0.15,
        d: Math.random() * 0.5 + 0.1,
      }));
    };

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.006;
      for (const s of stars) {
        const twinkle = reduced ? 1 : 0.65 + Math.sin(t * 4 + s.x) * 0.35;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 228, 255, ${(s.a * twinkle).toFixed(3)})`;
        ctx.fill();
      }
      if (!reduced) {
        for (const s of stars) {
          s.y += s.d * 0.12;
          if (s.y > height) s.y = -2;
        }
        raf = requestAnimationFrame(draw);
      }
    };

    seed();
    draw();
    const onResize = () => {
      cancelAnimationFrame(raf);
      seed();
      draw();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
