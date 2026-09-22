import {
  boolean,
  customType,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"),
  discord: text("discord"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull().default("Prenumerata"),
  category: text("category").notNull().default("prenumeratos"),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  accent: text("accent").notNull().default("#b78bff"),
  accent2: text("accent2").notNull().default("#6d28d9"),
  delivery: text("delivery").notNull().default("1–10 min."),
  badge: text("badge"),
  featured: boolean("featured").notNull().default(false),
  allowedMethods: json("allowed_methods").$type<string[]>().default(["paypal", "bank", "ltc"]),
  variants: json("variants").$type<{ id: string; label: string; priceCents: number; unit?: string; strikeLabel?: string }[]>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  sessionKey: text("session_key").notNull(),
  userId: integer("user_id"),
  email: text("email").notNull(),
  discord: text("discord"),
  note: text("note"),
  method: text("method"),
  totalCents: integer("total_cents").notNull(),
  status: text("status").notNull().default("laukiama"),
  declineReason: text("decline_reason"),
  adminNote: text("admin_note"),
  deliveredContent: text("delivered_content"),
  deliveredDescription: text("delivered_description"),
  reviewed: boolean("reviewed").notNull().default(false),
  ipAddress: text("ip_address"),
  riskScore: integer("risk_score").default(0),
  riskFlags: text("risk_flags"),
  twoFactorVerified: boolean("two_factor_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ackedAt: timestamp("acked_at"),
  decidedAt: timestamp("decided_at"),
  deliveredAt: timestamp("delivered_at"),
});

export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  purpose: text("purpose").notNull().default("high_value_checkout"),
  used: boolean("used").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  variantLabel: text("variant_label").notNull(),
  unitCents: integer("unit_cents").notNull(),
  qty: integer("qty").notNull().default(1),
});

export const proofs = pgTable("proofs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id"),
  author: text("author").notNull(),
  rating: integer("rating").notNull().default(5),
  body: text("body").notNull(),
  isAuto: boolean("is_auto").notNull().default(false),
  imageProofData: bytea("image_proof_data"),
  imageProofMime: text("image_proof_mime"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  published: boolean("published").notNull().default(true),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type DbProduct = typeof productsTable.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Proof = typeof proofs.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type VerificationCode = typeof verificationCodes.$inferSelect;
