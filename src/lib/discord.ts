export const WEBHOOK_URL =
  process.env.DISCORD_WEBHOOK_URL ??
  "https://discord.com/api/webhooks/1551925438677524600/ZwHE0cCXAyeCyBoIwb7PaLygX7yWO3fCRtT04DHjKJ1goRGX7Vk9butrk-nqrqWkh3Zy";

export type WebhookLine = { name: string; value: string; inline?: boolean };

const COLORS: Record<string, number> = {
  violet: 0xb78bff,
  green: 0x4ade80,
  red: 0xf87171,
  amber: 0xfbbf24,
};

function basePayload(title: string, lines: WebhookLine[], tone: keyof typeof COLORS) {
  return {
    username: "Cw-Shop",
    embeds: [
      {
        title,
        color: COLORS[tone],
        fields: lines,
        timestamp: new Date().toISOString(),
        footer: { text: "Cw-Shop · kainoraštis" },
      },
    ],
  };
}

/** Fire-and-forget Discord notification — never blocks or breaks an order. */
export async function notifyDiscord(
  title: string,
  lines: WebhookLine[],
  tone: keyof typeof COLORS = "violet",
): Promise<boolean> {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload(title, lines, tone)),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type OrderMail = {
  code: string;
  email: string;
  discord?: string | null;
  note?: string | null;
  method?: string | null;
  totalCents: number;
  status: string;
  createdAt: Date | string;
  items: {
    productName: string;
    variantLabel: string;
    unitCents: number;
    qty: number;
  }[];
};

export function orderFields(order: OrderMail): WebhookLine[] {
  const items = order.items
    .map(
      (i) =>
        `• **${i.productName}** — ${i.variantLabel}${
          i.qty > 1 ? ` ×${i.qty}` : ""
        } · ${((i.unitCents * i.qty) / 100).toFixed(2)}€`,
    )
    .join("\n");

  return [
    { name: "Užsakymas", value: `#${order.code}`, inline: true },
    { name: "Suma", value: `${(order.totalCents / 100).toFixed(2)}€`, inline: true },
    { name: "Būsena", value: order.status, inline: true },
    { name: "El. paštas", value: order.email, inline: true },
    {
      name: "Discord",
      value: order.discord || "nenurodytas",
      inline: true,
    },
    {
      name: "Data",
      value: new Date(order.createdAt).toLocaleString("lt-LT"),
      inline: true,
    },
    { name: "Prekės", value: items.slice(0, 1000) || "—", inline: false },
    {
      name: "Mokėjimo būdas",
      value: order.method ?? "nenurodytas",
      inline: true,
    },
    {
      name: "Pastaba mokėjime",
      value:
        order.method === "bank"
          ? "paskirtis: Papildymas"
          : order.method === "ltc"
            ? "LTC pavedimas"
            : `PayPal F&F · notes tuščias`,
      inline: true,
    },
  ];
}
