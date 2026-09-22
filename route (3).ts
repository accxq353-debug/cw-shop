import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { productsTable } from "@/db/schema";
import { currentAdmin } from "@/lib/auth";
import { type Product } from "@/data/catalog";

export const dynamic = "force-dynamic";

async function guardAdmin() {
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }
  return null;
}

// GET all products for admin
export async function GET() {
  await ensureDb();
  const denied = await guardAdmin();
  if (denied) return denied;

  const list = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.id));

  return NextResponse.json({ products: list });
}

// POST create new product
export async function POST(req: Request) {
  await ensureDb();
  const denied = await guardAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as Partial<Product> & {
      allowedMethods?: string[];
    };

    if (!body.name || !body.brand || !body.slug) {
      return NextResponse.json({ error: "Užpildykite pavadinimą, prekės ženklą ir unikalų slug." }, { status: 400 });
    }

    if (!Array.isArray(body.variants) || body.variants.length === 0) {
      return NextResponse.json({ error: "Produktas privalo turėti bent vieną variantą su kaina." }, { status: 400 });
    }

    // Ensure slug uniqueness
    const existing = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.slug, body.slug.trim().toLowerCase()));

    if (existing.length > 0) {
      return NextResponse.json({ error: "Produktas su šiuo identifikatoriumi (slug) jau egzistuoja." }, { status: 400 });
    }

    const inserted = await db
      .insert(productsTable)
      .values({
        slug: body.slug.trim().toLowerCase(),
        brand: body.brand.trim(),
        name: body.name.trim(),
        kind: body.kind || "Prenumerata",
        category: body.category || "prenumeratos",
        tagline: body.tagline || "",
        description: body.description || "",
        accent: body.accent || "#b78bff",
        accent2: body.accent2 || "#6d28d9",
        delivery: body.delivery || "1–10 min.",
        badge: body.badge || null,
        featured: Boolean(body.featured),
        allowedMethods: body.allowedMethods && body.allowedMethods.length > 0 ? body.allowedMethods : ["paypal", "bank", "ltc"],
        variants: body.variants,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ product: inserted[0] });
  } catch (err: unknown) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// PATCH update existing product (price, variants, name, allowedMethods, active status)
export async function PATCH(req: Request) {
  await ensureDb();
  const denied = await guardAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      id?: number;
      slug?: string;
      brand?: string;
      name?: string;
      kind?: string;
      category?: string;
      tagline?: string;
      description?: string;
      accent?: string;
      accent2?: string;
      delivery?: string;
      badge?: string | null;
      featured?: boolean;
      allowedMethods?: string[];
      variants?: { id: string; label: string; priceCents: number; unit?: string }[];
      isActive?: boolean;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Nenurodytas produkto ID." }, { status: 400 });
    }

    const patch: Partial<typeof productsTable.$inferInsert> = {};
    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.brand !== undefined) patch.brand = body.brand.trim();
    if (body.kind !== undefined) patch.kind = body.kind;
    if (body.category !== undefined) patch.category = body.category;
    if (body.tagline !== undefined) patch.tagline = body.tagline;
    if (body.description !== undefined) patch.description = body.description;
    if (body.accent !== undefined) patch.accent = body.accent;
    if (body.accent2 !== undefined) patch.accent2 = body.accent2;
    if (body.delivery !== undefined) patch.delivery = body.delivery;
    if (body.badge !== undefined) patch.badge = body.badge;
    if (body.featured !== undefined) patch.featured = body.featured;
    if (body.allowedMethods !== undefined) patch.allowedMethods = body.allowedMethods;
    if (body.variants !== undefined) patch.variants = body.variants;
    if (body.isActive !== undefined) patch.isActive = body.isActive;

    const updated = await db
      .update(productsTable)
      .set(patch)
      .where(eq(productsTable.id, body.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Produktas nerastas." }, { status: 404 });
    }

    return NextResponse.json({ product: updated[0] });
  } catch (err: unknown) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: Request) {
  await ensureDb();
  const denied = await guardAdmin();
  if (denied) return denied;

  try {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Nenurodytas produkto ID." }, { status: 400 });
    }

    await db
      .delete(productsTable)
      .where(eq(productsTable.id, id));

    return NextResponse.json({ ok: true, message: "Produktas pašalintas." });
  } catch (err: unknown) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
