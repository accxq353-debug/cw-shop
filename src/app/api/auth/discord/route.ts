import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectTarget = url.searchParams.get("redirect") || "/paskyra";

  const clientId = process.env.DISCORD_CLIENT_ID || "1552074859331190906";
  const origin = url.origin;
  const redirectUri = encodeURIComponent(`${origin}/api/auth/discord/callback`);
  const state = encodeURIComponent(redirectTarget);

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email&state=${state}`;

  return NextResponse.redirect(discordAuthUrl);
}
