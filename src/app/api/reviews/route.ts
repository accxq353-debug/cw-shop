import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb, triggerAutoReviews } from "@/db/init";
import { orders, reviews } from "@/db/schema";
import { notifyDiscord } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  await triggerAutoReviews();

  const rows = await db
    .select({
      id: reviews.id,
      author: reviews.author,
      rating: reviews.rating,
      body: reviews.body,
      isAuto: reviews.isAuto,
      hasImageProof: reviews.imageProofMime,
      createdAt: reviews.createdAt,
    })
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
      isAuto: r.isAuto,
      hasImage: Boolean(r.hasImageProof),
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  await ensureDb();

  let author = "";
  let text = "";
  let rating = 5;
  let orderCode = "";
  let imageBytes: Buffer | null = null;
  let imageMime: string | null = null;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "Klaidingi formos duomenys." }, { status: 400 });
    }
    author = (form.get("author")?.toString() ?? "").trim().slice(0, 40);
    text = (form.get("body")?.toString() ?? "").trim().slice(0, 600);
    rating = Math.max(1, Math.min(5, Math.round(Number(form.get("rating")) || 5)));
    orderCode = (form.get("orderCode")?.toString() ?? "").trim().toUpperCase();

    const file = form.get("imageProof");
    if (file && file instanceof File && file.size > 0) {
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "Nuotrauka per didelė (maks. 8 MB)." }, { status: 400 });
      }
      imageBytes = Buffer.from(await file.arrayBuffer());
      imageMime = file.type || "image/png";
    }
  } else {
    const body = (await req.json().catch(() => ({}))) as {
      author?: string;
      body?: string;
      rating?: number;
      orderCode?: string;
    };
    author = (body.author ?? "").trim().slice(0, 40);
    text = (body.body ?? "").trim().slice(0, 600);
    rating = Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5)));
    orderCode = (body.orderCode ?? "").trim().toUpperCase();
  }

  if (author.length < 2) {
    return NextResponse.json(
      { error: "Įrašyk vardą (bent 2 simbolius)." },
      { status: 400 },
    );
  }
  if (text.length < 5) {
    return NextResponse.json(
      { error: "Atsiliepimas per trumpas — parašyk bent kelis žodžius." },
      { status: 400 },
    );
  }

  let matchedOrderId: number | null = null;
  if (orderCode) {
    const matched = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.code, orderCode));
    if (matched.length > 0) {
      matchedOrderId = matched[0].id;
      await db
        .update(orders)
        .set({ reviewed: true })
        .where(eq(orders.id, matchedOrderId));
    }
  }

  const inserted = await db
    .insert(reviews)
    .values({
      orderId: matchedOrderId,
      author,
      body: text,
      rating,
      isAuto: false,
      imageProofData: imageBytes,
      imageProofMime: imageMime,
      published: true,
    })
    .returning({
      id: reviews.id,
      author: reviews.author,
      rating: reviews.rating,
      body: reviews.body,
      isAuto: reviews.isAuto,
      createdAt: reviews.createdAt,
    });

  const r = inserted[0];

  await notifyDiscord(
    `⭐ Naujas atsiliepimas svetainėje (${rating}/5)`,
    [
      { name: "Autorius", value: author, inline: true },
      { name: "Įvertinimas", value: `${"⭐".repeat(rating)} (${rating}/5)`, inline: true },
      ...(orderCode ? [{ name: "Užsakymas", value: `#${orderCode}`, inline: true }] : []),
      ...(imageBytes ? [{ name: "Foto įrodymas", value: "📸 Klientas prisegė ekrano nuotrauką!", inline: false }] : []),
      { name: "Tekstas", value: text, inline: false },
    ],
    "violet",
  );

  return NextResponse.json({
    review: {
      id: r.id,
      author: r.author,
      rating: r.rating,
      body: r.body,
      isAuto: r.isAuto,
      hasImage: Boolean(imageBytes),
      createdAt: r.createdAt,
    },
  });
}
