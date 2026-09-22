"use client";

import { useLanguage } from "@/lib/language";
import { BadgeCheck, MessageSquare, Star, ArrowUpRight } from "lucide-react";
import { DISCORD_INVITE } from "@/lib/shop";

export type Vouch = {
  id: string;
  author: string;
  discordTag: string;
  avatarBg: string;
  itemTag: string;
  price: string;
  date: string;
  rating: number;
  message: string;
};

export const SAMPLE_VOUCHES: Vouch[] = [
  {
    id: "v-1",
    author: "Lukas_K",
    discordTag: "lukas#4491",
    avatarBg: "from-purple-500 to-indigo-600",
    itemTag: "Netflix 4K (No ADS)",
    price: "0.75€",
    date: "Šiandien 16:42",
    rating: 5,
    message: "+rep gavau per 2 minutes, viskas veikia nepriekaištingai be jokių problemų!",
  },
  {
    id: "v-2",
    author: "Dovydas.V",
    discordTag: "dovydas#1022",
    avatarBg: "from-emerald-500 to-teal-700",
    itemTag: "Robux 5,000 (Gamepass)",
    price: "32.00€",
    date: "Šiandien 14:15",
    rating: 5,
    message: "+rep didelis ačiū, Robux įkrito po kelių minučių per gamepass. Pirkau jau antrą kartą.",
  },
  {
    id: "v-3",
    author: "Karolis_M",
    discordTag: "karolis#8831",
    avatarBg: "from-blue-500 to-cyan-600",
    itemTag: "Discord 14x Server Boosts",
    price: "3.50€",
    date: "Vakar 21:05",
    rating: 5,
    message: "+rep 14 boostų užkelti per naktį, 3 lygis pasiektas akimirksniu. Rekomenduoju visiems serveriams!",
  },
  {
    id: "v-4",
    author: "Matas_X",
    discordTag: "matas#2044",
    avatarBg: "from-rose-500 to-pink-600",
    itemTag: "ChatGPT Codex 50M Credits",
    price: "17.00€",
    date: "Vakar 18:30",
    rating: 5,
    message: "+rep greitas atsakymas ir patvirtinimas, kreditai sąskaitoje. Ačiū komandai!",
  },
  {
    id: "v-5",
    author: "Tomas.B",
    discordTag: "tomas#0092",
    avatarBg: "from-amber-500 to-orange-600",
    itemTag: "Minecraft Java & Bedrock",
    price: "4.60€",
    date: "Prieš 2 d.",
    rating: 5,
    message: "+rep raktas aktyvuotas oficialiame puslapyje, veikia be jokių trikdžių.",
  },
  {
    id: "v-6",
    author: "Erikas",
    discordTag: "erikas#7119",
    avatarBg: "from-fuchsia-500 to-purple-800",
    itemTag: "Spotify Premium Lifetime",
    price: "3.50€",
    date: "Prieš 2 d.",
    rating: 5,
    message: "+rep aktyvavo tiesiai ant mano pačio asmeninio Spotify be slaptažodžio keitimo. Super!",
  },
];

export default function DiscordVouchFeed() {
  const { t } = useLanguage();

  return (
    <section className="relative mt-24">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="micro inline-flex items-center gap-2 rounded-full border border-signal/40 bg-signal/10 px-3.5 py-1 text-signal">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" />
            {t.vouchBadge}
          </span>
          <h2 className="display mt-3 text-[clamp(1.9rem,4vw,2.7rem)]">
            {t.vouchTitle}
          </h2>
          <p className="mt-2 text-[14px] text-muted max-w-xl">
            {t.vouchDesc}
          </p>
        </div>

        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-[13.5px] font-extrabold text-ink transition-colors hover:border-signal/50 hover:text-signal"
        >
          <MessageSquare size={16} />
          Peržiūrėti visus #vouched Discord&apos;e
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Grid of Vouches */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_VOUCHES.map((v) => (
          <article
            key={v.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-line bg-gradient-to-b from-[#150c27]/90 to-[#09050f]/90 p-5 shadow-lg transition-all duration-300 hover:border-signal/40 hover:-translate-y-1"
          >
            {/* Top user row */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${v.avatarBg} font-display text-[14px] font-black text-white shadow-md`}
                  >
                    {v.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-[14.5px] font-extrabold text-ink">
                        {v.author}
                      </span>
                      <span title={t.verifiedBuyer} className="inline-flex">
                        <BadgeCheck size={14} className="text-signal" />
                      </span>
                    </div>
                    <span className="num text-[11.5px] text-muted/70">
                      {v.discordTag}
                    </span>
                  </div>
                </div>

                <span className="num text-[11px] text-muted/60">{v.date}</span>
              </div>

              {/* Product & Price Tag */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="micro rounded-md border border-line bg-void px-2.5 py-1 text-[10px] text-signal font-semibold">
                  {v.itemTag}
                </span>
                <span className="num rounded-md bg-live/10 px-2 py-0.5 text-[11px] font-bold text-live">
                  {v.price}
                </span>
              </div>

              {/* Message */}
              <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink/90 font-sans">
                {v.message}
              </p>
            </div>

            {/* Bottom rating */}
            <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
              <div className="flex gap-0.5">
                {Array.from({ length: v.rating }).map((_, i) => (
                  <Star key={i} size={13} className="fill-warn text-warn" />
                ))}
              </div>
              <span className="micro text-[10px] text-muted/60">
                Verified Discord Vouch
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
