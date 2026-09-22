import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Fetches live LTC and USDT prices against EUR with reliable fallback
export async function GET() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=litecoin,tether&vs_currencies=eur", {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ltcEur: data?.litecoin?.eur || 75.5,
        usdtEur: data?.tether?.eur || 0.95,
        timestamp: Date.now(),
      });
    }
  } catch {
    // fallback if external API is rate-limited
  }

  return NextResponse.json({
    ltcEur: 75.5,
    usdtEur: 0.95,
    timestamp: Date.now(),
  });
}
