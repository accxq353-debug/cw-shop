import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.published, true))
    .orderBy(desc(reviews.createdAt))
    .limit(60);

  return NextResponse.json({
    reviews: rows.map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  await ensureDb();
  const body = (await req.json()) as {
    author?: string;
    body?: string;
    rating?: number;
  };

  const author = (body.author ?? "").trim().slice(0, 40);
  const text = (body.body ?? "").trim().slice(0, 600);
  const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5)));

  if (author.length < 2) {
    return NextResponse.json(
      { error: "Įrašyk vardą (bent 2 simbolius)." },
      { status: 400 },
    );
  }
  if (text.length < 8) {
    return NextResponse.json(
      { error: "Atsiliepimas per trumpas — parašyk bent sakinį." },
      { status: 400 },
    );
  }

  const inserted = await db
    .insert(reviews)
    .values({ author, body: text, rating, published: true })
    .returning();

  const r = inserted[0];
  return NextResponse.json({
    review: {
      id: r.id,
      author: r.author,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt,
    },
  });
}
