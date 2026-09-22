import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDb();
    const rows = await db.execute(sql`SELECT 1 AS ok`);
    return NextResponse.json({
      ok: true,
      db: true,
      service: "cw-shop-api",
      rows: rows.rows.length,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, db: false, error: String(error) },
      { status: 503 },
    );
  }
}
