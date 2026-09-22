"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export const FAQ_ITEMS = [
  {
    q: "Kaip greitai gaunu prekę?",
    a: "Mokėjimą patvirtiname rankiniu būdu — kai tik randame pavedimą ir tavo įrodymą, prekė keliauja į tavo el. paštą, dažniausiai per 1–10 minučių. SMM užsakymai ir Discord boost'ai vykdomi per 5–120 min. Jei užsakymas vėluoja — parašyk Discord su užsakymo numeriu.",
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
    a: "Taip. Prenumeratos ir paskyros garantuojamos visam nurodytam laikotarpiui. Jei prieiga dingsta anksčiau laiko — pakeičiame nauja preke arba grąžiname pinigus į PayPal balansą.",
  },
  {
    q: "Ar reikia perduoti savo paskyrą?",
    a: "Ne. Dauguma prekių (Canva Pro, Spotify Premium, Adobe Express, Gemini raktai) aktyvuojamos tavo pačio paskyroje. Tik pažymėtos „FA / NFA“ prekės yra atskiros paskyros su priskirtais duomenimis.",
  },
  {
    q: "Kodėl Netflix kartais reikia VPN?",
    a: "„Su reklamomis“ variantas veikia tik iš tam tikrų šalių (NL / ES), todėl reikia nemokamo VPN. „Be reklamų, be VPN“ variantas veikia iš bet kur — ir kainuoja daugiau.",
  },
  {
    q: "Ką reiškia FA ir NFA?",
    a: "FA (full access) — gauni pilną prieigą su el. paštu ir slaptažodžiu, gali keisti duomenis. NFA (no full access) — paskyra be el. pašto perėmimo, todėl ji gerokai pigesnė (pvz., CS2 Prime NFA).",
  },
  {
    q: "Kaip atrodo užsakymo eiga?",
    a: "1) Išsirenki prekes ir mokėjimo būdą, 2) gauni užsakymo numerį #STG…, 3) pervedi tikslią sumą, 4) įkeli mokėjimo įrodymą, 5) paspaudi „Pinigai išsiųsti“, 6) administratorius patvirtina mokėjimą ir atsiunčia prekę. Visą eigą matai skiltyje „Mano užsakymai“.",
  },
  {
    q: "Neradau prekės, kurią ieškau — ką daryti?",
    a: "Parašyk Discord serveryje. Turime tiek daug tiektėjų, kad dažnai galime pasiūlyti ir tai, ko nėra kainoraštyje — ypač didesnius SMM kiekius ar retas paskyras.",
  },
];

export default function Faq({ limit }: { limit?: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = FAQ_ITEMS.slice(0, limit ?? FAQ_ITEMS.length);

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
