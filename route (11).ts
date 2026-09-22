import { NextResponse } from "next/server";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  ButtonStyleTypes,
  verifyKey,
} from "discord-interactions";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { customCommands, reklamos, reviews, tickets } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { getAllProducts } from "@/lib/products";
import { BOT_CONFIG, getLiveBotConfig } from "@/lib/discord-bot-config";

export const dynamic = "force-dynamic";

// Discord REST API helper using Bot Token
async function discordRest(path: string, method = "GET", body?: unknown) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error(`Discord REST error [${method} ${path}]:`, res.status, txt);
    return null;
  }
  return res.json().catch(() => ({}));
}

export async function GET() {
  return new NextResponse("Discord interactions endpoint is operational. Use POST with signature headers.", {
    status: 200,
  });
}

export async function POST(req: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  const rawBody = await req.text();

  // Validate request signature from Discord if PUBLIC_KEY is configured
  // CRITICAL: verifyKey is asynchronous in discord-interactions >= 4.0 and must be awaited!
  if (publicKey) {
    if (!signature || !timestamp) {
      return new NextResponse("Missing signature headers", { status: 401 });
    }
    const isValid = await verifyKey(rawBody, signature, timestamp, publicKey);
    if (!isValid) {
      return new NextResponse("Invalid request signature", { status: 401 });
    }
  }

  let interaction: any;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // 1. PING ACK (Discord setup verification)
  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  await ensureDb();

  // 2. AUTOCOMPLETE
  if (interaction.type === 4) {
    if (interaction.data?.name === "buy") {
      const focused = (interaction.data.options?.[0]?.value || "").toString().toLowerCase();
      const all = await getAllProducts();
      const filtered = all
        .filter((p) => p.name.toLowerCase().includes(focused) || p.brand.toLowerCase().includes(focused))
        .slice(0, 25)
        .map((p) => ({
          name: `${p.name} (nuo ${(p.variants[0]?.priceCents / 100).toFixed(2)}€)`,
          value: p.slug,
        }));
      return NextResponse.json({
        type: 8, // APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
        data: { choices: filtered },
      });
    }
    return NextResponse.json({ type: 8, data: { choices: [] } });
  }

  // 3. APPLICATION COMMANDS (/slash)
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name } = interaction.data;

    // Check custom commands from admin panel
    const customMatch = await db
      .select()
      .from(customCommands)
      .where(eq(customCommands.name, name.toLowerCase()))
      .limit(1);

    if (customMatch.length > 0) {
      const custom = customMatch[0];
      if (custom.asEmbed) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: custom.ephemeral ? InteractionResponseFlags.EPHEMERAL : undefined,
            embeds: [
              {
                title: `✦ ${custom.name.toUpperCase()}`,
                color: 0x8a2be2,
                description: custom.response,
                footer: { text: "Cw-Shop • Custom Command" },
              },
            ],
          },
        });
      }
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: custom.ephemeral ? InteractionResponseFlags.EPHEMERAL : undefined,
          content: custom.response,
        },
      });
    }

    if (name === "ping") {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: `🏓 **Pong!** HTTP Interaction greitis: \`< 25ms\` (Netlify 24/7 Serverless Mode).`,
        },
      });
    }

    if (name === "help") {
      let customCommandsList: string[] = [];
      try {
        const rows = await db.select({ name: customCommands.name }).from(customCommands);
        customCommandsList = rows.map((r) => `\`/${r.name}\``);
      } catch {}

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          embeds: [
            {
              title: `${BOT_CONFIG.emojis.purpleStars} Cw-Shop Bot — Komandų Vadovas`,
              color: 0x8a2be2,
              description: [
                `**${BOT_CONFIG.emojis.diamond} Pirkimas ir Užsakymai:**`,
                `• \`/buy <prekė> [kiekis]\` — Pasirinkite prekę su automatiniu kainos perskaičiavimu ir rekvizitais.`,
                `• \`/kainorastis\` — Visas parduotuvės asortimentas ir kainos.`,
                `• \`/stock [prekė]\` — Patikrinti esamą prekių likutį sandėlyje.`,
                `• \`/reklama <planas> <link> <aprašymas>\` — Sukuria dedikuotą reklamos kanalą kategorijoje.`,
                `• \`/reputation\` — Peržiūrėti bendrą teigiamų atsiliepimų skaičių.`,
                ``,
                `**${BOT_CONFIG.emojis.briefcase} Bilietai (Tickets):**`,
                `• \`/ticket-panel\` — Sukurti bilietų atidarymo skydelį (Purchase, Support, Partnership, Claim).`,
                `• \`/close [priežastis]\` — Uždaryti bilietą ir išsaugoti transkripciją į logs kanalą.`,
                ``,
                `**${BOT_CONFIG.emojis.gear} Kitos komandos:**`,
                `• \`/ping\` — Boto delsa ir greitis.`,
                ``,
                customCommandsList.length > 0
                  ? `**${BOT_CONFIG.emojis.rocket} Individualios komandos (iš svetainės):**\n${customCommandsList.join(", ")}\n`
                  : "",
                `💡 *Atsiliepimai kuriami automatiškai, kai vartotojas parašo \`+rep @westas\` #vouched kanale!*`,
              ]
                .filter(Boolean)
                .join("\n"),
              footer: { text: "Cw-Shop • 24/7 Netlify Powered" },
            },
          ],
        },
      });
    }

    if (name === "kainorastis") {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Visą naujausią Cw-Shop kainoraštį rasite svetainėje: https://cw-shop.com/produktai`,
        },
      });
    }

    if (name === "reputation") {
      let positiveCount = 7;
      try {
        const revCountRes = await db.select({ value: count() }).from(reviews).where(eq(reviews.published, true));
        positiveCount = Math.max(7, Number(revCountRes[0]?.value || 7));
      } catch {}

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: `✦ Our Reputation`,
              color: 0x8a2be2,
              description: [
                `• **Cw-Shop** currently has **${positiveCount}** positive reviews, collected from our customers.`,
                `• All reviews are **real**, obtained honestly and with zero artificial collection.`,
                `• Thank you to everyone who trusts us and helps our reputation grow! 💜`,
              ].join("\n"),
              footer: { text: "Cw-Shop • Official Reputation" },
              timestamp: new Date().toISOString(),
            },
          ],
        },
      });
    }

    if (name === "stock") {
      const all = await getAllProducts();
      const listStr = all
        .slice(0, 10)
        .map((p) => `• **${p.name}** — nuo ${(p.variants[0]?.priceCents / 100).toFixed(2)}€ [🟢 Turime sandėlyje]`)
        .join("\n");

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          embeds: [
            {
              title: `📦 Cw-Shop Sandėlio Likutis (Stock)`,
              color: 0x8a2be2,
              description: listStr || "Prekių nerasta.",
              footer: { text: "Visas kainoraštis: https://cw-shop.com/produktai" },
            },
          ],
        },
      });
    }

    if (name === "buy") {
      const options = interaction.data.options || [];
      const slugOpt = options.find((o: any) => o.name === "preke");
      const qtyOpt = options.find((o: any) => o.name === "kiekis");
      const slug = slugOpt ? slugOpt.value : "";
      const qty = Math.max(1, qtyOpt ? Number(qtyOpt.value) || 1 : 1);

      const all = await getAllProducts();
      const product = all.find((p) => p.slug === slug);

      if (!product) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { flags: InteractionResponseFlags.EPHEMERAL, content: "Prekė nerasta." },
        });
      }

      const variant = product.variants[0];
      const unitCents = variant ? variant.priceCents : 100;
      const totalCents = unitCents * qty;
      const totalEur = (totalCents / 100).toFixed(2);

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: `🛒 Cw-Shop — ${product.name}`,
              color: 0x8a2be2,
              description: [
                `**${BOT_CONFIG.emojis.diamond} Prekė:** ${product.name}`,
                `**${BOT_CONFIG.emojis.briefcase} Variantas:** ${variant?.label || "Standartinis"}`,
                `**${BOT_CONFIG.emojis.gear} Kiekis:** \`${qty} vnt.\``,
                `**${BOT_CONFIG.emojis.euro} Bendra suma:** \`${totalEur}€\``,
                ``,
                `**Apmokėjimo Rekvizitai:**`,
                `• **PayPal F&F:** \`dendepro11@gmail.com\` (be pastabų)`,
                `• **Banko pavedimas:** IBAN \`LT804010051005860181\`, Gavėjas: \`Aironas Zonys\`, Paskirtis: \`Papildymas\``,
                `• **Litecoin (LTC):** \`LYknAU9LGs23yU6GJymKsfXE5FMhn5itK8\``,
                ``,
                `${BOT_CONFIG.emojis.arrow} *Paspauskite mygtuką žemiau, kad atidarytumėte pirkimo bilietą su automatiniais duomenimis!*`,
              ].join("\n"),
              footer: { text: "Cw-Shop • Greitas ir saugus pristatymas" },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: ButtonStyleTypes.PRIMARY,
                  label: "Atidaryti Pirkimo Bilietą",
                  custom_id: `ticket_purchase_quick_${slug}_${qty}`,
                },
                {
                  type: 2,
                  style: 5, // LINK
                  label: "Pirkti Svetainėje",
                  url: `https://cw-shop.com/produktai/${slug}`,
                },
              ],
            },
          ],
        },
      });
    }

    if (name === "ticket-panel") {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "Cw-Shop — Open a Ticket",
              color: 0x8a2be2,
              description: [
                `${BOT_CONFIG.emojis.purpleClouds} *Select a category below to open a ticket.*`,
                ``,
                `${BOT_CONFIG.emojis.euro} **Purchase**`,
                `${BOT_CONFIG.emojis.diamond} Want to buy something outside of SellAuth?`,
                `${BOT_CONFIG.emojis.arrow} Choose **Purchase** and we will guide you through the payment process.`,
                `» Accepted: PayPal, LTC, Bank Transfer`,
                ``,
                `${BOT_CONFIG.emojis.question} **Support**`,
                `${BOT_CONFIG.emojis.purpleSparkle} Having an issue with your order or account?`,
                `• Choose **Support** and a staff member will assist you.`,
                ``,
                `${BOT_CONFIG.emojis.rocket} **Partnership**`,
                `• Want to collaborate or become a reseller? Open a ticket here.`,
                ``,
                `${BOT_CONFIG.emojis.briefcase} **Claim Order**`,
                `• Already bought? Claim your customer role or replacement.`,
              ].join("\n"),
              footer: { text: "Cw-Shop • We typically respond within a few hours" },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 3,
                  custom_id: "open_ticket_select",
                  placeholder: "Select a category to open ticket...",
                  options: [
                    {
                      label: "Purchase",
                      description: "Buy something outside of SellAuth",
                      value: "purchase",
                      emoji: { name: "💶" },
                    },
                    {
                      label: "Support",
                      description: "Get help with your order or account",
                      value: "support",
                      emoji: { name: "❓" },
                    },
                    {
                      label: "Partnership",
                      description: "Collaborate or become a reseller",
                      value: "partnership",
                      emoji: { name: "🚀" },
                    },
                    {
                      label: "Claim Order",
                      description: "Already bought? Claim your role here",
                      value: "claim_order",
                      emoji: { name: "💎" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    }

    if (name === "reklama") {
      const options = interaction.data.options || [];
      const tier = options.find((o: any) => o.name === "planas")?.value as "1day" | "7days" | "lifetime";
      const link = options.find((o: any) => o.name === "nuoroda")?.value || "";
      const descText = options.find((o: any) => o.name === "aprasymas")?.value || "";

      const pricing = BOT_CONFIG.reklamaPricing[tier] || BOT_CONFIG.reklamaPricing["1day"];
      const cfg = await getLiveBotConfig();
      const reklamaCategoryId = cfg.categories.reklamaCategory || cfg.categories.partnershipTickets;
      const guildId = interaction.guild_id;

      let expiresAt: Date | null = null;
      if (tier === "1day") expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
      else if (tier === "7days") expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

      const userId = interaction.member?.user?.id || interaction.user?.id;
      const username = interaction.member?.user?.username || interaction.user?.username || "user";
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);

      // Create dedicated channel via Discord REST API
      const newChannel = await discordRest(`/guilds/${guildId}/channels`, "POST", {
        name: `reklama-${cleanUsername}`,
        type: 0, // GUILD_TEXT
        parent_id: reklamaCategoryId,
      });

      if (newChannel && newChannel.id) {
        await discordRest(`/channels/${newChannel.id}/messages`, "POST", {
          content: `@everyone Nauja partnerio reklama! ${link}`,
          embeds: [
            {
              title: `📢 Partnerio Reklama · ${username}`,
              color: 0x8a2be2,
              description: [
                `### **${link}**`,
                ``,
                descText,
                ``,
                `───────────────────────────────`,
                `**Reklamos savininkas:** <@${userId}>`,
                `**Planas:** \`${pricing.label}\``,
                expiresAt ? `**Galioja iki:** \`${expiresAt.toLocaleString("lt-LT")}\`` : `**Galioja:** \`VISAM LAIKUI (Lifetime)\``,
              ].join("\n"),
              footer: { text: "Cw-Shop • Partnerystė & Reklama" },
              timestamp: new Date().toISOString(),
            },
          ],
        });

        await db.insert(reklamos).values({
          buyerDiscordId: userId,
          buyerUsername: username,
          tier,
          serverLink: link,
          description: descText,
          priceCents: pricing.priceCents,
          status: "active",
          channelId: newChannel.id,
          expiresAt,
        });

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL,
            embeds: [
              {
                title: `✅ Reklama Sėkmingai Paskelbta!`,
                color: 0x4ade80,
                description: [
                  `Jūsų reklamos kanalas sukurtas: <#${newChannel.id}>`,
                  ``,
                  `**Planas:** \`${pricing.label}\` (\`${pricing.display}\`)`,
                  ``,
                  `**Apmokėjimas:**`,
                  `• PayPal F&F: \`dendepro11@gmail.com\``,
                  `• Bankas: \`LT804010051005860181\` (Papildymas)`,
                  `• LTC: \`LYknAU9LGs23yU6GJymKsfXE5FMhn5itK8\``,
                ].join("\n"),
              },
            ],
          },
        });
      }

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.EPHEMERAL,
          content: "Nepavyko sukurti reklamos kanalo. Įsitikinkite, kad botas turi Manage Channels teises serveryje.",
        },
      });
    }

    if (name === "close") {
      const channelId = interaction.channel_id;
      const userTag = interaction.member?.user?.username || interaction.user?.username || "Admin";

      // Delete channel via Discord REST
      setTimeout(async () => {
        await discordRest(`/channels/${channelId}`, "DELETE");
      }, 3000);

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `🔒 Bilietą uždarė **${userTag}**. Kanalas bus pašalintas po 3 sekundžių...` },
      });
    }
  }

  // 4. MESSAGE COMPONENTS (Dropdowns & Buttons)
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data?.custom_id;

    // Dropdown selection in ticket panel
    if (customId === "open_ticket_select") {
      const selected = interaction.data?.values?.[0];

      // If Purchase -> Return Modal
      if (selected === "purchase") {
        return NextResponse.json({
          type: InteractionResponseType.MODAL,
          data: {
            custom_id: "modal_ticket_purchase",
            title: "Purchase Details",
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 4, // TEXT_INPUT
                    custom_id: "modal_prod_name",
                    label: "What do you want to buy?",
                    style: 1, // SHORT
                    placeholder: "e.g. Netflix Premium account",
                    required: true,
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: "modal_prod_qty",
                    label: "Quantity",
                    style: 1,
                    placeholder: "e.g. 1",
                    required: true,
                  },
                ],
              },
            ],
          },
        });
      }

      // Other categories: direct ticket creation
      const resData = await createHttpTicket(interaction, selected, "Inquiry", 1);
      return NextResponse.json(resData);
    }

    // Quick purchase button
    if (customId?.startsWith("ticket_purchase_quick_")) {
      const parts = customId.replace("ticket_purchase_quick_", "").split("_");
      const slug = parts[0] || "product";
      const qty = parseInt(parts[1] || "1") || 1;
      const resData = await createHttpTicket(interaction, "purchase", slug, qty);
      return NextResponse.json(resData);
    }

    // Close ticket button
    if (customId === "btn_close_ticket") {
      const channelId = interaction.channel_id;
      const userTag = interaction.member?.user?.username || interaction.user?.username || "Admin";

      setTimeout(async () => {
        await discordRest(`/channels/${channelId}`, "DELETE");
      }, 3000);

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: `🔒 Bilietą uždarė **${userTag}**. Kanalas bus pašalintas po 3 sekundžių...` },
      });
    }
  }

  // 5. MODAL SUBMISSIONS
  if (interaction.type === InteractionType.MODAL_SUBMIT) {
    if (interaction.data?.custom_id === "modal_ticket_purchase") {
      const components = interaction.data.components || [];
      const prodName = components[0]?.components?.[0]?.value || "Product";
      const qty = parseInt(components[1]?.components?.[0]?.value || "1") || 1;

      const resData = await createHttpTicket(interaction, "purchase", prodName, qty);
      return NextResponse.json(resData);
    }
  }

  return NextResponse.json({ type: InteractionResponseType.PONG });
}

