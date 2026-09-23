import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { users } from "@/db/schema";
import {
  clearSession,
  createToken,
  currentUser,
  hashPassword,
  setSession,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

type Action = "register" | "login" | "logout" | "me";

const publicUser = (u: {
  id: number;
  email: string;
  name: string;
  role: string;
  discord: string | null;
  createdAt: Date;
}) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  discord: u.discord,
  createdAt: u.createdAt,
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ action: string }> },
) {
  try {
    await ensureDb();
    const { action } = await ctx.params;
    if (action !== "me") {
      return NextResponse.json({ error: "Nežinomas veiksmas." }, { status: 404 });
    }
    const user = await currentUser();
    return NextResponse.json({
      user: user ? publicUser(user) : null,
      token: user ? createToken(user.id) : null,
    });
  } catch (err: unknown) {
    console.error("Auth GET error:", err);
    return NextResponse.json(
      { error: "Serverio klaida: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ action: string }> },
) {
  try {
    await ensureDb();
    const { action } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      name?: string;
      discord?: string;
    };

    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (action === "logout") {
      await clearSession();
      return NextResponse.json({ ok: true, token: null });
    }

    if (action === "register") {
      const name = (body.name ?? "").trim().slice(0, 40);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return NextResponse.json(
          { error: "Įrašyk teisingą el. pašto adresą." },
          { status: 400 },
        );
      }
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Slaptažodis turi būti bent 8 simbolių." },
          { status: 400 },
        );
      }
      if (name.length < 2) {
        return NextResponse.json(
          { error: "Įrašyk vardą (bent 2 simbolius)." },
          { status: 400 },
        );
      }

      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email));
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Toks el. paštas jau registruotas — prisijunk." },
          { status: 409 },
        );
      }

      const inserted = await db
        .insert(users)
        .values({
          email,
          name,
          passwordHash: hashPassword(password),
          role: "customer",
          discord: (body.discord ?? "").trim().slice(0, 80) || null,
        })
        .returning();

      const token = await setSession(inserted[0].id);
      return NextResponse.json({ user: publicUser(inserted[0]), token });
    }

    if (action === "login") {
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      const user = rows[0];
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json(
          { error: "Neteisingas el. paštas arba slaptažodis." },
          { status: 401 },
        );
      }
      const token = await setSession(user.id);
      return NextResponse.json({ user: publicUser(user), token });
    }

    return NextResponse.json({ error: "Nežinomas veiksmas." }, { status: 404 });
  } catch (err: unknown) {
    console.error("Auth POST error:", err);
    return NextResponse.json(
      { error: "Serverio klaida: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 },
    );
  }
}
