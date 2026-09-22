"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, LogIn, Lock } from "lucide-react";
import Logo from "@/components/Logo";
import { DISCORD_INVITE } from "@/lib/shop";
import { useUser } from "@/lib/useUser";

export default function MaintenanceBanner({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const { user } = useUser();

  useEffect(() => {
    fetch("/api/settings/maintenance")
      .then((r) => r.json())
      .then((d) => {
        setMaintenance(Boolean(d.maintenance));
        if (d.targetDate) {
          const t = new Date(d.targetDate).getTime();
          if (!Number.isNaN(t)) setTargetTime(t);
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 45, seconds: 17 });

  useEffect(() => {
    if (!maintenance) return;

    const updateTimer = () => {
      if (targetTime) {
        const diff = Math.max(0, targetTime - Date.now());
        const totalSec = Math.floor(diff / 1000);
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
          return { hours: 0, minutes: 0, seconds: 0 };
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [maintenance, targetTime]);

  const isAdmin = user?.role === "admin";

  // If maintenance is active BUT user is an admin, let them see the site + show persistent admin bypass banner
  if (checked && maintenance && isAdmin) {
    return (
      <>
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-warn/40 bg-warn/15 px-4 py-2 text-[12.5px] text-warn backdrop-blur-md">
          <span className="flex items-center gap-2 font-bold">
            <Lock size={14} />
            Restocking / Maintenance aktyvus lankytojams. Jūs esate prisijungęs kaip administratorius (Bypass).
          </span>
          <Link
            href="/admin"
            className="rounded-lg bg-warn px-3 py-1 font-display font-extrabold text-void hover:opacity-90"
          >
            Valdyti laikmatį & Išjungti
          </Link>
        </div>
        {children}
      </>
    );
  }

  // Exact matching maintenance view as in user's screenshot
  if (checked && maintenance && !isAdmin) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#07050d] text-[#f1ecfd] px-4 overflow-hidden">
        {/* Soft atmospheric radial bloom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[680px] w-[680px] rounded-full bg-gradient-to-tr from-purple-900/30 via-violet-600/15 to-transparent blur-[160px]"
        />

        {/* Maintenance Box */}
        <div className="relative z-10 max-w-[500px] w-full text-center p-8 sm:p-10 rounded-[32px] border border-[#2b1b4d] bg-gradient-to-b from-[#180e2f]/95 via-[#120a24]/95 to-[#0b0616]/98 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.85)]">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Logo size={105} />
          </div>

          {/* Pill Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7a572a] bg-[#291b10]/90 px-4 py-1.5 text-[11px] font-bold text-[#eab308] tracking-widest uppercase">
              <Wrench size={13} className="text-[#eab308]" />
              RESTOCKING / ATNAUJINIMAS
            </span>
          </div>

          {/* Headline */}
          <h1 className="display mt-6 text-[clamp(2.3rem,6vw,3.1rem)] font-black text-white leading-[1.05]">
            Parduotuvė<br />atnaujinama
          </h1>

          {/* Subtitle */}
          <p className="mt-3.5 text-[14.5px] leading-relaxed text-[#a394c5]">
            Šiuo metu pildome prekių atsargas ir atnaujiname kainoraštį. Grįšime jau netrukus!
          </p>

          {/* 3 Box Countdown */}
          <div className="mt-8 grid grid-cols-3 gap-3.5">
            <div className="rounded-2xl border border-[#2b1a4a] bg-[#0c0718]/90 p-4 shadow-inner">
              <span className="num block text-[32px] font-black text-[#c084fc] leading-none">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="micro block mt-2 text-[10px] text-[#8e7dae] tracking-widest">
                VALANDOS
              </span>
            </div>

            <div className="rounded-2xl border border-[#2b1a4a] bg-[#0c0718]/90 p-4 shadow-inner">
              <span className="num block text-[32px] font-black text-[#c084fc] leading-none">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="micro block mt-2 text-[10px] text-[#8e7dae] tracking-widest">
                MINUTĖS
              </span>
            </div>

            <div className="rounded-2xl border border-[#2b1a4a] bg-[#0c0718]/90 p-4 shadow-inner">
              <span className="num block text-[32px] font-black text-[#c084fc] leading-none">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="micro block mt-2 text-[10px] text-[#8e7dae] tracking-widest">
                SEKUNDĖS
              </span>
            </div>
          </div>

          {/* Discord CTA Button */}
          <div className="mt-8">
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a855f7] py-4 font-display text-[15px] font-black text-white transition-all hover:bg-[#9333ea] hover:scale-[1.02] shadow-[0_10px_30px_rgba(168,85,247,0.35)]"
            >
              Laukti naujienų Discord serveryje
            </a>
          </div>

          {/* Bottom security assurance */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-[#8e7dae]">
            <ShieldCheck size={14} className="text-[#4ade80]" />
            Visi anksčiau pateikti užsakymai yra saugūs ir vykdomi įprastai.
          </div>

          {/* Admin login doorway for when the site is closed */}
          <div className="mt-6 pt-5 border-t border-[#23153f]">
            <Link
              href="/prisijungimas"
              className="inline-flex items-center gap-1.5 text-[12px] text-[#a394c5] hover:text-white transition-colors"
            >
              <LogIn size={13} />
              <span>Esu administratorius · Prisijungti</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
