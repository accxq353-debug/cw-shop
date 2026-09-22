import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { orderItems, orders, proofs } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { notifyDiscord, orderFields } from "@/lib/discord";
import { productBySlug } from "@/data/catalog";

export const dynamic = "force-dynamic";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  let s = "";
  for (let i = 0; i < 5; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `STG${s}`;
}

type PayloadItem = {
  productSlug: string;
  variantId: string;
  qty: number;
};

export async function POST(req: Request) {
  await ensureDb();
  const user = await currentUser();
  const body = (await req.json()) as {
    sessionKey?: string;
    email?: string;
    discord?: string;
    note?: string;
    method?: string;
    items?: PayloadItem[];
  };

  const sessionKey = (body.sessionKey ?? "").trim().slice(0, 64);
  const email = user
    ? user.email
    : (body.email ?? "").trim().toLowerCase().slice(0, 160);
  const items = Array.isArray(body.items) ? body.items.slice(0, 40) : [];

  if (!sessionKey) {
    return NextResponse.json({ error: "Trūksta sesijos rakto." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Įrašyk teisingą el. pašto adresą — į jį išsiųsime prekę." },
      { status: 400 },
    );
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Krepšelis tuščias." }, { status: 400 });
  }

  const resolved: {
    productSlug: string;
    productName: string;
    variantLabel: string;
    unitCents: number;
    qty: number;
  }[] = [];

  for (const item of items) {
    const product = productBySlug(item.productSlug);
    const variant = product?.variants.find((x) => x.id === item.variantId);
    if (!product || !variant) {
      return NextResponse.json(
        { error: `Prekė nerasta: ${item.productSlug}` },
        { status: 404 },
      );
    }
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
    resolved.push({
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant.label,
      unitCents: variant.priceCents,
      qty,
    });
  }

  const totalCents = resolved.reduce((sum, i) => sum + i.unitCents * i.qty, 0);

  let code = makeCode();
  for (let attempt = 0; attempt < 6; attempt++) {
    const clash = await db
      .select({ code: orders.code })
      .from(orders)
      .where(eq(orders.code, code));
    if (clash.length === 0) break;
    code = makeCode();
  }

  const inserted = await db
    .insert(orders)
    .values({
      code,
      sessionKey,
      userId: user?.id ?? null,
      email,
      discord: (body.discord ?? "").trim().slice(0, 80) || null,
      note: (body.note ?? "").trim().slice(0, 500) || null,
      method: ["paypal", "bank", "ltc"].includes(body.method ?? "")
        ? (body.method as string)
        : null,
      totalCents,
      status: "laukiama",
    })
    .returning();

  const order = inserted[0];

  await db.insert(orderItems).values(
    resolved.map((i) => ({
      orderId: order.id,
      productSlug: i.productSlug,
      productName: i.productName,
      variantLabel: i.variantLabel,
      unitCents: i.unitCents,
      qty: i.qty,
    })),
  );

  await notifyDiscord(
    `🛒 Naujas užsakymas · #${order.code}`,
    orderFields({
      ...order,
      items: resolved,
      status: "laukiama apmokėjimo",
    }),
    "violet",
  );

  return NextResponse.json({
    code: order.code,
    email: order.email,
    totalCents,
    status: order.status,
    createdAt: order.createdAt,
    items: resolved,
    customer: user ? { name: user.name, email: user.email } : null,
  });
}

export async function GET(req: Request) {
  await ensureDb();
  const user = await currentUser();
  const sessionKey = new URL(req.url).searchParams.get("session") ?? "";

  const found = user
    ? await db
        .select()
        .from(orders)
        .where(eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt))
        .limit(50)
    : await db
        .select()
        .from(orders)
        .where(eq(orders.sessionKey, sessionKey))
        .orderBy(desc(orders.createdAt))
        .limit(25);

  if (found.length === 0) return NextResponse.json({ orders: [] });

  const allItems = await db.select().from(orderItems);
  const allProofs = await db
    .select({
      id: proofs.id,
      orderId: proofs.orderId,
      filename: proofs.filename,
      size: proofs.size,
    })
    .from(proofs);

  const payload = found.map((o) => ({
    code: o.code,
    email: o.email,
    discord: o.discord,
    note: o.note,
    totalCents: o.totalCents,
    status: o.status,
    declineReason: o.declineReason,
    adminNote: o.adminNote,
    createdAt: o.createdAt,
    ackedAt: o.ackedAt,
    decidedAt: o.decidedAt,
    method: o.method,
    items: allItems.filter((i) => i.orderId === o.id),
    proofs: allProofs
      .filter((p) => p.orderId === o.id)
      .map((p) => ({ id: p.id, filename: p.filename, size: p.size })),
  }));

  return NextResponse.json({ orders: payload });
}
