export type OrderStatus =
  | "laukiama"
  | "mokejimas_pateiktas"
  | "patvirtinta"
  | "ivykdyta"
  | "atmesta";

export const STATUS_LABEL: Record<OrderStatus | string, string> = {
  laukiama: "Laukiama apmokėjimo",
  mokejimas_pateiktas: "Mokėjimas pateiktas",
  patvirtinta: "Mokėjimas patvirtintas",
  ivykdyta: "Įvykdyta · prekė išsiųsta",
  atmesta: "Atmesta",
};

export const STATUS_TONE: Record<OrderStatus | string, string> = {
  laukiama: "border-signal/30 bg-signal/10 text-signal",
  mokejimas_pateiktas: "border-warn/30 bg-warn/10 text-warn",
  patvirtinta: "border-live/30 bg-live/10 text-live",
  ivykdyta: "border-live/40 bg-live/15 text-live",
  atmesta: "border-red-400/30 bg-red-400/10 text-red-300",
};

export const DECLINE_REASONS = [
  "Suma nesutampa",
  "Ne Friends & Family",
  "Mokėjimas nerastas",
  "Įrodymas nepateiktas",
  "Įrodymas neteisingas",
  "Neteisingi mokėjimo duomenys",
  "Kita (žr. pastabą)",
];
