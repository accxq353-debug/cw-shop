import { NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { verificationCodes } from "@/db/schema";
import nodemailer from "nodemailer";
import { SHOP_NAME } from "@/lib/shop";
import { notifyDiscord } from "@/lib/discord";

export const dynamic = "force-dynamic";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

// POST: Request or verify 2FA code
export async function POST(req: Request) {
  await ensureDb();
  const body = (await req.json().catch(() => ({}))) as {
    action?: "request" | "verify";
    email?: string;
    code?: string;
    orderTotalCents?: number;
  };

  const email = (body.email ?? "").trim().toLowerCase();
  const action = body.action || "request";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Nurodykite teisingą el. pašto adresą." }, { status: 400 });
  }

  // 1. Send/Generate code
  if (action === "request") {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await db.insert(verificationCodes).values({
      email,
      code,
      purpose: "high_value_checkout",
      expiresAt,
    });

    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || `"${SHOP_NAME}" <no-reply@cw-shop.com>`;

    if (transporter) {
      try {
        await transporter.sendMail({
          from,
          to: email,
          subject: `${code} yra jūsų 2FA saugumo patvirtinimo kodas - ${SHOP_NAME}`,
          html: `
            <div style="font-family: sans-serif; background-color: #09050f; color: #f1ecfd; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #2b1e4a;">
              <h2 style="color: #b78bff; margin-top: 0;">${SHOP_NAME} Saugumo Patvirtinimas</h2>
              <p>Gavome jūsų didelės vertės užsakymo užklausą. Norėdami tęsti, suveskite šį 6 skaitmenų 2FA patvirtinimo kodą:</p>
              <div style="background-color: #150c27; border: 1px solid #b78bff; border-radius: 8px; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; font-family: monospace; letter-spacing: 4px; color: #4ade80;">
                ${code}
              </div>
              <p style="font-size: 13px; color: #a392c4; margin-top: 16px;">Kodas galioja 10 minučių. Jei neužsakinėjote, praneškite mūsų Discord administracijai.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("2FA SMTP error:", err);
      }
    } else {
      console.log(`[2FA DISPATCH] Security code for ${email}: ${code}`);
    }

    // Also notify Discord audit channel
    await notifyDiscord(
      `🔐 Sugeneruotas 2FA kodas didelės vertės užsakymui`,
      [
        { name: "Pirkėjas", value: email, inline: true },
        { name: "Suma", value: body.orderTotalCents ? `${(body.orderTotalCents / 100).toFixed(2)}€` : "Didelė vertė", inline: true },
        { name: "Kodas (Audit)", value: `||${code}||`, inline: true },
      ],
      "amber",
    );

    return NextResponse.json({
      ok: true,
      message: "2FA patvirtinimo kodas išsiųstas į jūsų el. paštą.",
      // In development / demo when SMTP is not configured, provide preview code so buyer isn't blocked
      devCode: transporter ? undefined : code,
    });
  }

  // 2. Verify code
  if (action === "verify") {
    const code = (body.code ?? "").trim();
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Įveskite 6 skaitmenų kodą." }, { status: 400 });
    }

    const validRecord = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.used, false),
          gt(verificationCodes.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(verificationCodes.createdAt))
      .limit(1);

    if (validRecord.length === 0) {
      return NextResponse.json({ error: "Neteisingas arba pasibaigusio galiojimo 2FA kodas." }, { status: 400 });
    }

    // Mark as used
    await db
      .update(verificationCodes)
      .set({ used: true })
      .where(eq(verificationCodes.id, validRecord[0].id));

    return NextResponse.json({
      verified: true,
      message: "2FA sėkmingai patvirtinta! Galite tęsti apmokėjimą.",
    });
  }

  return NextResponse.json({ error: "Nežinomas veiksmas." }, { status: 400 });
}
