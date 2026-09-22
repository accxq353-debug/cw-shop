"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { storeToken, useUser, type SessionUser } from "@/lib/useUser";
import { useLanguage } from "@/lib/language";
import { playSound } from "@/lib/audio";

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
  const { t } = useLanguage();
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
      const token = (data.token as string) ?? null;
      storeToken(token);
      setUser(logged);
      playSound("success");

      if (onDone) {
        onDone(logged);
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        if (logged.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/paskyra");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nepavyko prisijungti.");
      playSound("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "" : "panel rounded-2xl p-7 border border-line shadow-2xl"}>
      <div className="flex gap-1 rounded-xl border border-line bg-void p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
              playSound("click");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[13.5px] transition-colors ${
              mode === m
                ? "bg-white/[0.08] font-semibold text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {m === "login" ? <LogIn size={15} /> : <UserPlus size={15} />}
            {m === "login" ? t.signInTab : t.signUpTab}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6">
        {mode === "register" ? (
          <>
            <label className="micro block text-muted/70">{t.nameLabel} *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jūsų vardas / slapyvardis"
              className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
            />
          </>
        ) : null}

        <label className="micro mt-4 block text-muted/70">{t.emailLabel}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vardas@pastas.lt"
          className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
        />

        <label className="micro mt-4 block text-muted/70">{t.passwordLabel} *</label>
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
              {t.discordNameLabel}
            </label>
            <input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="vardas#0000"
              className="mt-2 w-full rounded-xl border border-line bg-void px-4 py-3.5 text-[14.5px] outline-none transition-colors focus:border-signal/60"
            />
          </>
        ) : null}

        {error ? <p className="mt-4 text-[13.5px] text-warn">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-display text-[15px] font-extrabold text-void transition-transform hover:-translate-y-px disabled:opacity-60 shadow-lg hover:shadow-signal/20"
        >
          {busy
            ? "..."
            : mode === "login"
              ? t.submitSignIn
              : t.submitSignUp}
        </button>
      </form>
    </div>
  );
}
