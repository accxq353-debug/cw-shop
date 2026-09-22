export const SHOP_NAME = "Cw-Shop";
export const SHOP_DOMAIN = "cw-shop";
/** Parduotuvė įkurta šiandien. */
export const STARTED_YEAR = 2026;
export const STARTED_LABEL = "2026";

export const DISCORD_INVITE = "https://discord.gg/asMCPaCKk";

export type PaymentRow = { label: string; value: string; mono?: boolean };

export type PaymentMethod = {
  id: "paypal" | "bank" | "ltc";
  label: string;
  kicker: string;
  rows: PaymentRow[];
  note: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "paypal",
    label: "PayPal",
    kicker: "Friends & Family",
    rows: [{ label: "El. paštas", value: "dendepro11@gmail.com", mono: true }],
    note: "Siųsk kaip Friends & Family — be jokių pastabų (notes turi būti tuščias).",
  },
  {
    id: "bank",
    label: "Banko pavedimas",
    kicker: "SEPA / LT",
    rows: [
      { label: "IBAN", value: "LT804010051005860181", mono: true },
      { label: "Gavėjas", value: "Aironas Zonys" },
      { label: "Paskirtis", value: "Papildymas", mono: true },
    ],
    note: "Mokėjimo paskirtyje būtinai įrašyk „Papildymas“.",
  },
  {
    id: "ltc",
    label: "Litecoin (LTC)",
    kicker: "Tinklo mokestis tavo",
    rows: [
      {
        label: "Adresas",
        value: "LYknAU9LGs23yU6GJymKsfXE5FMhn5itK8",
        mono: true,
      },
    ],
    note: "Prieš siunčiant dukart patikrink adresą — pavedimai tinkle negrąžinami.",
  },
];

export const NO_REFUND_WARNING =
  "Jeigu siunčiant nurodei neteisingą informaciją (blogą adresą, klaidingą sumą, kitą paskirtį) — pinigai negrąžinami.";

export const PROOF_NOTE =
  "Išsiuntęs mokėjimą, pridėk ekrano nuotrauką (screenshot) kaip įrodymą. Ji bus nusiųsta į mūsų Discord kanalą ir komanda bus automatiškai įspėta.";

export const PROOF_REQUIRED =
  "Įrodymas privalomas — be ekrano nuotraukos mokėjimo patvirtinti negalima.";
