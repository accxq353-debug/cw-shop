"use client";

import { useEffect, useState } from "react";
import { MessageSquare, ArrowRight, X, ShieldCheck, Sparkles, Users } from "lucide-react";
import Logo from "@/components/Logo";
import { DISCORD_INVITE } from "@/lib/shop";
import { useLanguage } from "@/lib/language";
import { playSound } from "@/lib/audio";

const DISMISS_KEY = "cw_discord_modal_seen";

export default function DiscordWelcomeModal() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (!dismissed) {
        // Show smoothly after 1.5 seconds of user arrival
        const timer = setTimeout(() => {
          setOpen(true);
          playSound("pop");
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleClose = () => {
    setOpen(false);
    playSound("click");
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {}
  };

  const handleJoin = () => {
    playSound("success");
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {}
    window.open(DISCORD_INVITE, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-signal/50 bg-gradient-to-b from-[#1c1134] via-[#150c27] to-[#09050f] p-8 text-center shadow-[0_0_60px_rgba(183,139,255,0.35)] animate-scale-up">
        {/* Glow ambient background element */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-signal/25 blur-[70px]"
        />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Uždaryti"
          className="absolute right-4 top-4 rounded-full border border-line bg-white/[0.04] p-1.5 text-muted transition-colors hover:border-signal/50 hover:text-ink"
        >
          <X size={18} />
        </button>

        {/* Brand logo & icon */}
        <div className="flex justify-center mb-5">
          <Logo size={100} />
        </div>

        {/* Badge */}
        <div className="flex justify-center">
          <span className="micro inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal/15 px-3.5 py-1 text-signal font-extrabold shadow-sm">
            <Sparkles size={13} className="text-signal animate-pulse" />
            {lang === "en" ? "OFFICIAL DISCORD COMMUNITY" : "OFICIALI DISCORD BENDRUOMENĖ"}
          </span>
        </div>

        {/* Title */}
        <h2 className="display mt-4 text-[clamp(1.7rem,4vw,2.2rem)] leading-tight text-white">
          {lang === "en" ? "Would you like to join our Discord?" : "Ar norėtumėte prisijungti prie mūsų Discord?"}
        </h2>

        {/* Description */}
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          {lang === "en"
            ? "Get instant 24/7 support, view real-time vouches in #vouched, exclusive secret giveaways, and automatic ticket deliveries."
            : "Gaukite tiesioginę pagalbą 24/7, stebėkite pirkėjų atsiliepimus #vouched kanale, gaukite specialias nuolaidas ir dovanas!"}
        </p>

        {/* Features list */}
        <div className="mt-5 grid grid-cols-2 gap-2 text-left text-[12.5px] text-ink/90">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-void/60 p-2.5">
            <Users size={16} className="text-signal shrink-0" />
            <span>{lang === "en" ? "Active Community" : "Aktyvūs nariai"}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-void/60 p-2.5">
            <ShieldCheck size={16} className="text-live shrink-0" />
            <span>{lang === "en" ? "Real-time Vouches" : "#vouched atsiliepimai"}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleJoin}
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-signal py-3.5 font-display text-[15px] font-extrabold text-void transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(183,139,255,0.4)] active:scale-[0.98]"
          >
            <MessageSquare size={18} className="transition-transform group-hover:rotate-12" />
            <span>{lang === "en" ? "Yes, Join Discord Server!" : "Taip, prisijungti prie Discord!"}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="text-[13px] text-muted transition-colors hover:text-ink underline-offset-4 hover:underline"
          >
            {lang === "en" ? "Maybe later, continue browsing" : "Galbūt vėliau, tęsti naršymą"}
          </button>
        </div>
      </div>
    </div>
  );
}
