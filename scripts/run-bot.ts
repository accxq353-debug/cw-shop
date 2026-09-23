import dotenv from "dotenv";
dotenv.config();

import { initDiscordBot } from "../src/lib/discord-bot";
import { ensureDb } from "../src/db/init";
import { getLiveBotConfig } from "../src/lib/discord-bot-config";

async function main() {
  console.log("==================================================");
  console.log("       ✦ Cw-Shop 24/7 Discord Bot Daemon ✦        ");
  console.log("==================================================");

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error("❌ KLAIDA: DISCORD_BOT_TOKEN nėra nustatytas!");
    console.error("Prašome nurodyti DISCORD_BOT_TOKEN aplinkos kintamuosiuose.");
    process.exit(1);
  }

  try {
    console.log("📦 Tikrinama duomenų bazės struktūra...");
    await ensureDb();
    console.log("✓ Duomenų bazė paruošta ir sinchronizuota.");

    const config = await getLiveBotConfig();
    console.log("⚙️  Boto nustatymai iš duomenų bazės:");
    console.log(`   • Vouch kanalas: ${config.vouchChannelId}`);
    console.log(`   • Transcripts: ${config.transcriptChannelId}`);
    console.log(`   • Pranešimai: ${config.announceChannelId}`);
    console.log(`   • Pirkimų bilietai: ${config.categories.buyTickets}`);
    console.log(`   • Pagalbos bilietai: ${config.categories.supportTickets}`);
    console.log(`   • Partnerystės bilietai: ${config.categories.partnershipTickets}`);
    console.log(`   • Reklamos kategorija: ${config.categories.reklamaCategory}`);

    console.log("🤖 Jungiamasi prie Discord...");
    const client = await initDiscordBot();

    if (!client) {
      console.error("❌ Nepavyko inicijuoti Discord kliento.");
      process.exit(1);
    }

    console.log("✨ Cw-Shop Discord Bot veikia 24/7 rėžimu!");
    console.log("• Automatinis +rep atpažinimas aktyvus.");
    console.log("• Bilietų sistema ir modalai aktyvūs.");
    console.log("• /reklama kanalo kūrimas aktyvus.");
    console.log("• Pirkimų DM pristatymas paruoštas.");

    // Keep process alive and handle graceful shutdown
    const handleExit = async (signal: string) => {
      console.log(`\n🛑 Gautas ${signal} signalas. Uždarymas...`);
      try {
        await client.destroy();
      } catch {}
      process.exit(0);
    };

    process.on("SIGINT", () => handleExit("SIGINT"));
    process.on("SIGTERM", () => handleExit("SIGTERM"));
  } catch (err) {
    console.error("❌ Fatali paleidimo klaida:", err);
    process.exit(1);
  }
}

void main();
