import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { getDiscordBotClient, initDiscordBot } from "@/lib/discord-bot";
import { getLiveBotConfig } from "@/lib/discord-bot-config";
import { db } from "@/db";
import { settings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }

  const client = getDiscordBotClient();
  const tokenConfigured = Boolean(process.env.DISCORD_BOT_TOKEN);
  const cfg = await getLiveBotConfig();

  return NextResponse.json({
    online: Boolean(client?.isReady()),
    userTag: client?.user?.tag || null,
    tokenConfigured,
    guildsCount: client?.guilds.cache.size || 0,
    config: cfg,
  });
}

export async function POST(req: Request) {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    action?: "start" | "save_config";
    vouchChannelId?: string;
    transcriptChannelId?: string;
    announceChannelId?: string;
    buyTickets?: string;
    supportTickets?: string;
    partnershipTickets?: string;
  };

  if (body.action === "save_config") {
    const keys: [string, string | undefined][] = [
      ["bot_vouch_channel", body.vouchChannelId],
      ["bot_transcript_channel", body.transcriptChannelId],
      ["bot_announce_channel", body.announceChannelId],
      ["bot_cat_buy", body.buyTickets],
      ["bot_cat_support", body.supportTickets],
      ["bot_cat_partnership", body.partnershipTickets],
    ];

    for (const [k, v] of keys) {
      if (v) {
        await db
          .insert(settings)
          .values({ key: k, value: v })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: v, updatedAt: new Date() },
          });
      }
    }

    const updatedCfg = await getLiveBotConfig();
    return NextResponse.json({
      ok: true,
      message: "Boto kanalų ir kategorijų nustatymai sėkmingai išsaugoti!",
      config: updatedCfg,
    });
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error: "DISCORD_BOT_TOKEN nėra nurodytas aplinkos kintamuosiuose (.env / Netlify).",
        tokenConfigured: false,
      },
      { status: 400 }
    );
  }

  const client = await initDiscordBot();
  return NextResponse.json({
    online: Boolean(client?.isReady()),
    userTag: client?.user?.tag || null,
    message: client?.isReady() ? "Botas sėkmingai paleistas ir veikia serveryje!" : "Botas jungiasi...",
  });
}
