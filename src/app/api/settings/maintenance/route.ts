import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { settings } from "@/db/schema";
import { currentAdmin } from "@/lib/auth";
import { sendMaintenanceAnnouncement } from "@/lib/discord-bot";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return NextResponse.json({
    maintenance: map["maintenance_mode"] === "true",
    targetDate: map["maintenance_until"] || null,
  });
}

export async function POST(req: Request) {
  await ensureDb();
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    enabled?: boolean;
    hours?: number;
    minutes?: number;
    seconds?: number;
    targetIso?: string;
  };
  const val = body.enabled ? "true" : "false";

  await db
    .insert(settings)
    .values({ key: "maintenance_mode", value: val })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: val, updatedAt: new Date() },
    });

  let targetIso = body.targetIso;
  if (!targetIso && body.enabled) {
    const totalMs =
      ((body.hours ?? 1) * 3600 +
        (body.minutes ?? 45) * 60 +
        (body.seconds ?? 0)) *
      1000;
    targetIso = new Date(Date.now() + Math.max(1000, totalMs)).toISOString();
  }

  if (targetIso) {
    await db
      .insert(settings)
      .values({ key: "maintenance_until", value: targetIso })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: targetIso, updatedAt: new Date() },
      });
  }

  // Notify Discord announcement channel with @everyone and the maintenance timer
  await sendMaintenanceAnnouncement(
    body.hours ?? 1,
    body.minutes ?? 45,
    body.seconds ?? 0,
    val === "true"
  );

  return NextResponse.json({
    maintenance: val === "true",
    targetDate: targetIso || null,
  });
}
