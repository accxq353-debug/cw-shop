import fs from "node:fs";
import path from "node:path";

export const WEBHOOK_URL =
  process.env.DISCORD_WEBHOOK_URL ??
  "https://discord.com/api/webhooks/1551925438677524600/ZwHE0cCXAyeCyBoIwb7PaLygX7yWO3fCRtT04DHjKJ1goRGX7Vk9butrk-nqrqWkh3Zy";

// Dedicated channel webhook for fully completed / delivered sales only
export const SALES_COMPLETED_WEBHOOK =
  process.env.DISCORD_SALES_WEBHOOK ??
  "https://discord.com/api/webhooks/1552074859331190906/RwoaxGokpj08wYBnb7yjKAMuldK6fwMSJ_R5PMBMLGWDpUh5flu9yhj396sg1_SFGwEV";

export const EMOJIS = {
  arrow: "<a:Animated_Arrow_Purple:1549082377350029323>",
  ipvanish: "<:IPVanish:1548450723300380672>",
  minecraft: "<:MinecraftGrass:1548459108015804506>",
  netflix: "<:Netflix:1548450457901469759>",
  nordvpn: "<:Nordvpn:1548450789201154068>",
  briefcase: "<a:PurpleBriefcase:1549081974596182067>",
  chain: "<a:PurpleChain:1549081815132803254>",
  diamond: "<a:PurpleDiamond:1547623213142384752>",
  euro: "<a:PurpleEuro:1549437135671664855>",
  gear: "<a:PurpleGear:1549081880127610920>",
  lightbulb: "<a:PurpleLightbulb:1549081930325172406>",
  question: "<a:PurpleQuestionMark:1549082031667941480>",
  rocket: "<a:PurpleRocket:1549437206483963955>",
  spotify: "<:Spotify:1548450522707664987>",
  stars: "<:Starsss:1547625262294892614>",
  crunchyroll: "<:crunchyroll:1548450921397096528>",
  ltc: "<:emojigg_Ltc:1547623406122438707>",
  paypal: "<:paypal:1547623327810588704>",
  sparkle: "<a:purple:1549437415423352884>",
  sparkle2: "<a:purple:1549437538807324683>",
  clouds: "<a:purpleclouds:1549441228293283972>",
};

export type WebhookLine = { name: string; value: string; inline?: boolean };

const COLORS: Record<string, number> = {
  violet: 0xb78bff,
  green: 0x4ade80,
  red: 0xf87171,
  amber: 0xfbbf24,
  purpleGlow: 0x8a2be2,
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

/** Fire-and-forget Discord notification for order status updates */
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
  ];
}

/**
 * Mask an email like w***@gmail.com as shown in the Discord screenshot
 */
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "w***@gmail.com";
  const first = user[0] || "w";
  return `${first}***@${domain}`;
}

/**
 * Helper to pick product emoji
 */
function getProductEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("spotify")) return EMOJIS.spotify;
  if (n.includes("netflix")) return EMOJIS.netflix;
  if (n.includes("minecraft")) return EMOJIS.minecraft;
  if (n.includes("nord")) return EMOJIS.nordvpn;
  if (n.includes("ipvanish")) return EMOJIS.ipvanish;
  if (n.includes("crunchy")) return EMOJIS.crunchyroll;
  return "🎵";
}

/**
 * Helper to pick payment emoji
 */
function getPaymentEmoji(method?: string | null): string {
  const m = (method || "").toLowerCase();
  if (m === "ltc" || m === "crypto") return EMOJIS.ltc;
  if (m === "paypal") return EMOJIS.paypal;
  return EMOJIS.euro;
}

function getPaymentLabel(method?: string | null): string {
  const m = (method || "").toLowerCase();
  if (m === "ltc") return "Ltc";
  if (m === "bank") return "Bank (SEPA)";
  return "PayPal";
}

/**
 * Sends a sale completion notification to the designated Discord sales webhook.
 * Formatted to match the reference layout with purple sidebar, custom emojis,
 * product title, masked buyer email, and attached banner graphic.
 */
export async function notifySaleDelivered(order: {
  code: string;
  email: string;
  method?: string | null;
  totalCents: number;
  items: {
    productName: string;
    variantLabel: string;
    unitCents: number;
    qty: number;
  }[];
}): Promise<boolean> {
  try {
    const firstItem = order.items[0];
    const productName = firstItem ? firstItem.productName : "Digital Product";
    const variantLabel = firstItem ? firstItem.variantLabel : "LIFETIME [ KEY ]";
    const prodEmoji = getProductEmoji(productName);
    const payEmoji = getPaymentEmoji(order.method);
    const payLabel = getPaymentLabel(order.method);
    const totalQty = order.items.reduce((acc, it) => acc + (it.qty || 1), 0);
    const formattedPrice = (order.totalCents / 100).toFixed(2);
    const maskedCustomer = maskEmail(order.email);

    // Build the description exactly like in the picture
    const embedDescription = [
      `### **${productName} [ ${variantLabel.toUpperCase()} ]**`,
      `${prodEmoji} ${productName} [ ${variantLabel.toUpperCase()} ]`,
      ``,
      `${EMOJIS.diamond} **Total** \`$${formattedPrice} EUR\``,
      `${payEmoji} **Payment** \`${payLabel}\``,
      `${EMOJIS.briefcase} **Quantity** \`x${totalQty}\``,
      ``,
      `${EMOJIS.chain} **Invoice** \`#${order.code}\``,
      `${EMOJIS.lightbulb} **Customer** \`${maskedCustomer}\``,
      `${EMOJIS.gear} **Sale #** \`#${order.code}\``,
    ].join("\n");

    const embed = {
      author: {
        name: `✦ ORDER COMPLETED`,
      },
      color: 0x8a2be2, // Vibrant purple accent like in screenshot
      description: embedDescription,
      image: {
        url: "attachment://cw-shop-banner.jpg",
      },
      footer: {
        text: "Cw Services • Verified Seller • Fast Delivery",
      },
      timestamp: new Date().toISOString(),
    };

    // Check if local banner image exists to attach directly to Discord webhook
    const bannerPath = path.join(process.cwd(), "public", "images", "cw-shop-banner.jpg");
    let hasBanner = false;
    let bannerBuffer: Buffer | null = null;
    try {
      if (fs.existsSync(bannerPath)) {
        bannerBuffer = fs.readFileSync(bannerPath);
        hasBanner = true;
      }
    } catch {}

    if (hasBanner && bannerBuffer) {
      const formData = new FormData();
      formData.append(
        "payload_json",
        JSON.stringify({
          username: "Cw-Shop Delivery",
          embeds: [embed],
        }),
      );
      formData.append(
        "files[0]",
        new Blob([new Uint8Array(bannerBuffer)], { type: "image/jpeg" }),
        "cw-shop-banner.jpg",
      );

      const res = await fetch(SALES_COMPLETED_WEBHOOK, {
        method: "POST",
        body: formData,
        cache: "no-store",
      });
      return res.ok;
    } else {
      // Fallback without local file attachment
      const res = await fetch(SALES_COMPLETED_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Cw-Shop Delivery",
          embeds: [
            {
              ...embed,
              image: undefined,
            },
          ],
        }),
        cache: "no-store",
      });
      return res.ok;
    }
  } catch (err) {
    console.error("notifySaleDelivered webhook error:", err);
    return false;
  }
}
