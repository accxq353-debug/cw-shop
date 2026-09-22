import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/init";
import { customCommands } from "@/db/schema";
import { currentAdmin } from "@/lib/auth";
import { registerSlashCommands } from "@/lib/discord-bot";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }

  const list = await db
    .select()
    .from(customCommands)
    .orderBy(desc(customCommands.id));

  return NextResponse.json({ commands: list });
}

export async function POST(req: Request) {
  await ensureDb();
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      description?: string;
      response?: string;
      asEmbed?: boolean;
      ephemeral?: boolean;
    };

    const cleanName = (body.name || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const cleanDesc = (body.description || "").trim().slice(0, 100);
    const cleanResp = (body.response || "").trim().slice(0, 2000);

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { error: "Komandos pavadinimas turi būti nuo 2 iki 32 simbolių (tik raidės, skaičiai, brūkšniai)." },
        { status: 400 }
      );
    }

    if (!cleanDesc) {
      return NextResponse.json({ error: "Įveskite komandos aprašymą." }, { status: 400 });
    }

    if (!cleanResp) {
      return NextResponse.json({ error: "Įveskite komandos atsakymo tekstą." }, { status: 400 });
    }

    const existing = await db
      .select({ id: customCommands.id })
      .from(customCommands)
      .where(eq(customCommands.name, cleanName));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Komanda /${cleanName} jau egzistuoja! Pasirinkite kitą pavadinimą.` },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(customCommands)
      .values({
        name: cleanName,
        description: cleanDesc,
        response: cleanResp,
        asEmbed: body.asEmbed ?? true,
        ephemeral: body.ephemeral ?? false,
      })
      .returning();

    // Re-register slash commands with Discord API automatically so the command appears instantly
    await registerSlashCommands();

    return NextResponse.json({
      ok: true,
      message: `Komanda /${cleanName} sėkmingai sukurta ir užregistruota Discord'e!`,
      command: inserted[0],
    });
  } catch (err: unknown) {
    console.error("Custom command create error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await ensureDb();
  const admin = await currentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nėra prieigos." }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = Number(url.searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "Nenurodytas komandos ID." }, { status: 400 });
    }

    await db.delete(customCommands).where(eq(customCommands.id, id));

    // Refresh active commands on Discord
    await registerSlashCommands();

    return NextResponse.json({ ok: true, message: "Komanda ištrinta ir pašalinta iš Discord." });
  } catch (err: unknown) {
    console.error("Custom command delete error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
