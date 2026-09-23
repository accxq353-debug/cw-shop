import { NextResponse } from "next/server";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { orders, users } from "@/db/schema";
import { currentAdmin, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureDb();
    const admin = await currentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim();

    const base = db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        discord: users.discord,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(120);

    const found = q
      ? await base.where(
          or(
            ilike(users.email, `%${q}%`),
            ilike(users.name, `%${q}%`),
            ilike(users.discord, `%${q}%`),
          ),
        )
      : await base;

    const ids = found.map((u) => u.id);
    const orderRows = ids.length
      ? await db
          .select({
            userId: orders.userId,
            code: orders.code,
            totalCents: orders.totalCents,
            status: orders.status,
            createdAt: orders.createdAt,
            n: sql<number>`count(*) over (partition by ${orders.userId})::int`,
          })
          .from(orders)
          .where(sql`${orders.userId} IN ${ids}`)
      : [];

    const rows = found.map((u) => {
      const own = orderRows.filter((o) => o.userId === u.id);
      return {
        ...u,
        orderCount: own.length,
        spentCents: own.reduce(
          (sum, o) => (o.status === "atmesta" ? sum : sum + o.totalCents),
          0,
        ),
        orders: own
          .slice(0, 6)
          .map(({ code, totalCents, status, createdAt }) => ({
            code,
            totalCents,
            status,
            createdAt,
          })),
      };
    });

    return NextResponse.json({ users: rows });
  } catch (err: unknown) {
    console.error("Admin users GET error:", err);
    return NextResponse.json(
      { error: "Serverio klaida: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 },
    );
  }
}

// POST: Add new admin or promote existing user by email
export async function POST(req: Request) {
  try {
    await ensureDb();
    const admin = await currentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      name?: string;
      password?: string;
      discord?: string;
    };

    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Įveskite teisingą el. paštą." }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      const u = existing[0];
      if (u.role === "admin") {
        return NextResponse.json({ error: "Šis vartotojas jau yra administratorius." }, { status: 400 });
      }
      // Promote to admin
      const updated = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, u.id))
        .returning();

      return NextResponse.json({
        message: `Vartotojas ${email} sėkmingai paaukštintas į administratorių.`,
        user: updated[0],
      });
    }

    // Create new admin account
    const name = (body.name ?? "").trim() || email.split("@")[0] || "Admin";
    const password = body.password ?? "@Admin" + Math.floor(100000 + Math.random() * 900000);

    const inserted = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash: hashPassword(password),
        role: "admin",
        discord: (body.discord ?? "").trim() || null,
      })
      .returning();

    return NextResponse.json({
      message: `Sukurtas naujas administratorius: ${email}`,
      user: inserted[0],
      temporaryPassword: body.password ? undefined : password,
    });
  } catch (err: unknown) {
    console.error("Admin users POST error:", err);
    return NextResponse.json(
      { error: "Serverio klaida: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 },
    );
  }
}

// PATCH: update role (e.g. demote from admin or change details)
export async function PATCH(req: Request) {
  try {
    await ensureDb();
    const admin = await currentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      userId?: number;
      action?: "promote" | "demote" | "delete";
    };

    const userId = Number(body.userId);
    if (!userId) {
      return NextResponse.json({ error: "Nenurodytas vartotojo ID." }, { status: 400 });
    }

    if (userId === admin.id && (body.action === "demote" || body.action === "delete")) {
      return NextResponse.json({ error: "Negalite pašalinti arba pažeminti savęs." }, { status: 400 });
    }

    if (body.action === "demote") {
      await db
        .update(users)
        .set({ role: "customer" })
        .where(eq(users.id, userId));
      return NextResponse.json({ ok: true, message: "Administratoriaus teisės atimtos." });
    }

    if (body.action === "promote") {
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, userId));
      return NextResponse.json({ ok: true, message: "Vartotojas paskirtas administratoriumi." });
    }

    if (body.action === "delete") {
      await db
        .delete(users)
        .where(eq(users.id, userId));
      return NextResponse.json({ ok: true, message: "Vartotojas ištrintas." });
    }

    return NextResponse.json({ error: "Nežinomas veiksmas." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Admin users PATCH error:", err);
    return NextResponse.json(
      { error: "Serverio klaida: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 },
    );
  }
}
