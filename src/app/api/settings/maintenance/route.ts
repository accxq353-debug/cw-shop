import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { settings } from "@/db/schema";
import { currentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const row = await db.select().from(settings).where(eq(settings.key, "maintenance_mode")).limit(1);
  return NextResponse.json({ maintenance: row[0]?.value === "true" });
}

export async function POST(req: Request) {
  await ensureDb();
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { enabled?: boolean };
  const val = body.enabled ? "true" : "false";

  await db
    .insert(settings)
    .values({ key: "maintenance_mode", value: val })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: val, updatedAt: new Date() },
    });

  return NextResponse.json({ maintenance: val === "true" });
}
