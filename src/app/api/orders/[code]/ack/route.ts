import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { orderItems, orders, proofs } from "@/db/schema";
import { notifyDiscord, orderFields } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  await ensureDb();
  const { code } = await ctx.params;

  const existing = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.code, code.toUpperCase()));
  if (existing.length === 0) {
    return NextResponse.json({ error: "Užsakymas nerastas." }, { status: 404 });
  }

  const proofRows = await db
    .select({ id: proofs.id })
    .from(proofs)
    .where(eq(proofs.orderId, existing[0].id));
  if (proofRows.length === 0) {
    return NextResponse.json(
      {
        error:
          "Pirmiausia pridėk mokėjimo įrodymą (ekrano nuotrauką) — be jo mokėjimo patvirtinti negalima.",
      },
      { status: 400 },
    );
  }

  const updated = await db
    .update(orders)
    .set({ status: "mokejimas_pateiktas", ackedAt: new Date() })
    .where(eq(orders.code, code.toUpperCase()))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Užsakymas nerastas." }, { status: 404 });
  }

  const order = updated[0];
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  await notifyDiscord(
    `💳 Klientas teigia sumokėjęs · #${order.code}`,
    [
      { name: "Įrodymas", value: "📎 pridėtas prie ankstesnės žinutės", inline: true },
      ...orderFields({ ...order, items }),
    ],
    "amber",
  );

  return NextResponse.json({ code: order.code, status: order.status });
}
