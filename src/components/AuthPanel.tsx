"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { storeToken, useUser, type SessionUser } from "@/lib/useUser";

export default function AuthPanel({
  onDone,
  redirectTo,
  compact = false,
}: {
  onDone?: (user: SessionUser) => void;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { setUser } = useUser();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [discord, setDiscord] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, discord }),
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Serverio klaida (${res.status}): ${text.slice(0, 100) || "Tuščias atsakymas"}`);
      }
      if (!res.ok) throw new Error((data.error as string) ?? "Nepavyko prisijungti.");
      const logged = data.user as SessionUser;
      storeToken((data.token as string) ?? null);
      setUser(logged);
      if (onDone) onDone(logged);
      else router.push(redirectTo ?? "/paskyra");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko prisijungti.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "" : "panel rounded-2xl p-7"}>
      <div className="flex gap-1 rounded-xl border border-line bg-void p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[13.5px] transition-colors ${
              mode === m
                ? "bg-white/[0.08] font-semibold text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {m === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
            {m === "login" ? "Prisijungti" : "Registruotis"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6">
        {mode === "register" ? (
          <>
            <label className="micro block text-muted/70">Vardas</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tavo vardas"
              className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
            />
          </>
        ) : null}

        <label className="micro mt-4 block text-muted/70">El. paštas</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vardas@pastas.lt"
          className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
        />

        <label className="micro mt-4 block text-muted/70">Slaptažodis</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
        />

        {mode === "register" ? (
          <>
            <label className="micro mt-4 block text-muted/70">
              Discord vardas <span className="text-muted/40">(nebūtina)</span>
            </label>
            <input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="vardas"
              className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
            />
          </>
        ) : null}

        {error ? <p className="mt-4 text-[13.5px] text-warn">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-display text-[15px] font-extrabold text-void transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {busy
            ? "Palauk…"
            : mode === "login"
              ? "Prisijungti"
              : "Sukurti paskyrą"}
        </button>

        <p className="mt-4 text-center text-[12.5px] leading-relaxed text-muted/70">
          {mode === "login"
            ? "Paskyra reikalinga, kad matytum visus savo užsakymus, jų būseną ir istoriją."
            : "Registracija nemokama. Paskyroje matysi visus užsakymus ir jų būseną."}
        </p>
      </form>
    </div>
  );
}
