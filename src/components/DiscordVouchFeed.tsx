"use client";

import Link from "next/link";
import { MessageSquare, ArrowUpRight, Hash, Star } from "lucide-react";
import { DISCORD_INVITE } from "@/lib/shop";
import { useLanguage } from "@/lib/language";
import { playSound } from "@/lib/audio";

export type DiscordVouchMessage = {
  id: string;
  author: string;
  avatarBg: string;
  avatarLetter: string;
  avatarColor: string;
  timestamp: string;
  badgeEmoji?: string;
  messages: string[];
  hearts?: number;
};

// Real vouch entries as shown in Discord #⭐・atsiliepimai screenshot
export const DISCORD_CHAT_VOUCHES: DiscordVouchMessage[] = [
  {
    id: "m-1",
    author: "westukass",
    avatarBg: "bg-emerald-600",
    avatarLetter: "W",
    avatarColor: "#ffffff",
    timestamp: "Yesterday at 1:08 PM",
    badgeEmoji: "☕",
    messages: ["+rep 0 reklama [1.00€]"],
    hearts: 2,
  },
  {
    id: "m-2",
    author: "draxiukas",
    avatarBg: "bg-purple-600",
    avatarLetter: "D",
    avatarColor: "#ffffff",
    timestamp: "Today at 12:22 AM",
    badgeEmoji: "💶",
    messages: [
      "+rep 5 steam random zaidimu key [5.00€] (edited)",
      "+rep 1 netflix 1men [1.50€]",
    ],
  },
  {
    id: "m-3",
    author: "liuxas",
    avatarBg: "bg-slate-700",
    avatarLetter: "L",
    avatarColor: "#ffffff",
    timestamp: "Today at 12:38 AM",
    messages: ["+rep 1 spotify premium i mano paskyra [15.00€]"],
  },
  {
    id: "m-4",
    author: "absolutnothing",
    avatarBg: "bg-red-600",
    avatarLetter: "A",
    avatarColor: "#ffffff",
    timestamp: "Today at 12:42 AM",
    badgeEmoji: "💶",
    messages: ["+rep 1 nordvpn [1.50€]"],
  },
  {
    id: "m-5",
    author: "kajusgandras_42437",
    avatarBg: "bg-amber-600",
    avatarLetter: "K",
    avatarColor: "#ffffff",
    timestamp: "Today at 7:14 AM",
    badgeEmoji: "💶",
    messages: ["+rep 1 spotify premium 3men i mano paskyra [5.00€]"],
  },
];

export default function DiscordVouchFeed() {
  const { lang } = useLanguage();

  return (
    <section className="relative my-20">
      {/* Title block matching screenshot: Klientų Atsiliepimai / Ką apie mus sako mūsų pirkėjai */}
      <div className="text-center mb-8">
        <h2 className="display text-[clamp(2rem,5vw,3.2rem)] text-white">
          {lang === "en" ? "Customer Reviews" : "Klientų Atsiliepimai"}
        </h2>
        <p className="mt-2 text-[15px] text-muted">
          {lang === "en"
            ? "What our buyers say about us"
            : "Ką apie mus sako mūsų pirkėjai"}
        </p>
      </div>

      {/* Realistic Discord Channel Window */}
      <div className="mx-auto max-w-[760px] rounded-2xl border border-[#2b2d31] bg-[#313338] shadow-2xl overflow-hidden font-sans">
        {/* Top Discord Bar */}
        <div className="flex items-center justify-between border-b border-[#232428] bg-[#2b2d31] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="text-[#949ba4] font-bold text-[18px]">#</span>
            <div className="flex items-center gap-1.5 font-bold text-[15px] text-[#f2f3f5]">
              <Star size={14} className="fill-[#e5a230] text-[#e5a230]" />
              <span>・atsiliepimai</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#949ba4] hover:text-white cursor-pointer transition-colors text-[13px]">
              <Hash size={16} />
            </span>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              onClick={() => playSound("click")}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#5865f2] px-3 py-1 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <span>{lang === "en" ? "Join Discord" : "Prisijungti"}</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        {/* Discord Chat Messages Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto bg-[#313338] text-left">
          {DISCORD_CHAT_VOUCHES.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3.5 group hover:bg-[#2e3035] -mx-4 sm:-mx-6 px-4 sm:px-6 py-1.5 rounded-lg transition-colors">
              {/* Discord Avatar */}
              <div
                className={`h-10 w-10 shrink-0 rounded-full ${msg.avatarBg} flex items-center justify-center font-bold text-[15px] text-white shadow`}
              >
                {msg.avatarLetter}
              </div>

              {/* Message Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-[15px] text-[#f2f3f5] hover:underline cursor-pointer">
                    {msg.author}
                  </span>
                  {msg.badgeEmoji ? (
                    <span className="text-[13px]">{msg.badgeEmoji}</span>
                  ) : null}
                  <span className="text-[11.5px] text-[#949ba4] font-medium">
                    {msg.timestamp}
                  </span>
                </div>

                <div className="mt-0.5 space-y-0.5 text-[14.5px] text-[#dbdee1] leading-relaxed">
                  {msg.messages.map((line, idx) => (
                    <div key={idx} className="font-mono sm:font-sans">
                      {line}
                    </div>
                  ))}
                </div>

                {/* Reaction Hearts */}
                {msg.hearts ? (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#3f4147] bg-[#2b2d31] px-2 py-0.5 text-[12px] text-[#dbdee1]">
                    <span>💙</span>
                    <span className="font-bold text-[11px] text-[#949ba4]">{msg.hearts}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Discord Chat Footer Mock (Click here to log in and participate in chat) */}
        <div className="border-t border-[#232428] bg-[#383a40] px-4 py-3 text-center">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noreferrer"
            onClick={() => playSound("click")}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#949ba4] hover:text-[#dbdee1] transition-colors"
          >
            <MessageSquare size={14} />
            <span>
              {lang === "en"
                ? "Click here to join Discord and participate in chat"
                : "Spausk čia, norėdamas prisijungti ir rašyti atsiliepimus"}
            </span>
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}
