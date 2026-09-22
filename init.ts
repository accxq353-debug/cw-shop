import { sql } from "drizzle-orm";
import { db, getPool } from "@/db";
import { ADMIN_EMAIL, ADMIN_PASSWORD, hashPassword } from "@/lib/auth";
import { products as defaultProducts } from "@/data/catalog";

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  discord TEXT,
  discord_id TEXT,
  discord_avatar TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_avatar TEXT;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Prenumerata',
  category TEXT NOT NULL DEFAULT 'prenumeratos',
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  accent TEXT NOT NULL DEFAULT '#b78bff',
  accent2 TEXT NOT NULL DEFAULT '#6d28d9',
  delivery TEXT NOT NULL DEFAULT '1–10 min.',
  badge TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  allowed_methods JSONB DEFAULT '["paypal", "bank", "ltc"]'::jsonb,
  variants JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS allowed_methods JSONB DEFAULT '["paypal", "bank", "ltc"]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  session_key TEXT NOT NULL,
  user_id INTEGER,
  email TEXT NOT NULL,
  discord TEXT,
  discord_id TEXT,
  note TEXT,
  method TEXT,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'laukiama',
  decline_reason TEXT,
  admin_note TEXT,
  delivered_content TEXT,
  delivered_description TEXT,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  risk_score INTEGER DEFAULT 0,
  risk_flags TEXT,
  two_factor_verified BOOLEAN DEFAULT false,
  discord_dm_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  acked_at TIMESTAMP,
  decided_at TIMESTAMP,
  delivered_at TIMESTAMP
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discord_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_content TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_description TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS risk_flags TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS two_factor_verified BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discord_dm_sent BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'high_value_checkout',
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  unit_cents INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS proofs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  author TEXT NOT NULL,
  discord_id TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  body TEXT NOT NULL,
  is_auto BOOLEAN NOT NULL DEFAULT false,
  image_proof_data BYTEA,
  image_proof_mime TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id INTEGER;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS discord_id TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_auto BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_proof_data BYTEA;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_proof_mime TEXT;

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  ticket_number INTEGER NOT NULL UNIQUE,
  channel_id TEXT NOT NULL,
  guild_id TEXT,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  category TEXT NOT NULL,
  product_name TEXT,
  quantity INTEGER DEFAULT 1,
  total_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'open',
  closed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reklamos (
  id SERIAL PRIMARY KEY,
  buyer_discord_id TEXT NOT NULL,
  buyer_username TEXT NOT NULL,
  tier TEXT NOT NULL,
  server_link TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  channel_id TEXT,
  message_id TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_commands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  response TEXT NOT NULL,
  as_embed BOOLEAN NOT NULL DEFAULT true,
  ephemeral BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO settings (key, value) VALUES ('maintenance_mode', 'false') ON CONFLICT (key) DO NOTHING;
`;

let ready: Promise<void> | null = null;

async function seedAdmin() {
  await db.execute(sql`
    INSERT INTO users (email, name, password_hash, role)
    VALUES (${ADMIN_EMAIL}, 'Westas', ${hashPassword(ADMIN_PASSWORD)}, 'admin')
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash, role = 'admin'
  `);
}

async function seedProductsIfEmpty() {
  try {
    const existingCountRes = await db.execute(sql`SELECT count(*) as cnt FROM products`);
    const count = Number(existingCountRes.rows[0]?.cnt || 0);
    if (count === 0) {
      for (const p of defaultProducts) {
        await db.execute(sql`
          INSERT INTO products (slug, brand, name, kind, category, tagline, description, accent, accent2, delivery, badge, featured, allowed_methods, variants, is_active)
          VALUES (
            ${p.slug},
            ${p.brand},
            ${p.name},
            ${p.kind},
            ${p.category},
            ${p.tagline},
            ${p.description},
            ${p.accent},
            ${p.accent2},
            ${p.delivery},
            ${p.badge || null},
            ${p.featured || false},
            ${JSON.stringify(p.allowedMethods || ["paypal", "bank", "ltc"])}::jsonb,
            ${JSON.stringify(p.variants)}::jsonb,
            true
          )
          ON CONFLICT (slug) DO NOTHING
        `);
      }
    }
  } catch (err) {
    console.error("seedProductsIfEmpty error:", err);
  }
}

async function seedCustomCommandsIfEmpty() {
  try {
    const countRes = await db.execute(sql`SELECT count(*) as cnt FROM custom_commands`);
    const cnt = Number(countRes.rows[0]?.cnt || 0);
    if (cnt === 0) {
      await db.execute(sql`
        INSERT INTO custom_commands (name, description, response, as_embed, ephemeral)
        VALUES 
          ('rules', 'Serverio ir pirkimų taisyklės', '1. Pagarba visiems nariams.\n2. Negalima spaminti bilietuose.\n3. Visi mokėjimai atliekami tik per nurodytus Cw-Shop rekvizitus.\n4. Garantija galioja nurodytą terminą.', true, false),
          ('socials', 'Cw-Shop oficialios nuorodos', '🌐 Svetainė: https://cw-shop.com\n👾 Discord: https://discord.gg/asMCPaCKk\n⭐ Atsiliepimai: https://cw-shop.com/atsiliepimai', true, false)
        ON CONFLICT (name) DO NOTHING
      `);
    }
  } catch (err) {
    console.error("seedCustomCommandsIfEmpty error:", err);
  }
}

export async function triggerAutoReviews() {
  try {
    const expiredOrders = await db.execute(sql`
      SELECT o.id, o.code, o.email, u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.status = 'ivykdyta'
        AND o.delivered_at IS NOT NULL
        AND o.delivered_at < (now() - INTERVAL '1 day')
        AND (o.reviewed IS FALSE OR o.reviewed IS NULL)
    `);

    for (const row of expiredOrders.rows as unknown as { id: number; code: string; email: string; user_name: string | null }[]) {
      const displayName = row.user_name || (row.email ? row.email.split("@")[0] : `Pirkėjas #${row.code}`);
      const bodyText = "Puikus ir greitas aptarnavimas! Prekė gauta, viskas veikia nepriekaištingai.";

      await db.execute(sql`
        INSERT INTO reviews (order_id, author, rating, body, is_auto, published, created_at)
        VALUES (${row.id}, ${displayName}, 5, ${bodyText}, true, true, now())
      `);

      await db.execute(sql`
        UPDATE orders
        SET reviewed = true
        WHERE id = ${row.id}
      `);
    }
  } catch (err) {
    console.error("Auto reviews error:", err);
  }
}

export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      try {
        const p = getPool();
        const client = await p.connect();
        try {
          await client.query(DDL);
        } finally {
          client.release();
        }
        await seedAdmin();
        await seedProductsIfEmpty();
        await seedCustomCommandsIfEmpty();
      } catch (err) {
        ready = null;
        console.error("ensureDb error:", err);
        throw err;
      }
    })();
  }
  return ready;
}