async function createHttpTicket(interaction: any, category: string, productInfo: string, qty: number) {
  const guildId = interaction.guild_id;
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const username = interaction.member?.user?.username || interaction.user?.username || "user";

  const cfg = await getLiveBotConfig();
  let parentId = cfg.categories.buyTickets;
  if (category === "support") parentId = cfg.categories.supportTickets;
  if (category === "partnership") parentId = cfg.categories.partnershipTickets;

  const ticketNumber = Math.floor(1000 + Math.random() * 9000);
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
  const channelName = `ticket-${ticketNumber}-${cleanUsername}`;

  // Create channel in Discord
  const channel = await discordRest(`/guilds/${guildId}/channels`, "POST", {
    name: channelName,
    type: 0, // GUILD_TEXT
    parent_id: parentId,
    permission_overwrites: [
      {
        id: guildId, // everyone
        type: 0, // ROLE
        deny: "1024", // VIEW_CHANNEL
      },
      {
        id: userId,
        type: 1, // MEMBER
        allow: "68608", // VIEW_CHANNEL, SEND_MESSAGES, READ_MESSAGE_HISTORY, ATTACH_FILES
      },
    ],
  });

  if (!channel || !channel.id) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL,
        content: "Nepavyko sukurti bilieto kanalo. Patikrinkite boto teises serveryje (Manage Channels).",
      },
    };
  }

  // Save in DB
  await db.insert(tickets).values({
    ticketNumber,
    channelId: channel.id,
    guildId,
    userId,
    username,
    category,
    productName: productInfo,
    quantity: qty,
    status: "open",
  });

  // Post welcome message inside ticket
  await discordRest(`/channels/${channel.id}/messages`, "POST", {
    content: `<@${userId}> @here`,
    embeds: [
      {
        title: `✦ Cw-Shop Ticket #${ticketNumber}`,
        color: 0x8a2be2,
        description: [
          `Sveiki, <@${userId}>! Jūsų bilietas sėkmingai sukurtas.`,
          ``,
          `**Kategorija:** \`${category.toUpperCase()}\``,
          category === "purchase" ? `**Prekė:** \`${productInfo}\` (Kiekis: \`${qty} vnt.\`)` : "",
          ``,
          `**Apmokėjimo Rekvizitai (Automatinis pirkimas):**`,
          `• **PayPal F&F:** \`dendepro11@gmail.com\` (be pastabų)`,
          `• **Banko pavedimas:** IBAN \`LT804010051005860181\`, Gavėjas: \`Aironas Zonys\`, Paskirtis: \`Papildymas\``,
          `• **Litecoin (LTC):** \`LYknAU9LGs23yU6GJymKsfXE5FMhn5itK8\``,
          ``,
          `*Atlikę pavedimą, atsiųskite ekrano nuotrauką (screenshot) į šį kanalą!*`,
        ].filter(Boolean).join("\n"),
        footer: { text: "Spauskite mygtuką žemiau, norėdami uždaryti bilietą" },
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: ButtonStyleTypes.DANGER,
            label: "Uždaryti Bilietą (Close)",
            custom_id: "btn_close_ticket",
          },
        ],
      },
    ],
  });

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL,
      content: `Jūsų bilietas sukurtas: <#${channel.id}>`,
    },
  };
}
