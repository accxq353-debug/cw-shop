"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/language";

export const FAQ_ITEMS_LT = [
  {
    q: "Kaip greitai gaunu prekę?",
    a: "Mokėjimą patvirtiname rankiniu būdu — kai tik randame pavedimą ir tavo įrodymą, prekė pristatoma tiesiai į tavo svetainės paskyrą bei el. paštą per 1–10 minučių. SMM užsakymai ir Discord boost'ai vykdomi per 5–120 min.",
  },
  {
    q: "Kokiais būdais galima apmokėti?",
    a: "Trys būdai: PayPal (Friends & Family, be pastabų į dendepro11@gmail.com), banko pavedimas (IBAN LT804010051005860181, gavėjas Aironas Zonys, paskirtis „Papildymas“) arba Litecoin (LTC). Mokėjimo būdą pasirenki prieš kurdamas užsakymą.",
  },
  {
    q: "Kodėl reikia kelti mokėjimo įrodymą?",
    a: "Išsiuntęs mokėjimą, privalai įkelti ekrano nuotrauką (screenshot) kaip įrodymą. Ji automatiškai keliauja į mūsų Discord kanalą ir komanda iš karto įspėjama. Be įrodymo mokėjimo patvirtinti negalima — mygtukas „Pinigai išsiųsti“ lieka užrakintas.",
  },
  {
    q: "Ar grąžinami pinigai, jei suklysiu siųsdamas?",
    a: "Ne. Jeigu siunčiant nurodyta neteisinga informacija — blogas adresas, klaidinga suma, kita mokėjimo paskirtis arba ne Friends & Family tipas — pinigai negrąžinami. Prieš siunčiant visada dukart patikrink duomenis, ypač LTC adresą.",
  },
  {
    q: "Ar prekės turi garantiją?",
    a: "Taip. Prenumeratos ir paskyros garantuojamos visam nurodytam laikotarpiui. Jei prieiga dingsta anksčiau laiko — pakeičiame nauja preke arba grąžiname pinigus.",
  },
  {
    q: "Ar reikia perduoti savo paskyrą?",
    a: "Ne. Dauguma prekių (Canva Pro, Spotify Premium, Adobe Express, Gemini raktai) aktyvuojamos tavo pačio paskyroje. Tik pažymėtos „FA / NFA“ prekės yra atskiros paskyros su priskirtais duomenimis.",
  },
];

export const FAQ_ITEMS_EN = [
  {
    q: "How fast do I receive my product?",
    a: "We verify payments manually — as soon as we match your transfer and screenshot proof, your product is delivered straight into your website account and email within 1–10 minutes. SMM services and Discord boosts are fulfilled within 5–120 minutes.",
  },
  {
    q: "What payment methods are supported?",
    a: "Three verified methods: PayPal (Friends & Family, strictly no notes to dendepro11@gmail.com), EU Bank Transfer (IBAN LT804010051005860181, Recipient Aironas Zonys, reference 'Papildymas'), or Litecoin (LTC). You select your method at checkout.",
  },
  {
    q: "Why is screenshot proof mandatory?",
    a: "After sending your payment, you must attach a transaction screenshot as proof. It instantly relays to our internal Discord staff audit channel so our team can approve your order without delay. The confirmation button unlocks only after attaching proof.",
  },
  {
    q: "Are transactions refundable if I make a typo?",
    a: "No. If you send to the wrong crypto address, input an incorrect reference, or fail to send via Friends & Family, transactions are strictly non-refundable. Always double-check recipient details before sending.",
  },
  {
    q: "Do all products include warranty?",
    a: "Yes. All subscriptions and accounts carry a full warranty covering the entire duration purchased. If an account experiences issues, we issue a prompt replacement or refund.",
  },
  {
    q: "Do I need to share my personal account password?",
    a: "No. Products such as Canva Pro, Spotify Premium, Adobe Express, and Gemini activate directly without needing your password. Only explicitly marked FA/NFA accounts come with new dedicated credentials.",
  },
];

export default function Faq({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const { lang } = useLanguage();

  const allItems = lang === "en" ? FAQ_ITEMS_EN : FAQ_ITEMS_LT;
  const items = allItems.slice(0, limit ?? allItems.length);

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-5 py-5 text-left transition-colors hover:text-signal"
            >
              <span className="num text-[12px] text-muted/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 font-display text-[17px] font-extrabold tracking-[-0.02em] sm:text-[19px]">
                {item.q}
              </span>
              <Plus
                size={18}
                strokeWidth={2.4}
                className={`shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-45 text-signal" : ""
                }`}
              />
            </button>
            <div
              className="grid overflow-hidden transition-all duration-300"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="max-w-[70ch] pb-6 pl-[38px] pr-8 text-[14.5px] leading-relaxed text-muted">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
