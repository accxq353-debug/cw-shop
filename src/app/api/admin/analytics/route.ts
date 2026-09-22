import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { orderItems, orders } from "@/db/schema";
import { currentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }

  // 1. Hourly sales velocity (past 24 hours)
  const hourlyRaw = await db.execute(sql`
    SELECT 
      to_char(created_at, 'HH24:00') as hour_label,
      date_trunc('hour', created_at) as hour_bucket,
      count(*)::int as order_count,
      COALESCE(sum(total_cents), 0)::int as total_cents
    FROM orders
    WHERE created_at >= (now() - INTERVAL '24 hours')
    GROUP BY hour_bucket, hour_label
    ORDER BY hour_bucket ASC
  `);

  // 2. Daily sales velocity (past 7 days)
  const dailyRaw = await db.execute(sql`
    SELECT 
      to_char(created_at, 'YYYY-MM-DD') as day_label,
      to_char(created_at, 'Dy') as day_name,
      count(*)::int as order_count,
      COALESCE(sum(CASE WHEN status != 'atmesta' THEN total_cents ELSE 0 END), 0)::int as total_cents
    FROM orders
    WHERE created_at >= (now() - INTERVAL '7 days')
    GROUP BY day_label, day_name
    ORDER BY day_label ASC
  `);

  // 3. Top selling products
  const topProductsRaw = await db.execute(sql`
    SELECT 
      product_name,
      product_slug,
      sum(qty)::int as units_sold,
      sum(unit_cents * qty)::int as total_revenue_cents
    FROM order_items
    GROUP BY product_name, product_slug
    ORDER BY units_sold DESC
    LIMIT 6
  `);

  // 4. Payment method distribution & conversion
  const paymentMethodsRaw = await db.execute(sql`
    SELECT 
      COALESCE(method, 'paypal') as method_name,
      count(*)::int as total_orders,
      sum(CASE WHEN status IN ('patvirtinta', 'ivykdyta') THEN 1 ELSE 0 END)::int as completed_orders,
      sum(CASE WHEN status != 'atmesta' THEN total_cents ELSE 0 END)::int as total_cents
    FROM orders
    GROUP BY method_name
  `);

  // 5. Risk statistics
  const riskStats = await db.execute(sql`
    SELECT 
      count(CASE WHEN risk_score >= 60 THEN 1 END)::int as high_risk_orders,
      count(CASE WHEN risk_score >= 35 AND risk_score < 60 THEN 1 END)::int as medium_risk_orders,
      count(CASE WHEN two_factor_verified = true THEN 1 END)::int as two_factor_orders
    FROM orders
  `);

  return NextResponse.json({
    hourly: hourlyRaw.rows,
    daily: dailyRaw.rows,
    topProducts: topProductsRaw.rows,
    paymentMethods: paymentMethodsRaw.rows,
    risk: riskStats.rows[0] || { high_risk_orders: 0, medium_risk_orders: 0, two_factor_orders: 0 },
  });
}
