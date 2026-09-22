import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { productsTable } from "@/db/schema";
import { products as staticProducts, type Product } from "@/data/catalog";

export async function getAllProducts(): Promise<Product[]> {
  try {
    await ensureDb();
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.isActive, true));

    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        brand: r.brand,
        name: r.name,
        kind: r.kind as Product["kind"],
        category: r.category as Product["category"],
        tagline: r.tagline,
        description: r.description,
        accent: r.accent,
        accent2: r.accent2,
        delivery: r.delivery,
        badge: r.badge || undefined,
        featured: r.featured,
        allowedMethods: r.allowedMethods || ["paypal", "bank", "ltc"],
        isActive: r.isActive,
        variants: r.variants as Product["variants"],
      }));
    }
  } catch (err) {
    console.error("Error fetching products from DB, using fallback:", err);
  }

  return staticProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    await ensureDb();
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug))
      .limit(1);

    if (rows.length > 0 && rows[0].isActive) {
      const r = rows[0];
      return {
        id: r.id,
        slug: r.slug,
        brand: r.brand,
        name: r.name,
        kind: r.kind as Product["kind"],
        category: r.category as Product["category"],
        tagline: r.tagline,
        description: r.description,
        accent: r.accent,
        accent2: r.accent2,
        delivery: r.delivery,
        badge: r.badge || undefined,
        featured: r.featured,
        allowedMethods: r.allowedMethods || ["paypal", "bank", "ltc"],
        isActive: r.isActive,
        variants: r.variants as Product["variants"],
      };
    }
  } catch (err) {
    console.error("Error fetching product by slug from DB:", err);
  }

  return staticProducts.find((p) => p.slug === slug);
}
