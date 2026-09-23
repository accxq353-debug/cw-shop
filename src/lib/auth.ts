import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "westaswestas61@gmail.com";
export const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "@Westusss18378234";

const SECRET = process.env.SESSION_SECRET ?? "cw-shop-session-secret-2026";
export const SESSION_COOKIE = "dt_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createToken(userId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: string | undefined): number | null {
  if (!token) return null;
  const trimmed = token.trim().replace(/^Bearer\s+/i, "");
  const [payload, sig] = trimmed.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { uid?: number; exp?: number };
    if (!data.uid || !data.exp || data.exp < Date.now()) return null;
    return data.uid;
  } catch {
    return null;
  }
}

export async function setSession(userId: number): Promise<string> {
  const jar = await cookies();
  const token = createToken(userId);
  const secure = process.env.NODE_ENV === "production";
  
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: secure ? "none" : "lax",
    secure,
    path: "/",
    maxAge: MAX_AGE,
  });
  return token;
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function currentUser(): Promise<User | null> {
  let uid: number | null = null;
  
  // 1. Try cookie
  try {
    const jar = await cookies();
    uid = readToken(jar.get(SESSION_COOKIE)?.value);
  } catch {}

  // 2. Try header fallbacks (x-dt-token or Authorization: Bearer <token>)
  if (!uid) {
    try {
      const hdrs = await headers();
      uid = readToken(hdrs.get("x-dt-token") ?? undefined);
      if (!uid) {
        const authHeader = hdrs.get("authorization");
        if (authHeader) {
          uid = readToken(authHeader);
        }
      }
    } catch {}
  }
  
  if (!uid) return null;

  try {
    const rows = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error("currentUser db query error:", err);
    return null;
  }
}

export async function currentAdmin(): Promise<User | null> {
  const user = await currentUser();
  return user && user.role === "admin" ? user : null;
}
