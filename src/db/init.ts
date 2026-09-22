import { sql } from "drizzle-orm";
import { db, getPool } from "@/db";
import { ADMIN_EMAIL, ADMIN_PASSWORD, hashPassword } from "@/lib/auth";

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  discord TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  session_key TEXT NOT NULL,
  user_id INTEGER,
  email TEXT NOT NULL,
  discord TEXT,
  note TEXT,
  method TEXT,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'laukiama',
  decline_reason TEXT,
  admin_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  acked_at TIMESTAMP,
  decided_at TIMESTAMP,
  delivered_at TIMESTAMP
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS decided_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

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
  author TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT true
);
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

export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      try {
        // Execute DDL via raw client directly so multi-statement SQL creates all tables in one round-trip
        const p = getPool();
        const client = await p.connect();
        try {
          await client.query(DDL);
        } finally {
          client.release();
        }
        await seedAdmin();
      } catch (err) {
        // Reset ready promise on failure so next request can retry instead of caching failure
        ready = null;
        console.error("ensureDb error:", err);
        throw err;
      }
    })();
  }
  return ready;
}
