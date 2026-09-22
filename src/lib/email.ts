import nodemailer from "nodemailer";
import { eur } from "@/data/catalog";
import { SHOP_NAME } from "@/lib/shop";

export type OrderCreationMail = {
  orderCode: string;
  recipientEmail: string;
  recipientName?: string | null;
  items: {
    productName: string;
    variantLabel: string;
    unitCents: number;
    qty: number;
  }[];
  totalCents: number;
  method?: string | null;
  createdAt: Date;
};

export type InvoiceDeliveryMail = {
  orderCode: string;
  recipientEmail: string;
  recipientName?: string | null;
  items: {
    productName: string;
    variantLabel: string;
    unitCents: number;
    qty: number;
  }[];
  totalCents: number;
  method?: string | null;
  deliveredDescription?: string | null;
  deliveredContent?: string | null;
  deliveredAt: Date;
};

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

/**
 * 1. Sent immediately when a customer submits an order (Pre-invoice & payment instructions)
 */
export async function sendOrderCreatedEmail(data: OrderCreationMail): Promise<{ success: boolean; message?: string }> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"${SHOP_NAME}" <no-reply@cw-shop.com>`;

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #2b1e4a; color: #f1ecfd; font-weight: bold;">
          ${item.productName}
          <div style="font-size: 12px; color: #a392c4; font-weight: normal; margin-top: 2px;">${item.variantLabel}</div>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #2b1e4a; color: #a392c4; text-align: center;">
          ${item.qty}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #2b1e4a; color: #b78bff; font-weight: bold; text-align: right;">
          ${eur(item.unitCents * item.qty)}€
        </td>
      </tr>
    `,
    )
    .join("");

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Užsakymo Patvirtinimas #${data.orderCode} · ${SHOP_NAME}</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #09050f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1ecfd;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #150c27; border: 1px solid #2b1e4a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1c1134 0%, #09050f 100%); padding: 26px; border-bottom: 1px solid #2b1e4a; text-align: center;">
        <h1 style="margin: 0; font-size: 26px; color: #b78bff; font-weight: 800; letter-spacing: -0.5px;">${SHOP_NAME}</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #a392c4;">Išankstinė Sąskaita & Užsakymo Patvirtinimas</p>
      </div>

      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <p style="font-size: 16px; margin: 0 0 8px 0;">Sveiki, <strong style="color: #ffffff;">${data.recipientName || data.recipientEmail}</strong>!</p>
          <p style="font-size: 14px; color: #a392c4; margin: 0; line-height: 1.6;">
            Dėkojame, kad perkate pas mus! Jūsų užsakymas <strong style="color: #b78bff; font-family: monospace;">#${data.orderCode}</strong> buvo sėkmingai užregistruotas sistemoje.
          </p>
        </div>

        <!-- ORDER STATUS INFO -->
        <div style="background-color: #0d0817; border: 1px solid #fbbf24; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <div style="font-size: 14px; font-weight: bold; color: #fbbf24; margin-bottom: 6px;">
            ⏳ BŪSENA: LAUKIAMA APMOKĖJIMO & ĮRODYMO
          </div>
          <p style="font-size: 13px; color: #f1ecfd; margin: 0; line-height: 1.5;">
            Kai atliksite mokėjimą ir svetainėje prisekite ekrano nuotrauką (screenshot), mūsų komanda jį rankiniu būdu patvirtins ir <strong>iškart pristatys jūsų prekę čia bei atskiru laišku į šį Gmail</strong>.
          </p>
        </div>

        <!-- INVOICE BREAKDOWN -->
        <div style="margin-top: 24px;">
          <h2 style="font-size: 15px; margin: 0 0 12px 0; color: #b78bff; text-transform: uppercase; letter-spacing: 0.5px;">Užsakymo suvestinė</h2>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
            <tr>
              <td style="color: #a392c4; padding: 5px 0;">Užsakymo kodas:</td>
              <td style="color: #ffffff; font-weight: bold; text-align: right; font-family: monospace;">#${data.orderCode}</td>
            </tr>
            <tr>
              <td style="color: #a392c4; padding: 5px 0;">Data:</td>
              <td style="color: #ffffff; text-align: right;">${data.createdAt.toLocaleString("lt-LT")}</td>
            </tr>
            <tr>
              <td style="color: #a392c4; padding: 5px 0;">Mokėjimo būdas:</td>
              <td style="color: #ffffff; text-align: right;">${data.method ? data.method.toUpperCase() : "PAYPAL"}</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #1c1134; color: #a392c4; font-size: 12px; text-transform: uppercase;">
                <th style="padding: 10px; text-align: left;">Prekė</th>
                <th style="padding: 10px; text-align: center;">Kiekis</th>
                <th style="padding: 10px; text-align: right;">Suma</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 10px; font-weight: bold; font-size: 15px; color: #ffffff;">Mokėtina suma:</td>
                <td style="padding: 16px 10px; font-weight: bold; font-size: 20px; color: #b78bff; text-align: right;">${eur(data.totalCents)}€</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- TRACK ORDER LINK -->
        <div style="margin-top: 26px; text-align: center;">
          <p style="font-size: 13px; color: #a392c4; margin-bottom: 12px;">Savo užsakymo eigą bet kada galite stebėti svetainėje:</p>
          <a href="https://cw-shop.com/uzsakymai" style="display: inline-block; background-color: #b78bff; color: #09050f; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px;">
            Atidaryti mano užsakymą
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #0d0817; padding: 18px; text-align: center; border-top: 1px solid #2b1e4a; font-size: 12px; color: #a392c4;">
        © ${new Date().getFullYear()} ${SHOP_NAME} · Skaitmeninės prekės · Pagalba: Discord serveryje
      </div>
    </div>
  </body>
  </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: data.recipientEmail,
        subject: `Išankstinė Sąskaita #${data.orderCode} - ${SHOP_NAME}`,
        html: emailHtml,
      });
      return { success: true, message: "Užsakymo patvirtinimas išsiųstas į Gmail." };
    } catch (err: unknown) {
      console.error("SMTP order creation mail error:", err);
      return { success: false, message: `SMTP klaida: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  console.log(`[EMAIL DISPATCH] Order created mail dispatched to ${data.recipientEmail} for order #${data.orderCode}`);
  return { success: true, message: "Laiškas sugeneruotas." };
}

/**
 * 2. Sent when admin delivers the product (Product credentials & Complete Paid Invoice)
 */
export async function sendDeliveryInvoiceEmail(data: InvoiceDeliveryMail): Promise<{ success: boolean; message?: string }> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || `"${SHOP_NAME}" <no-reply@cw-shop.com>`;

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #2b1e4a; color: #f1ecfd; font-weight: bold;">
          ${item.productName}
          <div style="font-size: 12px; color: #a392c4; font-weight: normal; margin-top: 2px;">${item.variantLabel}</div>
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #2b1e4a; color: #a392c4; text-align: center;">
          ${item.qty}
        </td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #2b1e4a; color: #b78bff; font-weight: bold; text-align: right;">
          ${eur(item.unitCents * item.qty)}€
        </td>
      </tr>
    `,
    )
    .join("");

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>JŪSŲ PREKĖ IR PILNA SĄSKAITA · #${data.orderCode} · ${SHOP_NAME}</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #09050f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1ecfd;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #150c27; border: 1px solid #2b1e4a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1c1134 0%, #09050f 100%); padding: 26px; border-bottom: 1px solid #2b1e4a; text-align: center;">
        <h1 style="margin: 0; font-size: 26px; color: #b78bff; font-weight: 800; letter-spacing: -0.5px;">${SHOP_NAME}</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #4ade80; font-weight: bold;">✓ MOKĖJIMAS GAUTAS & PREKĖ PRISTATYTA</p>
      </div>

      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <p style="font-size: 16px; margin: 0 0 8px 0;">Sveiki, <strong style="color: #ffffff;">${data.recipientName || data.recipientEmail}</strong>!</p>
          <p style="font-size: 14px; color: #a392c4; margin: 0; line-height: 1.6;">
            Jūsų užsakymas <strong style="color: #b78bff; font-family: monospace;">#${data.orderCode}</strong> buvo sėkmingai patvirtintas ir pilnai įvykdytas. Žemiau rasite savo prekę, prisijungimo duomenis / raktą bei oficialią pirkimo sąskaitą-faktūrą.
          </p>
        </div>

        <!-- DELIVERED PRODUCT BOX -->
        <div style="background-color: #0d0817; border: 2px solid #4ade80; border-radius: 14px; padding: 20px; margin: 24px 0; box-shadow: 0 0 25px rgba(74,222,128,0.15);">
          <div style="font-size: 15px; font-weight: bold; color: #4ade80; margin-bottom: 8px;">
            🎁 JŪSŲ PREKĖ / RAKTAS / PASKYRA:
          </div>
          ${
            data.deliveredDescription
              ? `<p style="font-size: 14px; color: #f1ecfd; margin: 0 0 12px 0; line-height: 1.5;">${data.deliveredDescription}</p>`
              : ""
          }
          <div style="background-color: #000000; border: 1px solid #2b1e4a; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 15px; font-weight: bold; color: #4ade80; word-break: break-all; white-space: pre-wrap; user-select: all;">${
            data.deliveredContent || "(Prekė aktyvuota tiesiogiai į jūsų paskyrą)"
          }</div>
        </div>

        <!-- FULL INVOICE DETAILS -->
        <div style="margin-top: 24px;">
          <h2 style="font-size: 15px; margin: 0 0 12px 0; color: #b78bff; text-transform: uppercase; letter-spacing: 0.5px;">Pilna Sąskaita-Faktūra</h2>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
            <tr>
              <td style="color: #a392c4; padding: 5px 0;">Sąskaitos numeris:</td>
              <td style="color: #ffffff; font-weight: bold; text-align: right; font-family: monospace;">#${data.orderCode}</td>
            </tr>
            <tr>
              <td style="color: #a392c4; padding: 5px 0;">Pristatymo data:</td>
              <td style="color: #ffffff; text-align: right;">${data.deliveredAt.toLocaleString("lt-LT")}</td>
            </tr>
            <tr>
              <td style="color: #a392c4; padding: 5px 0;">Pirkėjas (El. paštas):</td>
              <td style="color: #ffffff; text-align: right;">${data.recipientEmail}</td>
            </tr>
            <tr>
              <td style="color: #a392c4; padding: 5px 0;">Mokėjimo būdas:</td>
              <td style="color: #ffffff; text-align: right;">${data.method ? data.method.toUpperCase() : "PAYPAL"}</td>
            </tr>
            <tr>
              <td style="color: #a392c4; padding: 5px 0;">Mokėjimo būsena:</td>
              <td style="color: #4ade80; font-weight: bold; text-align: right;">APMOKĖTA & ĮVYKDYTA (PAID)</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #1c1134; color: #a392c4; font-size: 12px; text-transform: uppercase;">
                <th style="padding: 10px; text-align: left;">Prekė</th>
                <th style="padding: 10px; text-align: center;">Kiekis</th>
                <th style="padding: 10px; text-align: right;">Suma</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 10px; font-weight: bold; font-size: 15px; color: #ffffff;">Iš viso sumokėta:</td>
                <td style="padding: 16px 10px; font-weight: bold; font-size: 20px; color: #b78bff; text-align: right;">${eur(data.totalCents)}€</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- REVIEW REMINDER -->
        <div style="background-color: #1c1134; border: 1px solid #b78bff; border-radius: 12px; padding: 18px; margin-top: 24px; text-align: center;">
          <div style="font-size: 15px; font-weight: bold; color: #fbbf24; margin-bottom: 6px;">
            ⭐ Įvertinkite mūsų paslaugą svetainėje!
          </div>
          <p style="font-size: 13px; color: #a392c4; margin: 0 0 14px 0; line-height: 1.5;">
            Jūsų atsiliepimas mums labai svarbus! Prašome užeiti į svetainę ir palikti atsiliepimą savo paskyroje arba „Atsiliepimai“ skiltyje.
          </p>
          <a href="https://cw-shop.com/uzsakymai" style="display: inline-block; background-color: #b78bff; color: #09050f; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13px;">
            Palikti atsiliepimą svetainėje
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #0d0817; padding: 18px; text-align: center; border-top: 1px solid #2b1e4a; font-size: 12px; color: #a392c4;">
        © ${new Date().getFullYear()} ${SHOP_NAME} · Skaitmeninės prekės · Ačiū, kad perkate pas mus!
      </div>
    </div>
  </body>
  </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: data.recipientEmail,
        subject: `JŪSŲ PREKĖ IR PILNA SĄSKAITA #${data.orderCode} - ${SHOP_NAME}`,
        html: emailHtml,
      });

      return { success: true, message: "El. laiškas sėkmingai išsiųstas per SMTP." };
    } catch (err: unknown) {
      console.error("SMTP sending error:", err);
      return { success: false, message: `SMTP klaida: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  console.log(`[EMAIL DISPATCH] Invoice & delivery sent to ${data.recipientEmail} for order #${data.orderCode}`);
  return {
    success: true,
    message: "El. laiško siuntimas sugeneruotas.",
  };
}
