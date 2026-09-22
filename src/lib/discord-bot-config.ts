import { db } from "@/db";
import { settings } from "@/db/schema";

export const DEFAULT_BOT_CONFIG = {
  vouchChannelId: "1537118421714599998",
  transcriptChannelId: "1537121548211720222",
  logsChannelId: "1537121548211720222",
  announceChannelId: "1537119243823353906",
  reklamaChannelId: "1538722110967382056",

  categories: {
    buyTickets: "1537121405936730223",
    supportTickets: "1538723924261478530",
    partnershipTickets: "1538722110967382056",
    reklamaCategory: "1538722110967382056", // Dedicated category where new reklama channels are created!
  },

  emojis: {
    arrow: "<a:Animated_Arrow_Purple:1549082377350029323>",
    briefcase: "<a:PurpleBriefcase:1549081974596182067>",
    chain: "<a:PurpleChain:1549081815132803254>",
    diamond: "<a:PurpleDiamond:1547623213142384752>",
    euro: "<a:PurpleEuro:1549437135671664855>",
    gear: "<a:PurpleGear:1549081880127610920>",
    lightbulb: "<a:PurpleLightbulb:1549081930325172406>",
    question: "<a:PurpleQuestionMark:1549082031667941480>",
    rocket: "<a:PurpleRocket:1549437206483963955>",
    starsss: "<:Starsss:1547625262294892614>",
    ltc: "<:emojigg_Ltc:1547623406122438707>",
    paypal: "<:paypal:1547623327810588704>",
    purpleStars: "<a:purple:1549437415423352884>",
    purpleClouds: "<a:purpleclouds:1549441228293283972>",
    purpleSparkle: "<a:purple:1549437538807324683>",
  },

  reklamaPricing: {
    "1day": { label: "1 Diena (24h)", priceCents: 200, display: "2.00€" },
    "7days": { label: "7 Dienos (1 Savaitė)", priceCents: 600, display: "6.00€" },
    "lifetime": { label: "Lifetime (Visam laikui)", priceCents: 1500, display: "15.00€" },
  },
};

export let BOT_CONFIG = { ...DEFAULT_BOT_CONFIG };

export async function getLiveBotConfig() {
  try {
    const rows = await db.select().from(settings);
    const map = new Map(rows.map((r) => [r.key, r.value]));

    BOT_CONFIG = {
      ...DEFAULT_BOT_CONFIG,
      vouchChannelId: map.get("bot_vouch_channel") || DEFAULT_BOT_CONFIG.vouchChannelId,
      transcriptChannelId: map.get("bot_transcript_channel") || DEFAULT_BOT_CONFIG.transcriptChannelId,
      logsChannelId: map.get("bot_logs_channel") || DEFAULT_BOT_CONFIG.logsChannelId,
      announceChannelId: map.get("bot_announce_channel") || DEFAULT_BOT_CONFIG.announceChannelId,
      reklamaChannelId: map.get("bot_reklama_channel") || DEFAULT_BOT_CONFIG.reklamaChannelId,
      categories: {
        buyTickets: map.get("bot_cat_buy") || DEFAULT_BOT_CONFIG.categories.buyTickets,
        supportTickets: map.get("bot_cat_support") || DEFAULT_BOT_CONFIG.categories.supportTickets,
        partnershipTickets: map.get("bot_cat_partnership") || DEFAULT_BOT_CONFIG.categories.partnershipTickets,
        reklamaCategory: map.get("bot_cat_reklama") || DEFAULT_BOT_CONFIG.categories.reklamaCategory,
      },
    };
  } catch {
    // fallback
  }
  return BOT_CONFIG;
}
