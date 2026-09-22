// Kainoraštis — Cw-Shop / cw-shop
// Kainos saugomos centais, kad niekada neprarastų tikslumo.

export type CategoryId =
  | "ai"
  | "prenumeratos"
  | "zaidimai"
  | "discord"
  | "smm"
  | "vpn"
  | "kitos";

export type Variant = {
  id: string;
  label: string;
  priceCents: number;
  unit?: string;
  strikeLabel?: string;
};

export type Product = {
  slug: string;
  brand: string;
  name: string;
  kind: "Prenumerata" | "Žaidimas" | "Paskyra" | "Paslauga" | "SMM" | "Raktai";
  category: CategoryId;
  tagline: string;
  description: string;
  accent: string;
  accent2: string;
  delivery: string;
  badge?: string;
  featured?: boolean;
  variants: Variant[];
};

export type Category = {
  id: CategoryId;
  title: string;
  kicker: string;
  blurb: string;
  image: string;
};

export const categories: Category[] = [
  {
    id: "ai",
    title: "AI Įrankiai",
    kicker: "Gemini · ChatGPT · Claude",
    blurb:
      "Raktai ir paskyros dirbtinio intelekto įrankiams. Gemini Pro+, ChatGPT Codex kreditai, Claude Pro ir Max.",
    image: "/images/cat-ai.jpg",
  },
  {
    id: "prenumeratos",
    title: "Prenumeratos",
    kicker: "Netflix · Spotify · HBO",
    blurb:
      "Nuolatinė prieiga prie transliacijų platformų. Netflix, Crunchyroll, Prime Video, UFC, HBO Max, Spotify.",
    image: "/images/cat-streaming.jpg",
  },
  {
    id: "zaidimai",
    title: "Žaidimai",
    kicker: "Robux · Xbox · Minecraft",
    blurb:
      "Valiuta, kodai ir žaidimų paskyros. Robux per gamepass, Xbox Game Pass, Minecraft Java & Bedrock, CS2 Prime.",
    image: "/images/cat-gaming.jpg",
  },
  {
    id: "discord",
    title: "Discord",
    kicker: "Boost'ai · Nariai · Dekoracijos",
    blurb:
      "Serverio boost'ai, offline nariai ir Choice Decorations dovanos į tavo serverį ar paskyrą.",
    image: "/images/cat-gaming.jpg",
  },
  {
    id: "smm",
    title: "Socialiniai tinklai",
    kicker: "TikTok · Instagram · YouTube · X",
    blurb:
      "SMM paslaugos pagal kiekį. Patinkiai, sekėjai, peržiūros, komentarai ir pasidalinimai už rinkos kainą.",
    image: "/images/cat-smm.jpg",
  },
  {
    id: "vpn",
    title: "VPN",
    kicker: "Nuolatinė prieiga",
    blurb: "IPVanish, NordVPN, ExpressVPN ir TunnelBear sąskaitos su nuolatine prieiga.",
    image: "/images/cat-ai.jpg",
  },
  {
    id: "kitos",
    title: "Kitos paslaugos",
    kicker: "Staking · Įrankiai",
    blurb: "Stake LVL2 patvirtintos paskyros ir kitos vienetinės paslaugos.",
    image: "/images/cat-smm.jpg",
  },
];

const v = (
  id: string,
  label: string,
  euros: number,
  unit?: string,
  strikeLabel?: string,
): Variant => ({
  id,
  label,
  priceCents: Math.round(euros * 100),
  unit,
  strikeLabel,
});

