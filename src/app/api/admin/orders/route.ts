import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb, triggerAutoReviews } from "@/db/init";
import { orderItems, orders, proofs, users } from "@/db/schema";
import { currentAdmin } from "@/lib/auth";
import { notifyDiscord, notifySaleDelivered, orderFields } from "@/lib/discord";
import { sendDeliveryInvoiceEmail } from "@/lib/email";
import { sendOrderDeliveryDm } from "@/lib/discord-bot";

export const dynamic = "force-dynamic";

async function guard() {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }
  return null;
}

export async function GET(req: Request) {
  await ensureDb();
  await triggerAutoReviews();
  const denied = await guard();
  if (denied) return denied;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const status = (url.searchParams.get("status") ?? "").trim();

  const filters: SQL[] = [];
  if (status) filters.push(eq(orders.status, status));
  if (q) {
    const like = `%${q}%`;
    const match = or(
      ilike(orders.code, like),
      ilike(orders.email, like),
      ilike(orders.discord, like),
      ilike(orders.note, like),
      ilike(orders.adminNote, like),
      ilike(users.name, like),
    );
    if (match) filters.push(match);
  }

  const base = db
    .select({
      order: orders,
      userName: users.name,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(120);

  const found = filters.length
    ? await base.where(and(...filters))
    : await base;

  const ids = found.map((r) => r.order.id);
  const items = ids.length
    ? await db
        .select()
        .from(orderItems)
        .where(sql`${orderItems.orderId} IN ${ids}`)
    : [];

  const proofRows = ids.length
    ? await db
        .select({
          id: proofs.id,
          orderId: proofs.orderId,
          filename: proofs.filename,
          mime: proofs.mime,
          size: proofs.size,
          createdAt: proofs.createdAt,
        })
        .from(proofs)
        .where(sql`${proofs.orderId} IN ${ids}`)
    : [];

  const rows = found.map((r) => ({
    ...r.order,
    userName: r.userName,
    items: items.filter((i) => i.orderId === r.order.id),
    proofs: proofRows.filter((p) => p.orderId === r.order.id),
  }));

  const counts = await db
    .select({ status: orders.status, n: sql<number>`count(*)::int` })
    .from(orders)
    .groupBy(orders.status);

  return NextResponse.json({
    orders: rows,
    counts: counts.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = c.n;
      return acc;
    }, {}),
  });
}

export async function PATCH(req: Request) {
  await ensureDb();
  const denied = await guard();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    code?: string;
    action?: string;
    reason?: string;
    note?: string;
    deliveredContent?: string;
    deliveredDescription?: string;
  };

  const code = (body.code ?? "").trim().toUpperCase();
  const action = body.action ?? "";
  const now = new Date();

  const patch: Partial<typeof orders.$inferInsert> = {};

  if (action === "confirm") {
    patch.status = "patvirtinta";
    patch.decidedAt = now;
    patch.declineReason = null;
  } else if (action === "decline") {
    patch.status = "atmesta";
    patch.decidedAt = now;
    patch.declineReason = (body.reason ?? "Kita").slice(0, 160);
  } else if (action === "deliver" || action === "fulfill") {
    patch.status = "ivykdyta";
    patch.deliveredAt = now;
    patch.declineReason = null;
    if (body.deliveredContent !== undefined) {
      patch.deliveredContent = body.deliveredContent;
    }
    if (body.deliveredDescription !== undefined) {
      patch.deliveredDescription = body.deliveredDescription;
    }
  } else if (action === "reopen") {
    patch.status = "laukiama";
    patch.declineReason = null;
    patch.decidedAt = null;
    patch.deliveredAt = null;
  } else if (action === "note") {
    patch.adminNote = (body.note ?? "").slice(0, 500);
  } else {
    return NextResponse.json({ error: "Nežinomas veiksmas." }, { status: 400 });
  }

  const updated = await db
    .update(orders)
    .set(patch)
    .where(eq(orders.code, code))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Užsakymas nerastas." }, { status: 404 });
  }

  const order = updated[0];
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const proofList = await db
    .select({
      id: proofs.id,
      orderId: proofs.orderId,
      filename: proofs.filename,
      mime: proofs.mime,
      size: proofs.size,
      createdAt: proofs.createdAt,
    })
    .from(proofs)
    .where(eq(proofs.orderId, order.id));

  const mail = { ...order, items };
  const fields = orderFields(mail);

  if (action === "confirm") {
    await notifyDiscord(
      `✅ Mokėjimas patvirtintas · #${order.code}`,
      fields,
      "green",
    );
  } else if (action === "decline") {
    await notifyDiscord(
      `⛔ Mokėjimas atmestas · #${order.code}`,
      [{ name: "Priežastis", value: patch.declineReason ?? "—" }, ...fields],
      "red",
    );
  } else if (action === "deliver" || action === "fulfill") {
    const extraFields = [
      ...fields,
      ...(order.deliveredDescription
        ? [{ name: "Pristatymo aprašymas", value: order.deliveredDescription, inline: false }]
        : []),
      ...(order.deliveredContent
        ? [{ name: "Pristatytas produktas / raktas / paskyra", value: `||${order.deliveredContent.slice(0, 500)}||`, inline: false }]
        : []),
    ];
    await notifyDiscord(
      `🎁 Prekė pristatyta klientui · #${order.code}`,
      extraFields,
      "violet",
    );

    // Dedicated Sales Webhook: Logs ONLY fully completed & delivered sales with custom emojis & banner
    await notifySaleDelivered({
      code: order.code,
      email: order.email,
      method: order.method,
      totalCents: order.totalCents,
      items: items.map((it) => ({
        productName: it.productName,
        variantLabel: it.variantLabel,
        unitCents: it.unitCents,
        qty: it.qty,
      })),
    });

    // Send invoice and delivered product by email to recipient
    await sendDeliveryInvoiceEmail({
      orderCode: order.code,
      recipientEmail: order.email,
      items: items.map((it) => ({
        productName: it.productName,
        variantLabel: it.variantLabel,
        unitCents: it.unitCents,
        qty: it.qty,
      })),
      totalCents: order.totalCents,
      method: order.method,
      deliveredDescription: order.deliveredDescription,
      deliveredContent: order.deliveredContent,
      deliveredAt: order.deliveredAt || new Date(),
    });

    // If customer logged in with Discord or provided their Discord ID, deliver product directly to their Discord DMs!
    if (order.discordId) {
      const dmOk = await sendOrderDeliveryDm(order.discordId, {
        code: order.code,
        deliveredDescription: order.deliveredDescription,
        deliveredContent: order.deliveredContent,
        totalCents: order.totalCents,
      });

      if (dmOk) {
        await db
          .update(orders)
          .set({ discordDmSent: true })
          .where(eq(orders.id, order.id));
      }
    }
  }

  return NextResponse.json({
    order: { ...order, items, proofs: proofList },
  });
}
