import { NextResponse } from "next/server";
import { getAllProducts, getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Prekė nerasta." }, { status: 404 });
    }
    return NextResponse.json({ product });
  }

  const products = await getAllProducts();
  return NextResponse.json({ products });
}
