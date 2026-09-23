import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await ensureDb();
  const { id } = await ctx.params;
  const reviewId = Number(id);

  if (!Number.isFinite(reviewId)) {
    return NextResponse.json({ error: "Neteisingas ID" }, { status: 400 });
  }

  const rows = await db
    .select({
      data: reviews.imageProofData,
      mime: reviews.imageProofMime,
    })
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  const row = rows[0];
  if (!row || !row.data) {
    return NextResponse.json({ error: "Nuotrauka nerasta" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mime || "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
