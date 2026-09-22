"use client";

import { useEffect, useState } from "react";
import { Wrench, Clock, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { DISCORD_INVITE, SHOP_NAME } from "@/lib/shop";

export default function MaintenanceBanner({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check maintenance status
    fetch("/api/settings/maintenance")
      .then((r) => r.json())
      .then((d) => {
        setMaintenance(Boolean(d.maintenance));
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  // Countdown timer for sleek aesthetics
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 45, seconds: 30 });

  useEffect(() => {
    if (!maintenance) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [maintenance]);

  if (checked && maintenance) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#09050f] text-[#f1ecfd] px-4 overflow-hidden">
        {/* Ambient atmospheric glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-signal/20 blur-[140px]"
        />

        <div className="relative z-10 max-w-lg w-full text-center p-8 rounded-3xl border border-line bg-panel/90 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <Logo size={90} />
          </div>

          <span className="micro inline-flex items-center gap-2 rounded-full border border-warn/40 bg-warn/15 px-4 py-1.5 text-warn font-bold">
            <Wrench size={14} />
            RESTOCKING / ATNAUJINIMAS
          </span>

          <h1 className="display mt-5 text-[clamp(2rem,5vw,2.8rem)]">
            Parduotuvė atnaujinama
          </h1>

          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            Šiuo metu pildome prekių atsargas ir atnaujiname kainoraštį. Grįšime jau netrukus!
          </p>

          {/* Countdown Clock */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-line bg-void p-3.5">
              <span className="num block text-[26px] font-black text-signal">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="micro text-[10px] text-muted">VALANDOS</span>
            </div>
            <div className="rounded-2xl border border-line bg-void p-3.5">
              <span className="num block text-[26px] font-black text-signal">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="micro text-[10px] text-muted">MINUTĖS</span>
            </div>
            <div className="rounded-2xl border border-line bg-void p-3.5">
              <span className="num block text-[26px] font-black text-signal">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="micro text-[10px] text-muted">SEKUNDĖS</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-signal px-6 py-3.5 font-display text-[14px] font-extrabold text-void hover:opacity-90"
            >
              Laukti naujienų Discord serveryje
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-muted/60">
            <ShieldCheck size={14} className="text-live" />
            Visi anksčiau pateikti užsakymai yra saugūs ir vykdomi įprastai.
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
