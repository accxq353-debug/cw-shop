import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { orders, proofs } from "@/db/schema";
import { currentAdmin, currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await ensureDb();
  const { id } = await ctx.params;
  const proofId = Number(id);
  if (!Number.isFinite(proofId)) {
    return NextResponse.json({ error: "Neteisingas ID." }, { status: 400 });
  }

  const admin = await currentAdmin();
  const user = await currentUser();

  const rows = await db.select().from(proofs).where(eq(proofs.id, proofId));
  const proof = rows[0];
  if (!proof) {
    return NextResponse.json({ error: "Įrodymas nerastas." }, { status: 404 });
  }

  if (!admin) {
    const owns = user
      ? await db
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.id, proof.orderId))
      : [];
    const order = owns[0];
    const allowed = user && order && (await ownerMatches(order.id, user.id));
    if (!allowed) {
      return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
    }
  }

  return new NextResponse(new Uint8Array(proof.data), {
    headers: {
      "Content-Type": proof.mime,
      "Content-Length": String(proof.size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}

async function ownerMatches(orderId: number, userId: number) {
  const rows = await db
    .select({ userId: orders.userId })
    .from(orders)
    .where(eq(orders.id, orderId));
  return rows[0]?.userId === userId;
}