export const products: Product[] = [
  // ───────────────────────── AI ĮRANKIAI ─────────────────────────
  {
    slug: "gemini-pro-plus",
    brand: "Gemini",
    name: "Gemini Pro+ raktai",
    kind: "Raktai",
    category: "ai",
    tagline: "18 mėnesių prenumeratos raktas, aktyvuojamas per kelias minutes.",
    description:
      "Gemini Pro+ raktas 18 mėnesių. Raktą siunčiame el. paštu iškart po apmokėjimo patvirtinimo. Aktyvuojasi ant savo Google paskyros, nereikia perduoti slaptažodžio.",
    accent: "#4A8CFF",
    accent2: "#8B5CF6",
    delivery: "1–10 min.",
    badge: "Geriausia kaina",
    featured: true,
    variants: [v("18m", "18 mėnesiai", 1.5)],
  },
  {
    slug: "chatgpt-codex-credits",
    brand: "Codex",
    name: "ChatGPT Codex kreditai",
    kind: "Paslauga",
    category: "ai",
    tagline: "Nuo 10M iki 500M kreditų tavo Codex darbo eigai.",
    description:
      "ChatGPT Codex kreditai į tavo paskyrą. Pasirink reikalingą kiekį — kuo didesnis paketas, tuo mažesnė kaina už milijoną kreditų. Pridedama aktyvavimo instrukcija lietuviškai.",
    accent: "#10A37F",
    accent2: "#0EA5E9",
    delivery: "5–30 min.",
    featured: true,
    variants: [
      v("10m", "10M kreditų", 7),
      v("20m", "20M kreditų", 12),
      v("50m", "50M kreditų", 17),
      v("100m", "100M kreditų", 20),
      v("200m", "200M kreditų", 27),
      v("500m", "500M kreditų", 35),
    ],
  },
  {
    slug: "claude-pro-fa",
    brand: "Claude",
    name: "Claude Pro (FA)",
    kind: "Paskyra",
    category: "ai",
    tagline: "Full Access paskyra su garantija visam laikotarpiui.",
    description:
      "Claude Pro Full Access. Galima naudoti savo pašte (FA). Jei paskyra nustoja veikti garantijos laikotarpiu — pakeičiame nauja.",
    accent: "#D97757",
    accent2: "#F59E0B",
    delivery: "1–30 min.",
    variants: [
      v("2w", "2 savaitės", 8.8),
      v("1m", "1 mėnuo", 17),
    ],
  },
  {
    slug: "claude-max-fa",
    brand: "Claude",
    name: "Claude Max (FA)",
    kind: "Paskyra",
    category: "ai",
    tagline: "Max limitai, didesnis žingsnis — didesnis greitis.",
    description:
      "Claude Max Full Access — pati aukščiausia prieiga su didžiausiais naudojimo limitais. Tinka ilgoms sesijoms ir kodų generavimui be pertrūkių.",
    accent: "#C2410C",
    accent2: "#D97757",
    delivery: "1–30 min.",
    variants: [
      v("2w", "2 savaitės", 19),
      v("1m", "1 mėnuo", 32),
    ],
  },

  // ───────────────────────── PRENUMERATOS ─────────────────────────
  {
    slug: "netflix",
    brand: "Netflix",
    name: "Netflix",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "Atskira paskyra 4K kokybe. Be reklamų arba su reklamomis.",
    description:
      "Netflix prenumerata — atskira paskyra 4K kokybe. „Be reklamų, be VPN“ variantas veikia iš bet kurios šalies be papildomų nustatymų. „Su reklamomis“ variantui reikia VPN (Nyderlandai / Ispanija).",
    accent: "#E50914",
    accent2: "#7F1D1D",
    delivery: "1–10 min.",
    featured: true,
    variants: [
      v("noads", "Be reklamų · be VPN", 0.75, "1 vnt."),
      v("ads", "Su reklamomis · reikia VPN", 0.4, "1 vnt."),
    ],
  },
  {
    slug: "spotify-premium",
    brand: "Spotify",
    name: "Spotify Premium į tavo paskyrą",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "Lifetime aktyvavimas tavo pačio Spotify paskyroje.",
    description:
      "Spotify Premium į tavo paties paskyrą — lifetime. Nereikia keisti slaptažodžio, nereikia jungtis prie svetimų įrenginių. Muzika be reklamų, atsisiuntimai ir aukščiausia garso kokybė.",
    accent: "#1DB954",
    accent2: "#0F7A35",
    delivery: "10–60 min.",
    featured: true,
    variants: [v("lt", "Lifetime · tavo paskyra", 3.5, "1 vnt.")],
  },
  {
    slug: "spotify-supplier-keys",
    brand: "Spotify",
    name: "Spotify Lifetime raktai (tiektėjas)",
    kind: "Raktai",
    category: "prenumeratos",
    tagline: "Raktai perpardavėjams — didmeninė lifetime partija.",
    description:
      "Spotify lifetime raktai tiesiai iš tiektėjo. Skirta perpardavėjams ir serverių savininkams. Perkant didesnį kiekį — kreipkis dėl papildomo kiekio į Discord.",
    accent: "#1DB954",
    accent2: "#134E2A",
    delivery: "10–60 min.",
    variants: [v("key", "Lifetime raktas", 20, "1 vnt.")],
  },
  {
    slug: "crunchyroll",
    brand: "Crunchyroll",
    name: "Crunchyroll",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "Nuolatinė prieiga prie anime katalogo.",
    description:
      "Crunchyroll su nuolatine prieiga. MEGA FAN leidžia parsisiųsti ir žiūrėti 4 įrenginiuose, FAN — standartinė prieiga be atsisiuntimų.",
    accent: "#F47521",
    accent2: "#B45309",
    delivery: "1–30 min.",
    variants: [
      v("mega", "MEGA FAN · nuolatinė prieiga", 0.75, "1 vnt."),
      v("fan", "FAN · nuolatinė prieiga", 0.6, "1 vnt."),
    ],
  },
  {
    slug: "prime-video",
    brand: "Prime",
    name: "Prime Video",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "Filmai, serialai ir sportas vienoje paskyroje.",
    description:
      "Prime Video su nuolatine prieiga. Įeina Prime katalogas, originalūs serialai ir transliacijos. Pakeičiame, jei prieiga dingsta garantijos laikotarpiu.",
    accent: "#00A8E1",
    accent2: "#0369A1",
    delivery: "1–30 min.",
    variants: [v("std", "Nuolatinė prieiga", 1.5, "1 vnt.")],
  },
  {
    slug: "ufc",
    brand: "UFC",
    name: "UFC",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "Visi Fight Night ir PPV vakarai gyvai.",
    description:
      "UFC transliacijų prieiga su nuolatine prieiga. Visi pagrindiniai vakarai, kovos įrašai ir pakartojimai.",
    accent: "#D20A0A",
    accent2: "#7F1D1D",
    delivery: "1–30 min.",
    variants: [v("std", "Nuolatinė prieiga", 0.7, "1 vnt.")],
  },
  {
    slug: "paramount-plus",
    brand: "Paramount",
    name: "Paramount+",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "Nuolatinė prieiga.",
    description:
      "Paramount+ su nuolatine prieiga — filmai, serialai ir sporto transliacijos iš Paramount katalogo.",
    accent: "#0064FF",
    accent2: "#1E3A8A",
    delivery: "1–30 min.",
    variants: [v("std", "Nuolatinė prieiga", 0.5, "1 vnt.")],
  },
  {
    slug: "hbo-max",
    brand: "HBO",
    name: "HBO Max",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "Nuolatinė prieiga.",
    description:
      "HBO Max su nuolatine prieiga. HBO originalūs serialai, filmai ir sportas. Paskyra atskira, su garantija.",
    accent: "#A855F7",
    accent2: "#6D28D9",
    delivery: "1–30 min.",
    variants: [v("std", "Nuolatinė prieiga", 0.5, "1 vnt.")],
  },
  {
    slug: "movistar-plus",
    brand: "Movistar",
    name: "Movistar+",
    kind: "Prenumerata",
    category: "prenumeratos",
    tagline: "Nuolatinė prieiga.",
    description:
      "Movistar+ prieiga su nuolatine prieiga. Ispaniškas sporto ir filmų katalogas, patogu kartu su „Netflix su reklamomis“ variantu.",
    accent: "#019DF4",
    accent2: "#0C4A6E",
    delivery: "1–30 min.",
    variants: [v("std", "Nuolatinė prieiga", 0.45, "1 vnt.")],
  },

  // ───────────────────────── ŽAIDIMAI ─────────────────────────
  {
    slug: "robux",
    brand: "Robux",
    name: "Robux (per gamepass)",
    kind: "Paslauga",
    category: "zaidimai",
    tagline: "Valiuta įkrenta per tavo sukurtą gamepass.",
    description:
      "Robux per gamepass metodą — saugiausias būdas, nereikia perduoti paskyros. Sukuri gamepass, atsiunti nuorodą, mes jį nuperkame ir valiuta atsiranda tavo balanse.",
    accent: "#FF4A47",
    accent2: "#991B1B",
    delivery: "5–60 min.",
    variants: [
      v("1k", "1 000 Robux", 7),
      v("5k", "5 000 Robux", 32),
    ],
  },
  {
    slug: "xbox-game-pass-ultimate",
    brand: "Xbox",
    name: "Xbox Game Pass Ultimate",
    kind: "Raktai",
    category: "zaidimai",
    tagline: "12 mėnesiai Ultimate — 100+ žaidimų konsolėje ir PC.",
    description:
      "Xbox Game Pass Ultimate 12 mėnesių kodas. Veikia Xbox Series X|S, Xbox One ir PC. Aktyvuojamas per redeem.code.microsoft.com.",
    accent: "#107C10",
    accent2: "#14532D",
    delivery: "1–10 min.",
    badge: "12 mėn. tik 3€",
    variants: [v("12m", "12 mėnesiai", 3)],
  },
  {
    slug: "minecraft-java-bedrock",
    brand: "Minecraft",
    name: "Minecraft (Java & Bedrock)",
    kind: "Paskyra",
    category: "zaidimai",
    tagline: "Pasirink savo kontrolės lygį — nuo rakto iki pilnos paskyros.",
    description:
      "Minecraft paskyra su Java ir Bedrock leidimais. Galima rinktis: raktas į savo paskyrą arba pilna paskyra su el. pašto perėmimu. Tinka PC, Xbox, PlayStation, Switch ir mobiliems.",
    accent: "#7BB661",
    accent2: "#3F6212",
    delivery: "1–10 min.",
    featured: true,
    variants: [
      v("key", "Raktas į tavo paskyrą", 4.6),
      v("full", "Pilna paskyra su el. paštu", 5.9),
    ],
  },
  {
    slug: "steam-random-key",
    brand: "Steam",
    name: "Steam žaidimų raktas (atsitiktinis)",
    kind: "Raktai",
    category: "zaidimai",
    tagline: "Atsitiktinis Steam raktas už pusę euro.",
    description:
      "Atsitiktinis Steam žaidimo raktas. Gali pataikyti į indie perlą, gali į didelį AAA hitą — visada įdomiau už tą pačią kainą. Raktas aktyvuojamas Steam platformoje.",
    accent: "#66C0F4",
    accent2: "#1B2838",
    delivery: "1–5 min.",
    variants: [v("rnd", "1 atsitiktinis raktas", 0.5, "1 vnt.")],
  },
  {
    slug: "cs2-prime-nfa",
    brand: "CS2",
    name: "CS2 Prime NFA paskyros",
    kind: "Paskyra",
    category: "zaidimai",
    tagline: "Prime statusas, NFA — be pririštų duomenų.",
    description:
      "Counter-Strike 2 paskyra su Prime statusu. NFA (no full access) — paskyra be el. pašto perėmimo, todėl ir kaina tokia. Prime leidžia žaisti Premier reitinguotus režimus ir gauti lašus.",
    accent: "#DE9B35",
    accent2: "#78350F",
    delivery: "1–15 min.",
    variants: [v("nfa", "Prime NFA", 2, "1 vnt.")],
  },

  // ───────────────────────── DISCORD ─────────────────────────
  {
    slug: "discord-offline-nariai",
    brand: "Discord",
    name: "4K offline nariai",
    kind: "Paslauga",
    category: "discord",
    tagline: "4 000 narių tavo serveriui už 1€.",
    description:
      "4 000 offline narių į tavo Discord serverį. Nariai išsilaiko stabiliai, pridėjimas vyksta palaipsniui, kad serveris nebūtų pažymėtas.",
    accent: "#5865F2",
    accent2: "#3B3FA8",
    delivery: "10–120 min.",
    badge: "Populiaru",
    variants: [v("4k", "4 000 narių", 1)],
  },
  {
    slug: "discord-server-boosts",
    brand: "Discord",
    name: "Serverio boost'ai",
    kind: "Paslauga",
    category: "discord",
    tagline: "14x boost'ai mėnesiui — 3 lygis per vieną naktį.",
    description:
      "14 Discord serverio boostų 1 mėnesiui. Pakanka 3 lygiui pasiekti: geresnis garso kokybės bit rate, serverio baneris, daugiau emoji ir sticker slotų.",
    accent: "#5865F2",
    accent2: "#F472B6",
    delivery: "5–30 min.",
    variants: [v("14x", "14x boost · 1 mėnuo", 3.5)],
  },
  {
    slug: "discord-choice-decorations",
    brand: "Discord",
    name: "Choice Decorations dovana",
    kind: "Paslauga",
    category: "discord",
    tagline: "Avatarų ir profilio dekoracijos — renkis pagal vertę.",
    description:
      "Discord Choice Decorations dovana į tavo paskyrą. Pasirink norimos vertės dekoraciją, mes ją padovanojame. Kiekvienas variantas — mažesnė kaina nei įprasta parduotuvėje.",
    accent: "#F472B6",
    accent2: "#5865F2",
    delivery: "5–30 min.",
    variants: [
      v("499", "4.99€ dovana", 2.1, "1 vnt.", "4.99€"),
      v("599", "5.99€ dovana", 2.4, "1 vnt.", "5.99€"),
      v("699", "6.99€ dovana", 2.8, "1 vnt.", "6.99€"),
      v("799", "7.99€ dovana", 3.1, "1 vnt.", "7.99€"),
      v("849", "8.49€ dovana", 3.2, "1 vnt.", "8.49€"),
      v("999", "9.99€ dovana", 3.9, "1 vnt.", "9.99€"),
      v("1199", "11.99€ dovana", 4.7, "1 vnt.", "11.99€"),
      v("1299", "12.99€ dovana", 4.8, "1 vnt.", "12.99€"),
      v("1799", "17.99€ dovana", 6.1, "1 vnt.", "17.99€"),
    ],
  },

  // ───────────────────────── SMM ─────────────────────────
  {
    slug: "tiktok",
    brand: "TikTok",
    name: "TikTok",
    kind: "SMM",
    category: "smm",
    tagline: "Patinkiai, sekėjai, peržiūros, komentarai, pasidalinimai.",
    description:
      "TikTok SMM paslaugos pagal kiekį. Užsakymai vykdomi palaipsniui, nurodykite viešą profilio ar įrašo nuorodą.",
    accent: "#FE2C55",
    accent2: "#25F4EE",
    delivery: "0–6 val.",
    variants: [
      v("likes", "Patinkiai", 0.29, "100 vnt."),
      v("followers", "Sekėjai", 0.35, "100 vnt."),
      v("views", "Peržiūros", 0.25, "1 000 vnt."),
      v("comments", "Komentarai", 0.19, "100 vnt."),
      v("shares", "Pasidalinimai", 0.2, "1 000 vnt."),
    ],
  },
  {
    slug: "instagram",
    brand: "Instagram",
    name: "Instagram",
    kind: "SMM",
    category: "smm",
    tagline: "Sekėjai, patinkiai, peržiūros, repostai.",
    description:
      "Instagram SMM paslaugos. Repostai skaičiuojami dešimtimis, peržiūros — dešimtimis tūkstančių. Tinka tiek profiliui, tiek Reels įrašams.",
    accent: "#E1306C",
    accent2: "#F58529",
    delivery: "0–6 val.",
    variants: [
      v("followers", "Sekėjai", 0.5, "100 vnt."),
      v("likes", "Patinkiai", 0.26, "1 000 vnt."),
      v("views", "Peržiūros", 0.3, "10 000 vnt."),
      v("comments", "Komentarai", 0.34, "100 vnt."),
      v("shares", "Pasidalinimai", 0.19, "1 000 vnt."),
      v("reposts", "Repostai", 0.2, "10 vnt."),
    ],
  },
  {
    slug: "youtube",
    brand: "YouTube",
    name: "YouTube",
    kind: "SMM",
    category: "smm",
    tagline: "Prenumeratoriai, patinkiai, peržiūros, komentarai.",
    description:
      "YouTube SMM paslaugos kanalui ir įrašams. Peržiūros ir patinkiai eina palaipsniu grafiku, kad rodikliai atrodytų natūraliai.",
    accent: "#FF0000",
    accent2: "#7F1D1D",
    delivery: "0–12 val.",
    variants: [
      v("subs", "Prenumeratoriai", 0.46, "100 vnt."),
      v("likes", "Patinkiai", 0.18, "100 vnt."),
      v("views", "Peržiūros", 0.66, "100 vnt."),
      v("comments", "Komentarai", 0.66, "100 vnt."),
    ],
  },
  {
    slug: "twitter-x",
    brand: "X",
    name: "Twitter (X)",
    kind: "SMM",
    category: "smm",
    tagline: "Sekėjai, patinkiai, repostai, peržiūros.",
    description:
      "X (Twitter) SMM paslaugos. Peržiūros skaičiuojamos dešimtimis tūkstančių — pigiausias būdas pakelti įrašo pasiekiamumą.",
    accent: "#E7E9EA",
    accent2: "#64748B",
    delivery: "0–6 val.",
    variants: [
      v("followers", "Sekėjai", 0.54, "100 vnt."),
      v("likes", "Patinkiai", 1.3, "100 vnt."),
      v("reposts", "Repostai", 0.9, "100 vnt."),
      v("views", "Peržiūros", 0.3, "10 000 vnt."),
    ],
  },
  {
    slug: "kick-live-ziurovai",
    brand: "Kick",
    name: "Kick live žiūrovai",
    kind: "SMM",
    category: "smm",
    tagline: "Gyvi žiūrovai transliacijos metu.",
    description:
      "Kick transliacijų žiūrovai. Užsakymas startuoja per kelias minutes nuo transliacijos pradžios, žiūrovai išsilaiko visą sesiją.",
    accent: "#53FC18",
    accent2: "#166534",
    delivery: "5–30 min.",
    variants: [v("viewers", "Live žiūrovai", 0.34, "1 000 vnt.")],
  },
  {
    slug: "twitch-sekėjai",
    brand: "Twitch",
    name: "Twitch sekėjai",
    kind: "SMM",
    category: "smm",
    tagline: "Sekėjai kanalui už 0.19€ / 100.",
    description:
      "Twitch kanalo sekėjai. Pigiausias būdas pasiekti partnerio reikalavimus kartu su Kick žiūrovų paketais.",
    accent: "#9146FF",
    accent2: "#4C1D95",
    delivery: "0–6 val.",
    variants: [v("followers", "Sekėjai", 0.19, "100 vnt.")],
  },

  // ───────────────────────── VPN ─────────────────────────
  {
    slug: "ipvanish",
    brand: "IPVanish",
    name: "IPVanish",
    kind: "Paskyra",
    category: "vpn",
    tagline: "Nuolatinė prieiga.",
    description:
      "IPVanish paskyra su nuolatine prieiga. Neribotas greitis, 2 200+ serverių, veikia Windows, macOS, Android ir iOS.",
    accent: "#35C46A",
    accent2: "#14532D",
    delivery: "1–30 min.",
    variants: [v("acc", "Nuolatinė prieiga", 1.5, "1 vnt.")],
  },
  {
    slug: "nordvpn",
    brand: "NordVPN",
    name: "NordVPN",
    kind: "Paskyra",
    category: "vpn",
    tagline: "Nuolatinė prieiga.",
    description:
      "NordVPN paskyra su nuolatine prieiga. Double VPN, Threat Protection ir 5 900+ serverių visame pasaulyje.",
    accent: "#4687FF",
    accent2: "#1E3A8A",
    delivery: "1–30 min.",
    variants: [v("acc", "Nuolatinė prieiga", 1.4, "1 vnt.")],
  },
  {
    slug: "expressvpn",
    brand: "Express",
    name: "ExpressVPN",
    kind: "Paskyra",
    category: "vpn",
    tagline: "Vienetinė paskyra.",
    description:
      "ExpressVPN paskyra. Greičiausias ryšys rinkoje, tinka srautiniam transliavimui ir žaidimams be ping'o šuolių.",
    accent: "#DA3940",
    accent2: "#7F1D1D",
    delivery: "1–30 min.",
    variants: [v("acc", "Paskyra", 0.8, "1 vnt.")],
  },
  {
    slug: "tunnelbear",
    brand: "TunnelBear",
    name: "TunnelBear",
    kind: "Paskyra",
    category: "vpn",
    tagline: "Nuolatinė prieiga.",
    description:
      "TunnelBear paskyra su nuolatine prieiga ir neribotu duomenų kiekiu. Paprastas, greitas VPN kasdieniam naudojimui.",
    accent: "#F2A33C",
    accent2: "#78350F",
    delivery: "1–30 min.",
    variants: [v("acc", "Nuolatinė prieiga", 0.7, "1 vnt.")],
  },

  // ───────────────────────── KITOS ─────────────────────────
  {
    slug: "stake-lvl2",
    brand: "Stake",
    name: "Stake LVL2 patvirtinta paskyra",
    kind: "Paskyra",
    category: "kitos",
    tagline: "Pilna prieiga, LVL2 verifikacija atlikta.",
    description:
      "Stake paskyra su LVL2 verifikacija — pilna prieiga prie depozitų ir išmokėjimų be papildomų patikrų. Paskyra perduodama su el. paštu.",
    accent: "#1F8AFF",
    accent2: "#0F7C3A",
    delivery: "1–30 min.",
    variants: [v("lvl2", "LVL2 · pilna prieiga", 0.4, "1 vnt.")],
  },
];

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const productsByCategory = (id: CategoryId) =>
  products.filter((p) => p.category === id);

export const featuredProducts = () =>
  products.filter((p) => p.featured).slice(0, 4);

export const priceFrom = (p: Product) =>
  Math.min(...p.variants.map((x) => x.priceCents));

export const priceTo = (p: Product) =>
  Math.max(...p.variants.map((x) => x.priceCents));

export const eur = (cents: number) =>
  (cents / 100).toLocaleString("lt-LT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const priceLabel = (p: Product) => {
  const from = priceFrom(p);
  const to = priceTo(p);
  return from === to ? `${eur(from)}€` : `${eur(from)}€ – ${eur(to)}€`;
};

export const totalVariants = () =>
  products.reduce((n, p) => n + p.variants.length, 0);
