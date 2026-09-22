import {
  boolean,
  customType,
  integer,
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ackedAt: timestamp("acked_at"),
  decidedAt: timestamp("decided_at"),
  deliveredAt: timestamp("delivered_at"),
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
  author: text("author").notNull(),
  rating: integer("rating").notNull().default(5),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  published: boolean("published").notNull().default(true),
});

export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Proof = typeof proofs.$inferSelect;
export type Review = typeof reviews.$inferSelect;
