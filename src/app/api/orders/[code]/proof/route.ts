import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { orders, proofs } from "@/db/schema";
import { SHOP_NAME } from "@/lib/shop";
import { WEBHOOK_URL } from "@/lib/discord";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

export async function POST(
  req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  await ensureDb();
  const { code } = await ctx.params;

  const found = await db
    .select({ id: orders.id, email: orders.email, totalCents: orders.totalCents })
    .from(orders)
    .where(eq(orders.code, code.toUpperCase()));

  const order = found[0];
  if (!order) {
    return NextResponse.json({ error: "Užsakymas nerastas." }, { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Nepasirinkai failo." },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Failas tuščias." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Failas per didelis (maks. 8 MB)." },
      { status: 400 },
    );
  }
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.includes(mime)) {
    return NextResponse.json(
      { error: "Priimamos tik PNG, JPG, WEBP, GIF arba PDF nuotraukos." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = (file.name || "irodymas.png").slice(0, 120);

  const inserted = await db
    .insert(proofs)
    .values({
      orderId: order.id,
      filename,
      mime,
      size: bytes.length,
      data: bytes,
    })
    .returning({
      id: proofs.id,
      filename: proofs.filename,
      mime: proofs.mime,
      size: proofs.size,
      createdAt: proofs.createdAt,
    });

  // Attach the screenshot itself to the Discord webhook message.
  try {
    const payload = new FormData();
    payload.append(
      "payload_json",
      JSON.stringify({
        username: SHOP_NAME,
        embeds: [
          {
            title: `🧾 Mokėjimo įrodymas · #${code.toUpperCase()}`,
            color: 0xb78bff,
            fields: [
              { name: "Užsakymas", value: `#${code.toUpperCase()}`, inline: true },
              {
                name: "Suma",
                value: `${(order.totalCents / 100).toFixed(2)}€`,
                inline: true,
              },
              { name: "El. paštas", value: order.email, inline: true },
              { name: "Failas", value: filename, inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: `${SHOP_NAME} · įrodymas` },
            image: { url: `attachment://${filename}` },
          },
        ],
      }),
    );
    payload.append(
      "files[0]",
      new Blob([new Uint8Array(bytes)], { type: mime }),
      filename,
    );
    await fetch(WEBHOOK_URL, { method: "POST", body: payload });
  } catch {
    // webhook gedimai neturi stabdyti užsakymo
  }

  return NextResponse.json({ proof: inserted[0] });
}
