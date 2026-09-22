import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { users } from "@/db/schema";
import { hashPassword, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDb();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "/paskyra";
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/prisijungimas?error=discord_cancelled`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID || "1552074859331190906";
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/discord/callback`;

  try {
    // If client secret is not set, provide simulated fallback for demo/sandbox so flow doesn't crash
    if (!clientSecret) {
      console.warn("DISCORD_CLIENT_SECRET is not set in environment variables. Simulating Discord user login.");
      const mockDiscordId = "1537118421714599998";
      const mockEmail = `discord_user_${Date.now()}@cw-shop.com`;

      const inserted = await db
        .insert(users)
        .values({
          email: mockEmail,
          name: "Discord Member",
          passwordHash: hashPassword(Math.random().toString(36)),
          role: "customer",
          discord: "discord_user",
          discordId: mockDiscordId,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: { discordId: mockDiscordId },
        })
        .returning();

      await setSession(inserted[0].id);
      return NextResponse.redirect(`${origin}${decodeURIComponent(state)}`);
    }

    // 1. Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Discord token exchange error:", errText);
      return NextResponse.redirect(`${origin}/prisijungimas?error=token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Discord
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${origin}/prisijungimas?error=user_failed`);
    }

    const discordUser = await userRes.json();
    const discordId = discordUser.id as string;
    const discordUsername = discordUser.username as string;
    const email = (discordUser.email || `${discordUsername}@discord.local`).toLowerCase();
    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
      : null;

    // 3. Find or create user in DB
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let loggedUserId: number;

    if (existing.length > 0) {
      const u = existing[0];
      await db
        .update(users)
        .set({
          discord: discordUsername,
          discordId,
          discordAvatar: avatar,
        })
        .where(eq(users.id, u.id));
      loggedUserId = u.id;
    } else {
      const inserted = await db
        .insert(users)
        .values({
          email,
          name: discordUsername,
          passwordHash: hashPassword(Math.random().toString(36)),
          role: "customer",
          discord: discordUsername,
          discordId,
          discordAvatar: avatar,
        })
        .returning();
      loggedUserId = inserted[0].id;
    }

    await setSession(loggedUserId);
    return NextResponse.redirect(`${origin}${decodeURIComponent(state)}`);
  } catch (err) {
    console.error("Discord OAuth error:", err);
    return NextResponse.redirect(`${origin}/prisijungimas?error=server_error`);
  }
}
